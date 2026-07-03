import { z } from 'zod';

// Schema untuk login
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

// Schema untuk register
export const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').max(50, 'Password maksimal 50 karakter'),
  name: z.string().min(1, 'Nama tidak boleh kosong').max(100, 'Nama maksimal 100 karakter'),
});

// Schema untuk forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

// Schema untuk reset password
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token tidak boleh kosong'),
  password: z.string().min(6, 'Password minimal 6 karakter').max(50, 'Password maksimal 50 karakter'),
});
