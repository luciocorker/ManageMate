// Shared types for the messaging system

export interface Friend {
  id: string;
  name: string;
  message: string;
  avatar: string;
  online: boolean;
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
