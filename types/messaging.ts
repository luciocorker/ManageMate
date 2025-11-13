// Shared types for the messaging system

export interface Friend {
  id: string;
  name: string;
  message: string;
  avatar: string;
  online: boolean;
  // Profile information
  email?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  joinDate?: string;
}

export interface Channel {
  id: string;
  name: string;
  members: number;
  memberNames?: string[];
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  time: string;
  isCurrentUser: boolean;
}
