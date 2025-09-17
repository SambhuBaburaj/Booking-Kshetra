import EZeePMSService from './ezeePmsService';
import { getEzeeConfig, validateEzeeConfig } from '../config/ezeeConfig';
import Booking from '../models/Booking';
import Payment from '../models/Payment';

export interface EZeePaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'net_banking' | 'upi' | 'wallet';
  gatewayId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  returnUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
}

export interface EZeePaymentResponse {
  success: boolean;
  paymentId: string;
  transactionId: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  gatewayResponse: any;
  redirectUrl?: string;
  errorMessage?: string;
}

export class EZeePaymentService {
  private ezeeService: EZeePMSService;

  constructor() {
    const config = getEzeeConfig();
    if (validateEzeeConfig(config)) {
      this.ezeeService = new EZeePMSService(config);
    } else {
      throw new Error('eZee PMS configuration is incomplete');
    }
  }

  async initializePayment(paymentRequest: EZeePaymentRequest): Promise<EZeePaymentResponse> {
    try {
      // Validate booking exists and is in valid state
      const booking = await Booking.findById(paymentRequest.bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.paymentStatus === 'paid') {
        throw new Error('Booking is already paid');
      }

      if (booking.status === 'cancelled') {
        throw new Error('Cannot process payment for cancelled booking');
      }

      // Get available payment gateways from eZee PMS
      const gateways = await this.ezeeService.getPaymentGateways();
      const selectedGateway = gateways.find(g => g.gateway_id === paymentRequest.gatewayId);

      if (!selectedGateway || !selectedGateway.is_active) {
        throw new Error('Invalid or inactive payment gateway');
      }

      // Validate currency
      const currencies = await this.ezeeService.getCurrencies();
      const validCurrency = currencies.find(c => c.currency_code === paymentRequest.currency && c.is_active);

      if (!validCurrency) {
        throw new Error('Invalid or unsupported currency');
      }

      // Process payment through eZee PMS
      const paymentResult = await this.ezeeService.processPayment({
        booking_id: paymentRequest.bookingId,
        amount: paymentRequest.amount,
        payment_method: paymentRequest.paymentMethod,
        gateway_id: paymentRequest.gatewayId
      });

      // Create local payment record
      const paymentRecord = new Payment({
        bookingId: paymentRequest.bookingId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        paymentMethod: paymentRequest.paymentMethod,
        gatewayId: paymentRequest.gatewayId,
        transactionId: paymentResult.transaction_id,
        status: paymentResult.status,
        gatewayResponse: paymentResult
      });

      await paymentRecord.save();

      // Update booking payment status
      if (paymentResult.status === 'success') {
        await Booking.findByIdAndUpdate(paymentRequest.bookingId, {
          paymentStatus: 'paid',
          paymentId: paymentRecord._id.toString()
        });
      }

      return {
        success: paymentResult.status === 'success',
        paymentId: paymentRecord._id.toString(),
        transactionId: paymentResult.transaction_id,
        status: paymentResult.status,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        gatewayResponse: paymentResult,
        redirectUrl: paymentResult.redirect_url,
        errorMessage: paymentResult.error_message
      };

    } catch (error: any) {
      console.error('Payment initialization failed:', error);

      return {
        success: false,
        paymentId: '',
        transactionId: '',
        status: 'failed',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        gatewayResponse: {},
        errorMessage: error.message
      };
    }
  }

  async handlePaymentCallback(
    paymentId: string,
    transactionId: string,
    status: string,
    gatewayResponse: any
  ): Promise<boolean> {
    try {
      // Update local payment record
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment record not found');
      }

      payment.status = status;
      payment.transactionId = transactionId;
      payment.gatewayResponse = { ...payment.gatewayResponse, ...gatewayResponse };
      await payment.save();

      // Update booking status
      const booking = await Booking.findById(payment.bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (status === 'success') {
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        booking.paymentId = paymentId;
      } else if (status === 'failed') {
        booking.paymentStatus = 'failed';
      }

      await booking.save();

      // Sync with eZee PMS
      await this.ezeeService.updateBookingStatus(
        booking._id.toString(),
        status === 'success' ? 'confirmed' : 'pending'
      );

      return true;
    } catch (error) {
      console.error('Payment callback handling failed:', error);
      return false;
    }
  }

  async processRefund(
    paymentId: string,
    amount: number,
    reason?: string
  ): Promise<{ success: boolean; refundId?: string; errorMessage?: string }> {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment record not found');
      }

      if (payment.status !== 'success') {
        throw new Error('Can only refund successful payments');
      }

      if (amount > payment.amount) {
        throw new Error('Refund amount cannot exceed payment amount');
      }

      // Process refund through eZee PMS
      const refundResult = await this.ezeeService.refundPayment(
        payment.transactionId,
        amount,
        reason
      );

      if (refundResult) {
        // Update payment record
        payment.refundAmount = (payment.refundAmount || 0) + amount;
        payment.refundReason = reason;
        payment.refundDate = new Date();

        if (payment.refundAmount >= payment.amount) {
          payment.status = 'refunded';
        }

        await payment.save();

        // Update booking status
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
          if (payment.refundAmount >= payment.amount) {
            booking.paymentStatus = 'refunded';
            booking.status = 'cancelled';
          }
          await booking.save();
        }

