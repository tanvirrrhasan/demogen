export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export enum DemoCategory {
  NONE = "None (General)",
  PRODUCT = "Product Showcase",
  STUDENT = "Student Portrait",
  TEACHER = "Teacher/Instructor",
  STAFF = "Office Staff",
  NATURE = "Nature & Environment",
  TECH = "Technology & AI",
  OFFICE = "Modern Office",
  ABSTRACT = "Abstract Background"
}

export type ImageCount = 2 | 4 | 8 | 16;