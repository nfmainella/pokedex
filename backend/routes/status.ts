import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/status', protect, (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default router;

