import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Hardcoded credentials
  if (username === 'admin' && password === 'admin') {
    const token = jwt.sign(
      { username: 'admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.status(200).json({ message: 'Login successful' });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return res.status(200).json({ message: 'Logout successful' });
});

export default router;

