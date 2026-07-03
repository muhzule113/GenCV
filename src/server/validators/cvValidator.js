import { z } from 'zod';

// CV data shape dari frontend (cvStore)
const cvDataSchema = z.object({
  personal: z.object({
    name: z.string().optional(),
    jobTitle: z.string().optional(),
    email: z.string().email('Email tidak valid').optional().or(z.literal('')),
    phone: z.string().optional(),
    city: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    portfolio: z.string().optional(),
  }).optional(),
  summary: z.string().optional(),
  experiences: z.array(z.object({
    company: z.string().optional(),
    position: z.string().optional(),
    jabatan: z.string().optional(),
    perusahaan: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isCurrent: z.boolean().optional(),
    description: z.array(z.string()).optional(),
    deskripsi: z.array(z.string()).optional(),
  })).optional(),
  educations: z.array(z.object({
    institution: z.string().optional(),
    degree: z.string().optional(),
    field: z.string().optional(),
    gpa: z.number().optional().or(z.string().optional()),
    startYear: z.string().optional(),
    endYear: z.string().optional(),
    start_year: z.string().optional(),
    end_year: z.string().optional(),
  })).optional(),
  skills: z.object({
    technical: z.array(z.union([z.string(), z.object({ name: z.string().optional(), level: z.string().optional() })])).optional(),
    soft: z.array(z.union([z.string(), z.object({ name: z.string().optional(), level: z.string().optional() })])).optional(),
  }).optional(),
  projects: z.array(z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    techStack: z.array(z.string()).optional(),
    tech_stack: z.array(z.string()).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string().optional(),
    issuer: z.string().optional(),
  })).optional(),
  languages: z.array(z.object({
    name: z.string().optional(),
    level: z.string().optional(),
  })).optional(),
}).passthrough();

// Create CV — title required, data optional
export const createCVSchema = z.object({
  title: z.string().min(1, 'Judul CV tidak boleh kosong').max(100, 'Judul CV maksimal 100 karakter'),
  template_id: z.string().optional(),
  data: cvDataSchema.optional(),
});

// Update CV — semua field optional
export const updateCVSchema = z.object({
  title: z.string().min(1, 'Judul CV tidak boleh kosong').max(100, 'Judul CV maksimal 100 karakter').optional(),
  template_id: z.string().optional(),
  data: cvDataSchema.optional(),
});

// Analyze job match — frontend sends cvData (object) + jobDescription
export const analyzeJobMatchSchema = z.object({
  cvData: z.object({}).passthrough().optional(),
  jobDescription: z.string().min(10, 'Deskripsi pekerjaan minimal 10 karakter').max(5000, 'Deskripsi pekerjaan maksimal 5000 karakter'),
});

// Generate summary — frontend sends experiences, skills, targetPosition, tone, language
export const generateSummarySchema = z.object({
  experiences: z.array(z.object({}).passthrough()).optional(),
  skills: z.object({}).passthrough().optional(),
  targetPosition: z.string().optional(),
  target_position: z.string().optional(),
  tone: z.string().optional(),
  language: z.string().optional(),
});
