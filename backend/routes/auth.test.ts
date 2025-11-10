import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './auth';

// Set environment variable for JWT_SECRET
process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.NODE_ENV = 'development';

// Create a test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api', authRoutes);

describe('Auth Routes', () => {
  describe('POST /api/login', () => {
    it('should return 401 and not set a cookie when given incorrect credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'wrong', password: 'wrong' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('should return 200 and set auth_token cookie when given correct credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'admin' })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = response.headers['set-cookie'];
      expect(cookies).toEqual(
        expect.arrayContaining([
          expect.stringContaining('auth_token='),
        ])
      );
      // Verify cookie has httpOnly flag
      expect(cookies[0]).toContain('HttpOnly');
    });
  });

  describe('POST /api/logout', () => {
    it('should return 200 and clear the auth_token cookie', async () => {
      const response = await request(app)
        .post('/api/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logout successful');
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = response.headers['set-cookie'];
      // Check that cookie is being cleared (expires in the past or maxAge=0)
      expect(cookies[0]).toMatch(/auth_token=.*(?:Expires|Max-Age=0)/);
    });
  });
});

