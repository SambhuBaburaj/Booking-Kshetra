import EZeePMSService from './ezeePmsService';
import Room from '../models/Room';
import Booking from '../models/Booking';
import { getEzeeConfig, validateEzeeConfig } from '../config/ezeeConfig';

export class RoomSyncService {
  private ezeeService: EZeePMSService;

  constructor() {
    const config = getEzeeConfig();
    if (validateEzeeConfig(config)) {
      this.ezeeService = new EZeePMSService(config);
    } else {
      throw new Error('eZee PMS configuration is incomplete');
    }
  }

  async syncRoomInventory(date: Date): Promise<void> {
    try {
      const rooms = await Room.find({ isAvailable: true });
      const inventoryUpdates = [];

      for (const room of rooms) {
        const bookingsOnDate = await this.getBookingsForRoomOnDate(room._id, date);
        const availableRooms = bookingsOnDate.length > 0 ? 0 : 1;

        inventoryUpdates.push({
          room_type_id: room._id.toString(),
          date: date.toISOString().split('T')[0],
          available_rooms: availableRooms,
          rate: room.pricePerNight
        });
      }

      if (inventoryUpdates.length > 0) {
        await this.ezeeService.updateRoomInventory(inventoryUpdates);
        console.log(`Synced inventory for ${inventoryUpdates.length} rooms on ${date.toISOString().split('T')[0]}`);
      }
    } catch (error) {
      console.error('Failed to sync room inventory:', error);
      throw error;
    }
  }

  async syncRoomRates(startDate: Date, endDate: Date): Promise<void> {
    try {
      const rooms = await Room.find({ isAvailable: true });

      for (const room of rooms) {
        await this.ezeeService.updateLinearRates(
          room._id.toString(),
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          room.pricePerNight
        );
      }

      console.log(`Synced rates for ${rooms.length} rooms from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('Failed to sync room rates:', error);
      throw error;
    }
  }

  async syncInventoryForDateRange(startDate: Date, endDate: Date): Promise<void> {
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      await this.syncRoomInventory(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  async getAvailableRoomsForDate(date: Date): Promise<any[]> {
    try {
      const rooms = await Room.find({ isAvailable: true });
      const availableRooms = [];

      for (const room of rooms) {
        const bookingsOnDate = await this.getBookingsForRoomOnDate(room._id, date);

        if (bookingsOnDate.length === 0) {
          availableRooms.push({
            roomId: room._id,
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            capacity: room.capacity,
            pricePerNight: room.pricePerNight,
            amenities: room.amenities
          });
        }
      }

      return availableRooms;
    } catch (error) {
      console.error('Failed to get available rooms:', error);
      throw error;
    }
  }

  async updateRoomAvailability(roomId: string, isAvailable: boolean): Promise<void> {
    try {
      await Room.findByIdAndUpdate(roomId, { isAvailable });

      // Sync with eZee PMS
      const today = new Date();
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3); // 3 months ahead

      if (isAvailable) {
        await this.syncRoomInventory(today);
      } else {
        // Mark as unavailable in eZee PMS
        const inventoryUpdate = {
          room_type_id: roomId,
          date: today.toISOString().split('T')[0],
          available_rooms: 0,
          rate: 0,
          closed_to_arrival: true,
          closed_to_departure: true
        };

        await this.ezeeService.updateRoomInventory([inventoryUpdate]);
      }

      console.log(`Updated room availability for room ${roomId}: ${isAvailable}`);
    } catch (error) {
      console.error('Failed to update room availability:', error);
      throw error;
    }
  }

  async bulkUpdateRates(updates: Array<{roomId: string, newRate: number}>): Promise<void> {
    try {
      const rateUpdates = [];
      const today = new Date();

      for (const update of updates) {
        // Update local database
        await Room.findByIdAndUpdate(update.roomId, { pricePerNight: update.newRate });

        // Prepare eZee PMS update
        rateUpdates.push({
          room_type_id: update.roomId,
          date: today.toISOString().split('T')[0],
          rate: update.newRate
        });
      }

      // Update rates in eZee PMS
      if (rateUpdates.length > 0) {
        await this.ezeeService.updateNonLinearRates(rateUpdates);
      }

      console.log(`Bulk updated rates for ${updates.length} rooms`);
    } catch (error) {
      console.error('Failed to bulk update rates:', error);
      throw error;
    }
  }

  async getOccupancyReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const report = {
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        roomOccupancy: [],
        totalRooms: 0,
        averageOccupancy: 0
      };

      const rooms = await Room.find();
      report.totalRooms = rooms.length;

      const roomOccupancyData = [];

      for (const room of rooms) {
        const bookings = await Booking.find({
          roomId: room._id,
          status: { $in: ['confirmed', 'checked_in', 'checked_out'] },
          $or: [
            { checkIn: { $gte: startDate, $lte: endDate } },
            { checkOut: { $gte: startDate, $lte: endDate } },
            { checkIn: { $lte: startDate }, checkOut: { $gte: endDate } }
          ]
        });

        const occupiedDays = this.calculateOccupiedDays(bookings, startDate, endDate);
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const occupancyRate = (occupiedDays / totalDays) * 100;

        roomOccupancyData.push({
          roomId: room._id,
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          occupiedDays,
          totalDays,
          occupancyRate: Math.round(occupancyRate * 100) / 100
        });
      }

      report.roomOccupancy = roomOccupancyData;
      report.averageOccupancy = Math.round(
        (roomOccupancyData.reduce((sum, room) => sum + room.occupancyRate, 0) / roomOccupancyData.length) * 100
      ) / 100;

      return report;
    } catch (error) {
      console.error('Failed to generate occupancy report:', error);
      throw error;
    }
  }

  private async getBookingsForRoomOnDate(roomId: any, date: Date): Promise<any[]> {
    return await Booking.find({
      roomId: roomId,
      checkIn: { $lte: date },
      checkOut: { $gt: date },
      status: { $in: ['confirmed', 'checked_in'] }
    });
  }

  private calculateOccupiedDays(bookings: any[], startDate: Date, endDate: Date): number {
    let occupiedDays = 0;

    for (const booking of bookings) {
      const bookingStart = new Date(Math.max(booking.checkIn.getTime(), startDate.getTime()));
      const bookingEnd = new Date(Math.min(booking.checkOut.getTime(), endDate.getTime()));

      if (bookingStart < bookingEnd) {
        const days = Math.ceil((bookingEnd.getTime() - bookingStart.getTime()) / (1000 * 60 * 60 * 24));
        occupiedDays += days;
      }
    }

    return occupiedDays;
  }

  async performDailySync(): Promise<void> {
    try {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Sync inventory for today and tomorrow
      await this.syncRoomInventory(today);
      await this.syncRoomInventory(tomorrow);

      // Sync rates for the next 30 days
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      await this.syncRoomRates(today, futureDate);

      console.log('Daily sync completed successfully');
    } catch (error) {
      console.error('Daily sync failed:', error);
      throw error;
    }
  }
}

export default RoomSyncService;