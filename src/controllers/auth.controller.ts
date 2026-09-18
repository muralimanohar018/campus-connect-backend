import { Response } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * Controllers only translate HTTP <-> service calls. No business logic here.
 */
export const register = asyncHandler(async (req, res: Response) => {
  const user = await authService.register(req.body);
  return ApiResponse.created(res, 'Account created successfully', user);
});

export const login = asyncHandler(async (req, res: Response) => {
  const result = await authService.login({
    ...req.body,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });
  return ApiResponse.success(res, 'Login successful', result);
});

export const refresh = asyncHandler(async (req, res: Response) => {
  const result = await authService.refresh(req.body.refreshToken);
  return ApiResponse.success(res, 'Token refreshed successfully', result);
});

export const logout = asyncHandler(async (req, res: Response) => {
  await authService.logout(req.body.refreshToken);
  return ApiResponse.success(res, 'Logged out successfully');
});

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await authService.getProfile(req.user!.userId);
  return ApiResponse.success(res, 'Profile fetched successfully', profile);
});
