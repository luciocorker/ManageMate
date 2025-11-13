import { io, Socket } from "socket.io-client";

// Configure your Socket.IO server URL here
const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:3000";

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  /**
   * Connect to the Socket.IO server
   */
  connect(userName: string): void {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      query: {
        userName,
      },
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  /**
   * Disconnect from the Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log("Socket disconnected manually");
    }
  }

  /**
   * Join a specific channel room
   */
  joinChannel(channelId: string): void {
    if (this.socket) {
      this.socket.emit("join_channel", channelId);
      console.log("Joined channel:", channelId);
    }
  }

  /**
   * Leave a specific channel room
   */
  leaveChannel(channelId: string): void {
    if (this.socket) {
      this.socket.emit("leave_channel", channelId);
      console.log("Left channel:", channelId);
    }
  }

  /**
   * Send a message to a channel
   */
  sendMessage(channelId: string, message: any): void {
    if (this.socket) {
      this.socket.emit("send_message", {
        channelId,
        message,
      });
    }
  }

  /**
   * Listen for new messages in a channel
   */
  onNewMessage(callback: (message: any) => void): void {
    if (this.socket) {
      this.socket.on("new_message", callback);
    }
  }

  /**
   * Remove new message listener
   */
  offNewMessage(): void {
    if (this.socket) {
      this.socket.off("new_message");
    }
  }

  /**
   * Listen for typing indicators
   */
  onUserTyping(
    callback: (data: { userName: string; channelId: string }) => void
  ): void {
    if (this.socket) {
      this.socket.on("user_typing", callback);
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(channelId: string, userName: string): void {
    if (this.socket) {
      this.socket.emit("typing", { channelId, userName });
    }
  }

  /**
   * Check if socket is connected
   */
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Get the socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export a singleton instance
export default new SocketService();
