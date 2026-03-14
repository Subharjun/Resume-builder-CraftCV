export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  title: string; // e.g. "Senior Software Engineer"
  photoUrl?: string;
  themeColor?: string;
  textColor?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string; // Rich Text HTML
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  customSections: CustomSection[];
  sectionOrder?: string[]; // IDs or keys of sections
}

export type TemplateId = "minimalist" | "executive" | "creative";

export type FormSection =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "custom";

export interface TemplateProps {
  data: ResumeData;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;
  updateExperience: (id: string, updates: Partial<Experience>) => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateSkills: (skills: string[]) => void;
  updateCustomSection: (id: string, updates: Partial<CustomSection>) => void;
  addCustomSection: (title: string) => void;
  removeCustomSection: (id: string) => void;
}
