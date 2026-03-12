"use client";

import { useState, useCallback } from "react";
import {
  ResumeData,
  PersonalInfo,
  Experience,
  Education,
  Project,
} from "@/types/resume";

const defaultData: ResumeData = {
  personalInfo: {
    fullName: "Alex Johnson",
    email: "alex@example.com",
    phone: "+1 (555) 000-0000",
    location: "San Francisco, CA",
    website: "alexjohnson.dev",
    linkedin: "linkedin.com/in/alexjohnson",
    title: "Full Stack Engineer",
  },
  summary:
    "Passionate and results-driven Full Stack Engineer with 4+ years of experience building scalable web applications. Adept at React, Node.js, and cloud infrastructure. I turn complex problems into elegant solutions.",
  experience: [
    {
      id: "exp-1",
      company: "Acme Corp",
      role: "Senior Software Engineer",
      startDate: "Jan 2022",
      endDate: "",
      current: true,
      description:
        "• Led development of a customer-facing dashboard serving 200K+ daily users, reducing load time by 40%.\n• Architected microservices migration from monolith, improving deployment frequency by 3x.\n• Mentored a team of 5 junior engineers.",
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of California, Berkeley",
      degree: "B.Tech",
      field: "Computer Science",
      startDate: "Aug 2018",
      endDate: "May 2022",
      gpa: "3.8",
    },
  ],
  skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker", "Next.js", "Python"],
  projects: [
    {
      id: "proj-1",
      name: "CraftCV",
      description: "An AI-powered resume builder that helps job seekers create stunning resumes in minutes using Groq AI and modern web technologies.",
      url: "craftcv.dev",
      technologies: "Next.js, TypeScript, Supabase, Groq AI",
    },
  ],
};

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useResumeData() {
  const [data, setData] = useState<ResumeData>(defaultData);

  const updatePersonalInfo = useCallback((info: Partial<PersonalInfo>) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info },
    }));
  }, []);

  const updateSummary = useCallback((summary: string) => {
    setData((prev) => ({ ...prev, summary }));
  }, []);

  const updateSkills = useCallback((skills: string[]) => {
    setData((prev) => ({ ...prev, skills }));
  }, []);

  // Experience
  const addExperience = useCallback(() => {
    const newExp: Experience = {
      id: generateId(),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    setData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }));
  }, []);

  const updateExperience = useCallback((id: string, updates: Partial<Experience>) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  }, []);

  const deleteExperience = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  }, []);

  // Education
  const addEducation = useCallback(() => {
    const newEdu: Education = {
      id: generateId(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
    };
    setData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  }, []);

  const updateEducation = useCallback((id: string, updates: Partial<Education>) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  }, []);

  const deleteEducation = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  }, []);

  // Projects
  const addProject = useCallback(() => {
    const newProj: Project = {
      id: generateId(),
      name: "",
      description: "",
      url: "",
      technologies: "",
    };
    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProj],
    }));
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  }, []);

  return {
    data,
    updatePersonalInfo,
    updateSummary,
    updateSkills,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
    addProject,
    updateProject,
    deleteProject,
  };
}
