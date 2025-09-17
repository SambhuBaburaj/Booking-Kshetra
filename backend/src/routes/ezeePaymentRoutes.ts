import express from 'express';
import EZeePaymentService from '../services/ezeePaymentService';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, query, param } from 'express-validator';

const router = express.Router();
const ezeePaymentService = new EZeePaymentService();

// Payment Initialization Route
router.post('/initialize',
  authenticateToken,
  [
    body('bookingId').isMongoId(),
    body('amount').isFloat({ min: 0 }),
    body('currency').isString().isLength({ min: 3, max: 3 }),
    body('paymentMethod').isIn(['credit_card', 'debit_card', 'net_banking', 'upi', 'wallet']),
    body('gatewayId').isString().notEmpty(),
    body('customerInfo.name').isString().notEmpty(),
    body('customerInfo.email').isEmail(),
    body('customerInfo.phone').isMobilePhone('any'),
    body('returnUrl').optional().isURL(),
    body('cancelUrl').optional().isURL(),
    body('webhookUrl').optional().isURL(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const paymentResponse = await ezeePaymentService.initializePayment(req.body);

      res.json({
        success: paymentResponse.success,
        data: paymentResponse,
        message: paymentResponse.success ? 'Payment initialized successfully' : 'Payment initialization failed'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to initialize payment',
        error: error.message
      });
    }
  }
);

// Payment Callback Route (Webhook)
router.post('/callback',
  [
    body('paymentId').isString().notEmpty(),
    body('transactionId').isString().notEmpty(),
    body('status').isIn(['pending', 'success', 'failed', 'cancelled']),
    body('gatewayResponse').isObject(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { paymentId, transactionId, status, gatewayResponse } = req.body;

      const success = await ezeePaymentService.handlePaymentCallback(
        paymentId,
        transactionId,
        status,
        gatewayResponse
      );

      res.json({
        success,
        message: success ? 'Payment callback processed successfully' : 'Failed to process payment callback'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to process payment callback',
        error: error.message
      });
    }
  }
);

// Payment Status Route
router.get('/status/:paymentId',
  authenticateToken,
  [
    param('paymentId').isMongoId(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { paymentId } = req.params;
      const paymentStatus = await ezeePaymentService.getPaymentStatus(paymentId);

      res.json({
        success: true,
        data: paymentStatus
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get payment status',
        error: error.message
      });
    }
  }
);

// Refund Route
router.post('/refund',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('paymentId').isMongoId(),
    body('amount').isFloat({ min: 0 }),
    body('reason').optional().isString(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { paymentId, amount, reason } = req.body;

      const refundResult = await ezeePaymentService.processRefund(paymentId, amount, reason);

      res.json({
        success: refundResult.success,
        data: refundResult,
        message: refundResult.success ? 'Refund processed successfully' : refundResult.errorMessage
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: error.message
      });
    }
  }
);

// Available Payment Methods Route
router.get('/methods',
  async (req, res) => {
    try {
      const paymentMethods = await ezeePaymentService.getAvailablePaymentMethods();

      res.json({
        success: true,
        data: { paymentMethods }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get payment methods',
        error: error.message
      });
    }
  }
);

// Payment Report Route
router.get('/reports',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    query('startDate').isISO8601(),
    query('endDate').isISO8601(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const report = await ezeePaymentService.generatePaymentReport(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        success: true,
        data: { report }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate payment report',
        error: error.message
      });
    }
  }
);

// Configuration Validation Route
router.get('/validate-config',
  authenticateToken,
  authorizeRoles(['admin']),
  async (req, res) => {
    try {
      const validation = await ezeePaymentService.validatePaymentConfiguration();

      res.json({
        success: validation.isValid,
        data: validation,
        message: validation.isValid ? 'Payment configuration is valid' : 'Payment configuration has issues'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to validate payment configuration',
        error: error.message
      });
    }
  }
);

export default router;