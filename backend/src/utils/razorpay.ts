import Razorpay from 'razorpay';
import crypto from 'crypto';

export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    console.log("oomb2",process.env.RAZORPAY_KEY_ID);
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || 
        process.env.RAZORPAY_KEY_ID === 'your-razorpay-key-id') {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Razorpay credentials are not configured');
      }
      console.warn('⚠️ Razorpay credentials not configured - using development mode');
    }

    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder123',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret_key_for_dev',
    });
  }

  async createOrder(amount: number, bookingId: string, customerInfo: any) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `receipt_${bookingId}`,
        notes: {
          bookingId,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone
        }
      };

      const order = await this.razorpay.orders.create(options);
      return {
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status
        }
      };
    } catch (error: any) {
      console.error('Razorpay order creation error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create payment order'
      };
    }
  }

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    try {
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  async getPaymentDetails(paymentId: string) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return {
        success: true,
        data: payment
      };
    } catch (error: any) {
      console.error('Failed to fetch payment details:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch payment details'
      };
    }
  }

  async getOrderDetails(orderId: string) {
    try {
      const order = await this.razorpay.orders.fetch(orderId);
      return {
        success: true,
        data: order
      };
    } catch (error: any) {
      console.error('Failed to fetch order details:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch order details'
      };
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    try {
      const refundData: any = {
        payment_id: paymentId,
        notes: {
          reason: reason || 'Booking cancellation',
          timestamp: new Date().toISOString()
        }
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to paise
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundData);
      return {
        success: true,
        data: refund
      };
    } catch (error: any) {
      console.error('Refund creation error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create refund'
      };
    }
  }
}

export const razorpayService = new RazorpayService();