        return {
          success: true,
          refundId: payment._id.toString()
        };
      }

      return {
        success: false,
        errorMessage: 'Refund processing failed'
      };

    } catch (error: any) {
      console.error('Refund processing failed:', error);
      return {
        success: false,
        errorMessage: error.message
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const payment = await Payment.findById(paymentId).populate('bookingId');
      if (!payment) {
        throw new Error('Payment record not found');
      }

      return {
        paymentId: payment._id,
        bookingId: payment.bookingId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        createdAt: payment.createdAt,
        refundAmount: payment.refundAmount,
        refundReason: payment.refundReason,
        refundDate: payment.refundDate
      };
    } catch (error) {
      console.error('Failed to get payment status:', error);
      throw error;
    }
  }

  async getAvailablePaymentMethods(): Promise<any[]> {
    try {
      const gateways = await this.ezeeService.getPaymentGateways();
      const currencies = await this.ezeeService.getCurrencies();

      return gateways
        .filter(gateway => gateway.is_active)
        .map(gateway => ({
          gatewayId: gateway.gateway_id,
          gatewayName: gateway.gateway_name,
          supportedCurrencies: gateway.supported_currencies,
          availableCurrencies: currencies.filter(c =>
            gateway.supported_currencies.includes(c.currency_code) && c.is_active
          ),
          commissionRate: gateway.commission_rate,
          paymentMethods: this.getPaymentMethodsForGateway(gateway.gateway_name)
        }));
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      throw error;
    }
  }

  async generatePaymentReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const payments = await Payment.find({
        createdAt: { $gte: startDate, $lte: endDate }
      }).populate('bookingId');

      const report = {
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        totalPayments: payments.length,
        successfulPayments: payments.filter(p => p.status === 'success').length,
        failedPayments: payments.filter(p => p.status === 'failed').length,
        refundedPayments: payments.filter(p => p.status === 'refunded').length,
        totalAmount: payments
          .filter(p => p.status === 'success')
          .reduce((sum, p) => sum + p.amount, 0),
        totalRefunds: payments
          .reduce((sum, p) => sum + (p.refundAmount || 0), 0),
        netRevenue: 0,
        paymentsByMethod: {},
        paymentsByGateway: {},
        dailyBreakdown: []
      };

      report.netRevenue = report.totalAmount - report.totalRefunds;

      // Group by payment method
      const methodGroups = payments.reduce((acc: any, payment) => {
        const method = payment.paymentMethod;
        if (!acc[method]) {
          acc[method] = { count: 0, amount: 0 };
        }
        if (payment.status === 'success') {
          acc[method].count++;
          acc[method].amount += payment.amount;
        }
        return acc;
      }, {});

      report.paymentsByMethod = methodGroups;

      // Group by gateway
      const gatewayGroups = payments.reduce((acc: any, payment) => {
        const gateway = payment.gatewayId;
        if (!acc[gateway]) {
          acc[gateway] = { count: 0, amount: 0 };
        }
        if (payment.status === 'success') {
          acc[gateway].count++;
          acc[gateway].amount += payment.amount;
        }
        return acc;
      }, {});

      report.paymentsByGateway = gatewayGroups;

      return report;
    } catch (error) {
      console.error('Failed to generate payment report:', error);
      throw error;
    }
  }

  async validatePaymentConfiguration(): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check if eZee PMS is accessible
      const isAuthenticated = await this.ezeeService.authenticateHotel();
      if (!isAuthenticated) {
        issues.push('eZee PMS authentication failed');
      }

      // Check payment gateways
      const gateways = await this.ezeeService.getPaymentGateways();
      const activeGateways = gateways.filter(g => g.is_active);

      if (activeGateways.length === 0) {
        issues.push('No active payment gateways configured');
      }

      // Check currencies
      const currencies = await this.ezeeService.getCurrencies();
      const activeCurrencies = currencies.filter(c => c.is_active);

      if (activeCurrencies.length === 0) {
        issues.push('No active currencies configured');
      }

      const baseCurrency = currencies.find(c => c.is_base_currency);
      if (!baseCurrency) {
        issues.push('No base currency configured');
      }

      return {
        isValid: issues.length === 0,
        issues
      };

    } catch (error) {
      issues.push(`Configuration validation failed: ${error.message}`);
      return {
        isValid: false,
        issues
      };
    }
  }

  private getPaymentMethodsForGateway(gatewayName: string): string[] {
    // This is a simplified mapping - in reality, this would come from the gateway configuration
    const methodMappings: { [key: string]: string[] } = {
      'razorpay': ['credit_card', 'debit_card', 'net_banking', 'upi', 'wallet'],
      'payu': ['credit_card', 'debit_card', 'net_banking', 'upi'],
      'ccavenue': ['credit_card', 'debit_card', 'net_banking'],
      'instamojo': ['credit_card', 'debit_card', 'net_banking', 'upi', 'wallet'],
      'paytm': ['wallet', 'upi', 'credit_card', 'debit_card'],
      'phonepe': ['upi', 'wallet'],
      'googlepay': ['upi']
    };

    return methodMappings[gatewayName.toLowerCase()] || ['credit_card', 'debit_card'];
  }
}

export default EZeePaymentService;