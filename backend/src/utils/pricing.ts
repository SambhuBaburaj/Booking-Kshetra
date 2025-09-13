import { IGuestInfo, ISelectedService } from '../models/Booking';
import { IService } from '../models/Service';

export interface PricingCalculation {
  roomPrice: number;
  foodPrice: number;
  breakfastPrice: number;
  servicesPrice: number;
  transportPrice: number;
  yogaPrice: number;
  totalAmount: number;
  breakdown: {
    nights: number;
    adults: number;
    children: number;
    payingGuests: number; // adults + children over 5
  };
}

export class PricingCalculator {
  private readonly FOOD_PRICE_PER_PERSON_PER_DAY = 150;

  calculateBookingPrice(
    roomPricePerNight: number,
    checkIn: Date,
    checkOut: Date,
    guests: IGuestInfo[],
    includeFood: boolean = true,
    includeBreakfast: boolean = false,
    breakfastPrice: number = 0,
    selectedServices: ISelectedService[] = [],
    transportPrice: number = 0,
    yogaPrice: number = 0
  ): PricingCalculation {
    const nights = this.calculateNights(checkIn, checkOut);
    const adults = guests.filter(guest => !guest.isChild).length;
    const children = guests.filter(guest => guest.isChild && guest.age >= 5).length;
    const payingGuests = adults + children; // Children under 5 are free

    // Room price
    const roomPrice = roomPricePerNight * nights;

    // Food price (₹150 per paying guest per day, free for kids under 5)
    const foodPrice = includeFood ? this.FOOD_PRICE_PER_PERSON_PER_DAY * payingGuests * nights : 0;

    // Breakfast price
    const totalBreakfastPrice = includeBreakfast ? breakfastPrice * payingGuests * nights : 0;

    // Services price
    const servicesPrice = selectedServices.reduce((total, service) => total + service.totalPrice, 0);

    // Total calculation
    const totalAmount = roomPrice + foodPrice + totalBreakfastPrice + servicesPrice + transportPrice + yogaPrice;

    return {
      roomPrice,
      foodPrice,
      breakfastPrice: totalBreakfastPrice,
      servicesPrice,
      transportPrice,
      yogaPrice,
      totalAmount,
      breakdown: {
        nights,
        adults,
        children,
        payingGuests
      }
    };
  }

  calculateServicePrice(
    service: IService,
    quantity: number,
    guests: IGuestInfo[],
    nights: number
  ): number {
    const adults = guests.filter(guest => !guest.isChild).length;
    const children = guests.filter(guest => guest.isChild).length;
    const totalGuests = adults + children;

    switch (service.priceUnit) {
      case 'per_person':
        return service.price * totalGuests * quantity;
      case 'per_day':
        return service.price * quantity * nights;
      case 'per_session':
        return service.price * quantity;
      case 'flat_rate':
        return service.price * quantity;
      default:
        return service.price * quantity;
    }
  }

  calculateTransportPrice(
    pickup: boolean,
    drop: boolean,
    pickupPrice: number = 1500,
    dropPrice: number = 1500
  ): number {
    let total = 0;
    if (pickup) total += pickupPrice;
    if (drop) total += dropPrice;
    return total;
  }

  private calculateNights(checkIn: Date, checkOut: Date): number {
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  validateServiceAge(service: IService, guests: IGuestInfo[]): { valid: boolean; message?: string } {
    if (!service.ageRestriction) {
      return { valid: true };
    }

    const { minAge, maxAge } = service.ageRestriction;

    for (const guest of guests) {
      if (minAge && guest.age < minAge) {
        return {
          valid: false,
          message: `${service.name} requires minimum age of ${minAge}. Guest ${guest.name} is ${guest.age} years old.`
        };
      }
      if (maxAge && guest.age > maxAge) {
        return {
          valid: false,
          message: `${service.name} requires maximum age of ${maxAge}. Guest ${guest.name} is ${guest.age} years old.`
        };
      }
    }

    return { valid: true };
  }
}

export const pricingCalculator = new PricingCalculator();