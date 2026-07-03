export interface Profile {
  avatar: string;
  name: string;
  title: string;
  specialties: string[];
  bio: string;
  email: string;
  cvUrl: string;
}

export interface Degree {
  degree: string;
  institution: string;
  year: string;
}

export interface Certification {
  certification: string;
  center: string;
  date: string;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface Project {
  id: string;
  category: "desktop" | "web" | "mobile";
  name: string;
  shortDescription: string;
  description: string;
  image: string;
  gallery: string[];
  technologies: string[];
  features: string[];
  github: string;
  demo: string;
  orientation?: "portrait" | "landscape";
  imageAspectRatio?: string;
  imageContainerClass?: string;
  mediaType?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface WeatherInfo {
  temperature: number;
  humidity: number;
  condition: string;
  city: string;
  country: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}
