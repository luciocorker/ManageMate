import socketService from "@/services/socketService";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  isConnected: boolean;
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  sendMessage: (channelId: string, message: any) => void;
  onNewMessage: (callback: (message: any) => void) => void;
  offNewMessage: () => void;
  sendTyping: (channelId: string) => void;
  onUserTyping: (
    callback: (data: { userName: string; channelId: string }) => void
  ) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect when user is authenticated
    if (user) {
      socketService.connect(user.name);
      setIsConnected(true);

      // Cleanup on unmount
      return () => {
        socketService.disconnect();
        setIsConnected(false);
      };
    }
  }, [user]);

  const value: SocketContextType = {
    isConnected,
    joinChannel: (channelId: string) => socketService.joinChannel(channelId),
    leaveChannel: (channelId: string) => socketService.leaveChannel(channelId),
    sendMessage: (channelId: string, message: any) =>
      socketService.sendMessage(channelId, message),
    onNewMessage: (callback: (message: any) => void) =>
      socketService.onNewMessage(callback),
    offNewMessage: () => socketService.offNewMessage(),
    sendTyping: (channelId: string) =>
      socketService.sendTyping(channelId, user?.name || ""),
    onUserTyping: (
      callback: (data: { userName: string; channelId: string }) => void
    ) => socketService.onUserTyping(callback),
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
