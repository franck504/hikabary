export enum UserRole {
  ADMIN = "ADMIN",
  INSTITUTION = "INSTITUTION",
  PRO = "PRO",
  BEGINNER = "BEGINNER",
  STUDENT = "STUDENT",
  SPECTATOR = "SPECTATOR"
}

export enum KabaryType {
  FAMADIHANA = "FAMADIHANA",
  FANAMBADIANA = "FANAMBADIANA",
  FANDROANA = "FANDROANA",
  ORATORY_CONTEST = "ORATORY_CONTEST",
  CULTURAL_EVENT = "CULTURAL_EVENT"
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface KabaryContext {
  id: string;
  title: string;
  type: KabaryType;
  description: string;
  rules: string[];
  resources: string[]; // Liste d'URLs vers des documents
  createdBy: string; // User ID
  createdAt: Date;
}
