import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params

    // In a real app, you would fetch booking details from database
    // For now, using mock data
    const bookingDetails = {
      bookingId,
      customerName: 'Demo Customer',
      customerEmail: 'demo@example.com',
      customerPhone: '+91 9999999999',
      sessionType: 'Yoga Session',
      date: new Date().toLocaleDateString('en-IN'),
      time: '7:00 AM - 8:30 AM',
      instructor: 'Demo Instructor',
      location: 'Kshetra Retreat Resort, Varkala',
      amount: 1500,
      paymentId: 'pay_demo123',
      orderId: 'order_demo123',
      bookingDate: new Date().toLocaleDateString('en-IN')
    }

    // Create HTML content for the receipt
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Yoga Booking Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #f97316;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #f97316;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .title {
              text-align: center;
              font-size: 24px;
              margin: 30px 0;
              color: #333;
            }
            .section {
              margin: 25px 0;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 8px;
            }
            .section h3 {
              margin-top: 0;
              color: #374151;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              padding: 5px 0;
            }
            .detail-row:nth-child(even) {
              background-color: #f9fafb;
              margin: 10px -15px;
              padding: 5px 15px;
            }
            .label {
              font-weight: bold;
              color: #374151;
            }
            .value {
              color: #111827;
            }
            .amount {
              color: #059669;
              font-weight: bold;
              font-size: 18px;
            }
            .status {
              color: #059669;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
            .booking-id {
              font-family: monospace;
              background-color: #f3f4f6;
              padding: 2px 6px;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KSHETRA RETREAT RESORT</h1>
            <p>Varkala Beach, Kerala</p>
          </div>

          <div class="title">YOGA BOOKING RECEIPT</div>

          <div class="section">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span class="label">Booking ID:</span>
              <span class="value booking-id">${bookingDetails.bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Customer Name:</span>
              <span class="value">${bookingDetails.customerName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${bookingDetails.customerEmail}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">${bookingDetails.customerPhone}</span>
            </div>
            <div class="detail-row">
              <span class="label">Booking Date:</span>
              <span class="value">${bookingDetails.bookingDate}</span>
            </div>
          </div>

          <div class="section">
            <h3>Session Details</h3>
            <div class="detail-row">
              <span class="label">Session Type:</span>
              <span class="value">${bookingDetails.sessionType}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date & Time:</span>
              <span class="value">${bookingDetails.date} | ${bookingDetails.time}</span>
            </div>
            <div class="detail-row">
              <span class="label">Instructor:</span>
              <span class="value">${bookingDetails.instructor}</span>
            </div>
            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">${bookingDetails.location}</span>
            </div>
          </div>

          <div class="section">
            <h3>Payment Details</h3>
            <div class="detail-row">
              <span class="label">Amount Paid:</span>
              <span class="value amount">₹${bookingDetails.amount.toLocaleString('en-IN')}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment ID:</span>
              <span class="value">${bookingDetails.paymentId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Order ID:</span>
              <span class="value">${bookingDetails.orderId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Status:</span>
              <span class="value status">PAID</span>
            </div>
          </div>

          <div class="footer">
            <p><strong>Thank you for choosing Kshetra Retreat Resort!</strong></p>
            <p>For any queries, contact us at info@kshetraretreat.com | +91 XXXXXXXXXX</p>
            <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
          </div>
        </body>
      </html>
    `

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })

    await browser.close()

    // Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="yoga-booking-receipt-${bookingId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    )
  }
}