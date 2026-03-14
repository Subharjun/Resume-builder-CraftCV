"use client";

import { useState, useCallback } from "react";
import {
  ResumeData,
  PersonalInfo,
  Experience,
  Education,
  Project,
} from "@/types/resume";

export const emptyData: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    title: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  customSections: [],
};

const defaultData: ResumeData = {
  // ... existing personalInfo, summary, experience, education, skills, projects
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
    "Passionate and results-driven Full Stack Engineer with 4+ years of experience building scalable web applications. Adept at React, Node.js, and cloud infrastructure.",
  experience: [
    {
      id: "exp-1",
      company: "Acme Corp",
      role: "Senior Software Engineer",
      startDate: "Jan 2022",
      endDate: "",
      current: true,
      description:
        "• Led development of a customer-facing dashboard serving 200K+ daily users.\n• Architected microservices migration from monolith.",
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "UC Berkeley",
      degree: "B.Tech",
      field: "Computer Science",
      startDate: "2018",
      endDate: "2022",
      gpa: "3.8",
    },
  ],
  skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
  projects: [],
  customSections: [
    {
      id: "cust-1",
      title: "ACHIEVEMENTS",
      content: "<ul><li><b>Hack4Bengal 4.0</b>: Secured top 10 position out of 500+ teams.</li><li><b>AWS Certified</b>: Designing Blockchain Solutions.</li></ul>"
    }
  ],
};

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useResumeData(initialData?: ResumeData) {
  const [data, setData] = useState<ResumeData>(initialData ?? defaultData);

  const loadData = useCallback((loaded: ResumeData) => {
    setData(loaded);
  }, []);

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

  // Custom Sections
  const addCustomSection = useCallback((title: string = "NEW SECTION") => {
    const newSec = {
      id: generateId(),
      title,
      content: "",
    };
    setData((prev) => ({
      ...prev,
      customSections: [...prev.customSections, newSec],
    }));
  }, []);

  const updateCustomSection = useCallback((id: string, updates: Partial<any>) => {
    setData((prev) => ({
      ...prev,
      customSections: prev.customSections.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  }, []);

  const removeCustomSection = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((s) => s.id !== id),
    }));
  }, []);

  const moveSectionItem = useCallback((section: keyof ResumeData, id: string, direction: "up" | "down") => {
    setData((prev) => {
      const arr = prev[section];
      if (!Array.isArray(arr)) return prev;
      const copy = [...arr];
      const index = copy.findIndex((item: any) => item.id === id);
      if (index === -1) return prev;
      
      if (direction === "up" && index > 0) {
        [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      } else if (direction === "down" && index < copy.length - 1) {
        [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
      } else {
        return prev;
      }
      return { ...prev, [section]: copy };
    });
  }, []);

  return {
    data,
    loadData,
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
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    moveSectionItem,
  };
}
