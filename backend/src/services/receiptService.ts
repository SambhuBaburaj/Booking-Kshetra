import puppeteer from 'puppeteer';
import { IBooking } from '../models/Booking';

export class ReceiptService {
  private static generateReceiptHTML(booking: any): string {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount);
    };

    const formatDate = (date: Date | string): string => {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatDateTime = (date: Date | string): string => {
      return new Date(date).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Yoga Booking Receipt</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f9f9f9;
                color: #333;
            }
            .receipt-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: bold;
            }
            .header p {
                margin: 5px 0 0 0;
                opacity: 0.9;
                font-size: 16px;
            }
            .receipt-title {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                border-bottom: 2px solid #ff6b35;
            }
            .receipt-title h2 {
                margin: 0;
                color: #ff6b35;
                font-size: 24px;
            }
            .receipt-number {
                color: #666;
                font-size: 14px;
                margin-top: 5px;
            }
            .content {
                padding: 30px;
            }
            .section {
                margin-bottom: 30px;
            }
            .section-title {
                color: #ff6b35;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                padding-bottom: 5px;
                border-bottom: 2px solid #f0f0f0;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 20px;
            }
            .info-item {
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #ff6b35;
            }
            .info-label {
                font-weight: bold;
                color: #666;
                font-size: 14px;
                margin-bottom: 5px;
            }
            .info-value {
                color: #333;
                font-size: 16px;
                word-break: break-all;
            }
            .highlight {
                background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
            }
            .highlight .amount {
                font-size: 28px;
                font-weight: bold;
                margin: 10px 0;
            }
            .yoga-session {
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .yoga-session h3 {
                margin: 0 0 15px 0;
                font-size: 20px;
            }
            .session-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            .session-item {
                background: rgba(255, 255, 255, 0.2);
                padding: 10px;
                border-radius: 5px;
            }
            .participants {
                background: #e3f2fd;
                border: 1px solid #2196f3;
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
            }
            .participants h4 {
                color: #1976d2;
                margin: 0 0 10px 0;
            }
            .participant {
                background: white;
                padding: 10px;
                margin: 8px 0;
                border-radius: 5px;
                border-left: 3px solid #2196f3;
            }
            .footer {
                background: #f8f9fa;
                padding: 25px;
                text-align: center;
                border-top: 2px solid #ff6b35;
            }
            .footer h3 {
                color: #ff6b35;
                margin: 0 0 15px 0;
            }
            .contact-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 20px;
            }
            .thank-you {
                background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
                color: white;
                padding: 20px;
                text-align: center;
                margin-top: 20px;
                border-radius: 8px;
            }
            @media print {
                body { margin: 0; padding: 0; }
                .receipt-container { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <!-- Header -->
            <div class="header">
                <h1>🏖️ Kshetra Retreat Resort</h1>
                <p>Varkala, Kerala | Premium Yoga & Wellness Retreat</p>
            </div>

            <!-- Receipt Title -->
            <div class="receipt-title">
                <h2>🧘‍♀️ Yoga Booking Receipt</h2>
                <div class="receipt-number">Receipt #: YB-${booking._id.toString().slice(-8).toUpperCase()}</div>
            </div>

            <!-- Content -->
            <div class="content">
                <!-- Booking Information -->
                <div class="section">
                    <div class="section-title">📋 Booking Information</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Booking ID</div>
                            <div class="info-value">${booking._id}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Booking Date</div>
                            <div class="info-value">${formatDate(booking.createdAt)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Payment ID</div>
                            <div class="info-value">${booking.paymentId || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Status</div>
                            <div class="info-value" style="color: #28a745; font-weight: bold;">${booking.status.toUpperCase()}</div>
                        </div>
                    </div>
                </div>

                <!-- Customer Information -->
                <div class="section">
                    <div class="section-title">👤 Customer Information</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Primary Guest</div>
                            <div class="info-value">${booking.primaryGuestInfo?.name || booking.guests[0]?.name || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Email</div>
                            <div class="info-value">${booking.primaryGuestInfo?.email || booking.guestEmail || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Phone</div>
                            <div class="info-value">${booking.primaryGuestInfo?.phone || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Total Participants</div>
                            <div class="info-value">${booking.totalGuests} (${booking.adults} Adults, ${booking.children} Children)</div>
                        </div>
                    </div>
                </div>

                <!-- Participants -->
                ${booking.guests && booking.guests.length > 0 ? `
                <div class="section">
                    <div class="participants">
                        <h4>👥 Participant Details</h4>
                        ${booking.guests.map((guest: any, index: number) => `
                            <div class="participant">
                                <strong>${index + 1}. ${guest.name}</strong> (Age: ${guest.age}, ${guest.gender || 'N/A'})
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Yoga Session Details -->
                <div class="section">
                    <div class="yoga-session">
                        <h3>🧘‍♀️ Yoga Session Details</h3>
                        <div class="session-details">
                            <div class="session-item">
                                <strong>Session Type:</strong><br>
                                ${booking.primaryService || 'Yoga Session'}
                            </div>
                            <div class="session-item">
                                <strong>Date:</strong><br>
                                ${formatDate(booking.checkIn)}
                            </div>
                            <div class="session-item">
                                <strong>Instructor:</strong><br>
                                ${booking.yogaSessionId?.instructor || 'TBA'}
                            </div>
                            <div class="session-item">
                                <strong>Location:</strong><br>
                                ${booking.yogaSessionId?.location || 'Kshetra Retreat Resort, Varkala'}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment Information -->
                <div class="section">
                    <div class="section-title">💳 Payment Information</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Yoga Session Price</div>
                            <div class="info-value">${formatCurrency(booking.yogaPrice || 0)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Services Price</div>
                            <div class="info-value">${formatCurrency(booking.servicesPrice || 0)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Total Amount</div>
                            <div class="info-value">${formatCurrency(booking.totalAmount)}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Payment Status</div>
                            <div class="info-value" style="color: #28a745; font-weight: bold;">${booking.paymentStatus.toUpperCase()}</div>
                        </div>
                    </div>

                    <div class="highlight">
                        <div>Final Amount Paid</div>
                        <div class="amount">${formatCurrency(booking.finalAmount || booking.totalAmount)}</div>
                        <div>Payment Date: ${formatDateTime(booking.createdAt)}</div>
                    </div>
                </div>

                ${booking.specialRequests ? `
                <!-- Special Requests -->
                <div class="section">
                    <div class="section-title">📝 Special Requests</div>
                    <div class="info-item">
                        <div class="info-value">${booking.specialRequests}</div>
                    </div>
                </div>
                ` : ''}
            </div>

            <!-- Footer -->
            <div class="footer">
                <h3>Thank You for Choosing Kshetra Retreat Resort! 🙏</h3>
                <p style="margin: 10px 0;">We look forward to welcoming you to our yoga sessions.</p>

                <div class="contact-info">
                    <div>
                        <strong>📧 Email Support</strong><br>
                        info@kshetraretreat.com
                    </div>
                    <div>
                        <strong>📞 Phone Support</strong><br>
                        +91 XXXXXXXXXX
                    </div>
                </div>

                <div class="thank-you">
                    <p style="margin: 0; font-size: 16px;">
                        🌟 Namaste! Enjoy your yoga journey with us! 🌟
                    </p>
                </div>

                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    This is a computer-generated receipt. Please save this for your records.
                    <br>Generated on: ${formatDateTime(new Date())}
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  static async generateReceiptPDF(booking: any): Promise<Buffer> {
    let browser;
    try {
      // Launch browser
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Generate HTML content
      const htmlContent = this.generateReceiptHTML(booking);

      // Set content and generate PDF
      await page.setContent(htmlContent);

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate receipt PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}