export type ProjectStatus = 'Idea' | 'Scripting' | 'Filming' | 'Editing' | 'Published';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  dueDate: string;
  script: string;
  tags: string[];
  videoUrl?: string; // URL for the video player
  thumbnail?: string;
}

export interface Idea {
  id: string;
  content: string;
  createdAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  projectIds: string[];
  isPredefined?: boolean;
}
