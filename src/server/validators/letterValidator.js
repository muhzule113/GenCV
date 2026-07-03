import { z } from 'zod';

// Schema untuk create letter — hanya kolom yang ada di tabel cover_letters
export const createLetterSchema = z.object({
  cv_id: z.string().min(1, 'CV ID harus diisi'),
  position: z.string().min(1, 'Posisi tidak boleh kosong').max(100),
  company: z.string().min(1, 'Nama perusahaan tidak boleh kosong').max(100),
  content: z.string().optional(),
});

// Schema untuk update letter — hanya kolom yang ada di tabel
export const updateLetterSchema = z.object({
  cv_id: z.string().min(1, 'CV ID harus diisi').optional(),
  position: z.string().min(1, 'Posisi tidak boleh kosong').max(100).optional(),
  company: z.string().min(1, 'Nama perusahaan tidak boleh kosong').max(100).optional(),
  content: z.string().optional(),
});

// Schema untuk generate letter
export const generateLetterSchema = z.object({
  cv_id: z.string().min(1, 'CV ID harus diisi'),
  position: z.string().min(1, 'Posisi tidak boleh kosong').max(100),
  company: z.string().min(1, 'Nama perusahaan tidak boleh kosong').max(100),
});
