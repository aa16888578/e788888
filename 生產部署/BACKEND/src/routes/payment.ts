import { Router } from 'express';
import paymentController from '../controllers/payment';
import { authenticateToken } from '../middleware/auth';
import { validateCreatePayment, validatePaymentId } from '../middleware/validation';

const router = Router();

// 所有路由都需要認證
router.use(authenticateToken);

/**
 * @route   POST /api/payments
 * @desc    創建支付
 * @access  Private
 */
router.post('/', validateCreatePayment, paymentController.createPayment);

/**
 * @route   GET /api/payments/:paymentId
 * @desc    檢查支付狀態
 * @access  Private
 */
router.get('/:paymentId', validatePaymentId, paymentController.checkPaymentStatus);

/**
 * @route   GET /api/payments/history
 * @desc    獲取支付歷史
 * @access  Private
 */
router.get('/history', paymentController.getPaymentHistory);

/**
 * @route   POST /api/payments/callback
 * @desc    處理支付回調
 * @access  Public (區塊鏈回調)
 */
router.post('/callback', paymentController.handlePaymentCallback);

/**
 * @route   GET /api/payments/stats
 * @desc    獲取支付統計
 * @access  Private
 */
router.get('/stats', paymentController.getPaymentStats);

export default router;
