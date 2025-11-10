import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { protect } from './auth';

// Mock environment variable
process.env.JWT_SECRET = 'test-secret-key';

describe('Protect Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      cookies: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('Success cases', () => {
    it('should call next() when a valid JWT cookie is present', () => {
      const token = jwt.sign({ username: 'admin' }, process.env.JWT_SECRET!, {
        expiresIn: '24h',
      });
      mockRequest.cookies = { auth_token: token };

      protect(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toEqual({ username: 'admin' });
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('Failure cases', () => {
    it('should return 401 when no cookie is present', () => {
      mockRequest.cookies = {};

      protect(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized: No token provided',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 when an expired JWT is present', () => {
      const expiredToken = jwt.sign(
        { username: 'admin' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1h' }
      );
      mockRequest.cookies = { auth_token: expiredToken };

      protect(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden: Invalid or expired token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 when a malformed JWT is present', () => {
      mockRequest.cookies = { auth_token: 'invalid-token' };

      protect(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden: Invalid or expired token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 when JWT is signed with wrong secret', () => {
      const wrongSecretToken = jwt.sign(
        { username: 'admin' },
        'wrong-secret',
        { expiresIn: '24h' }
      );
      mockRequest.cookies = { auth_token: wrongSecretToken };

      protect(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden: Invalid or expired token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});

