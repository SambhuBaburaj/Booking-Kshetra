import express from 'express';
import { Accommodation } from '../models';

const router = express.Router();

// Public endpoint to get all active accommodations
export const getAccommodations = async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const accommodations = await Accommodation.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .select('-createdAt -updatedAt -__v');

    res.json({
      success: true,
      data: { accommodations }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get accommodations'
    });
  }
};

// Public routes
router.get('/', getAccommodations);

export default router;