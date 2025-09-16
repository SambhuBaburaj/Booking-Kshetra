import jsPDF from 'jspdf';

export interface BookingDetails {
  _id: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: Array<{
    name: string;
    age: number;
    gender: string;
  }>;
  primaryGuestInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
  };
  totalAmount: number;
  roomPrice: number;
  foodPrice?: number;
  breakfastPrice?: number;
  servicesPrice?: number;
  transportPrice?: number;
  paymentStatus: string;
  paymentId?: string;
  status: string;
  createdAt: string;
  roomDetails?: {
    roomNumber: string;
    roomType: string;
    description: string;
  };
}

export const generateReceipt = (booking: BookingDetails) => {
  // Create new PDF document
  const pdf = new jsPDF('p', 'mm', 'a4');

  // Colors
  const primaryColor = [44, 90, 160]; // Blue
  const secondaryColor = [102, 102, 102]; // Gray
  const successColor = [34, 197, 94]; // Green

  // Header
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, 0, 210, 40, 'F');

  // Resort Logo/Name
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Kshetra Retreat Resort', 15, 20);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Kerala, India', 15, 28);
  pdf.text('Phone: +91 9876543210 | Email: booking@kshetraresort.com', 15, 35);

  // Receipt Title
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BOOKING RECEIPT', 15, 55);

  // Receipt Info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Receipt Date: ${new Date().toLocaleDateString()}`, 140, 55);

  // Booking Details Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Booking Details', 15, 75);

  // Draw line
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setLineWidth(0.5);
  pdf.line(15, 78, 195, 78);

  let yPos = 90;

  // Booking ID
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Booking ID:', 15, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(booking._id, 60, yPos);

  // Status with color
  pdf.setFont('helvetica', 'bold');
  pdf.text('Status:', 120, yPos);
  pdf.setTextColor(successColor[0], successColor[1], successColor[2]);
  pdf.text(booking.status.toUpperCase(), 145, yPos);
  pdf.setTextColor(0, 0, 0);

  yPos += 10;

  // Check-in/Check-out
  pdf.setFont('helvetica', 'bold');
  pdf.text('Check-in:', 15, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date(booking.checkIn).toLocaleDateString(), 60, yPos);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Check-out:', 120, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date(booking.checkOut).toLocaleDateString(), 160, yPos);

  yPos += 10;

  // Room details
  if (booking.roomDetails) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Room:', 15, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${booking.roomDetails.roomNumber} (${booking.roomDetails.roomType})`, 60, yPos);
  }

  yPos += 10;

  // Guests
  pdf.setFont('helvetica', 'bold');
  pdf.text('Guests:', 15, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${booking.guests.length} Guest(s)`, 60, yPos);

  yPos += 15;

  // Guest Information Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Guest Information', 15, yPos);

  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.line(15, yPos + 3, 195, yPos + 3);

  yPos += 15;

  // Primary Guest
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Primary Guest:', 15, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(booking.primaryGuestInfo.name, 60, yPos);

  yPos += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Email:', 15, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(booking.primaryGuestInfo.email, 60, yPos);

  yPos += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Phone:', 15, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(booking.primaryGuestInfo.phone, 60, yPos);

  yPos += 15;

  // Payment Details Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Payment Details', 15, yPos);

  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.line(15, yPos + 3, 195, yPos + 3);

  yPos += 15;

  // Payment breakdown
  const breakdownItems = [
    { label: 'Room Charges', amount: booking.roomPrice },
    ...(booking.foodPrice ? [{ label: 'Food Charges', amount: booking.foodPrice }] : []),
    ...(booking.breakfastPrice ? [{ label: 'Breakfast Charges', amount: booking.breakfastPrice }] : []),
    ...(booking.servicesPrice ? [{ label: 'Additional Services', amount: booking.servicesPrice }] : []),
    ...(booking.transportPrice ? [{ label: 'Transport Charges', amount: booking.transportPrice }] : []),
  ];

  pdf.setFontSize(12);

  breakdownItems.forEach(item => {
    pdf.setFont('helvetica', 'normal');
    pdf.text(item.label + ':', 15, yPos);
    pdf.text(`₹${item.amount.toLocaleString()}`, 160, yPos, { align: 'right' });
    yPos += 8;
  });

  // Total line
  pdf.setDrawColor(0, 0, 0);
  pdf.line(15, yPos, 195, yPos);
  yPos += 8;

  // Total Amount
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Total Amount:', 15, yPos);
  pdf.text(`₹${booking.totalAmount.toLocaleString()}`, 160, yPos, { align: 'right' });

  yPos += 10;

  // Payment Status
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Payment Status:', 15, yPos);
  pdf.setTextColor(successColor[0], successColor[1], successColor[2]);
  pdf.text(booking.paymentStatus.toUpperCase(), 80, yPos);
  pdf.setTextColor(0, 0, 0);

  if (booking.paymentId) {
    yPos += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment ID:', 15, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(booking.paymentId, 80, yPos);
  }

  yPos += 20;

  // Terms and Conditions
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Important Information', 15, yPos);

  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.line(15, yPos + 3, 195, yPos + 3);

  yPos += 15;

  const terms = [
    '• Check-in time: 2:00 PM',
    '• Check-out time: 12:00 PM',
    '• Please carry a valid ID proof for check-in',
    '• For cancellations, contact us at least 24 hours in advance',
    '• Contact front desk for any assistance during your stay'
  ];

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  terms.forEach(term => {
    pdf.text(term, 15, yPos);
    yPos += 6;
  });

  // Footer
  yPos = 280;
  pdf.setFontSize(10);
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.text('Thank you for choosing Kshetra Retreat Resort!', 105, yPos, { align: 'center' });
  pdf.text('We look forward to hosting you.', 105, yPos + 5, { align: 'center' });

  // Generate filename
  const filename = `Booking_Receipt_${booking._id}_${new Date().toISOString().split('T')[0]}.pdf`;

  // Save the PDF
  pdf.save(filename);
};