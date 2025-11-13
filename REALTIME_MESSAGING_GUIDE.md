# Real-Time Messaging with Socket.IO

## Overview

ManageMate now supports real-time messaging using Socket.IO. This allows users to send and receive messages instantly without refreshing or polling.

## Architecture

### Client-Side (React Native)

- **Socket Service** (`services/socketService.ts`): Manages WebSocket connections
- **Socket Context** (`contexts/SocketContext.tsx`): Provides Socket.IO functionality across the app
- **Chat Screens**: `ChatScreen.tsx` and `ChannelChatScreen.tsx` use Socket.IO for real-time messaging

### Server-Side (Node.js)

- **Socket Server** (`socket-server.js`): Handles WebSocket connections and message broadcasting

## Setup Instructions

### 1. Install Dependencies

The client-side dependencies are already installed:

```bash
npm install socket.io-client
```

### 2. Set Up the Socket.IO Server

#### Option A: Local Development

1. Create a new directory for your server:

```bash
mkdir socket-server
cd socket-server
npm init -y
npm install express socket.io cors
```

2. Copy `socket-server.js` to your server directory

3. Run the server:

```bash
node socket-server.js
```

The server will run on `http://localhost:3000`

#### Option B: Deploy to Production

Deploy the Socket.IO server to a cloud provider:

**Heroku:**

```bash
heroku create your-app-name
git push heroku main
```

**Railway:**

- Connect your GitHub repo
- Railway will auto-detect and deploy

**DigitalOcean/AWS:**

- Deploy as a Node.js app
- Ensure WebSocket support is enabled

### 3. Configure the Socket URL

Create or update your `.env` file:

```env
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

For production, update to your deployed server URL:

```env
EXPO_PUBLIC_SOCKET_URL=https://your-socket-server.com
```

## How It Works

### Direct Messages (1-on-1)

1. When a user opens a chat with a friend, they join a unique room: `user1_user2` (sorted alphabetically)
2. Messages are sent to Supabase (for persistence) and via Socket.IO (for real-time delivery)
3. Both users receive messages instantly when connected

### Channel Messages (Group Chat)

1. Users join a channel room using the channel ID
2. Messages are broadcast to all users in that channel
3. Messages are saved to Supabase and sent via Socket.IO simultaneously

### Connection Flow

1. User authenticates → Socket connects with username
2. User opens chat/channel → Joins room
3. User sends message → Saved to DB + Sent via socket
4. Other users receive message instantly
5. User closes chat → Leaves room
6. User logs out → Socket disconnects

## Features

### ✅ Implemented

- Real-time message delivery
- Automatic connection on login
- Room-based messaging (channels and DMs)
- Message persistence via Supabase
- Graceful reconnection handling

### 🚧 Future Enhancements

- Typing indicators
- Read receipts
- Online/offline status
- Message reactions in real-time
- Push notifications integration
- File/image sharing

## API Reference

### Socket Events

#### Client → Server

- `join_channel(channelId)`: Join a room
- `leave_channel(channelId)`: Leave a room
- `send_message({ channelId, message })`: Send a message
- `typing({ channelId, userName })`: Send typing indicator

#### Server → Client

- `new_message(message)`: Receive a new message
- `user_typing({ userName, channelId })`: Someone is typing
- `connect`: Connection established
- `disconnect`: Connection lost

### Socket Service Methods

```typescript
// Connect to server
socketService.connect(userName: string): void

// Disconnect from server
socketService.disconnect(): void

// Join a channel/room
socketService.joinChannel(channelId: string): void

// Leave a channel/room
socketService.leaveChannel(channelId: string): void

// Send a message
socketService.sendMessage(channelId: string, message: any): void

// Listen for new messages
socketService.onNewMessage(callback: (message: any) => void): void

// Remove message listener
socketService.offNewMessage(): void

// Check connection status
socketService.isSocketConnected(): boolean
```

## Testing

### Test Real-Time Messaging

1. Open the app on two devices/simulators
2. Log in as different users
3. Start a conversation
4. Send messages from one device
5. Verify messages appear instantly on the other device

### Debug Mode

Monitor Socket.IO events in the console:

```javascript
// In socketService.ts, events are logged:
console.log("Socket connected:", this.socket?.id);
console.log("Joined channel:", channelId);
```

## Troubleshooting

### Messages Not Arriving in Real-Time

- Check if Socket.IO server is running
- Verify `EXPO_PUBLIC_SOCKET_URL` is correct
- Check console for connection errors
- Ensure both users are in the same room

### Connection Issues

- Verify server allows WebSocket connections
- Check CORS settings on server
- Ensure network allows WebSocket traffic
- Try reconnecting: restart the app

### Performance

- Monitor server logs for errors
- Check for memory leaks in long-running connections
- Consider using Redis for scaling (Socket.IO adapter)

## Production Considerations

### Scaling

For production with many users:

1. Use Socket.IO Redis adapter for horizontal scaling
2. Load balance multiple Socket.IO servers
3. Monitor connection counts and memory usage

### Security

1. Implement authentication tokens in Socket.IO handshake
2. Validate user permissions before joining rooms
3. Sanitize message content
4. Rate limit message sending

### Monitoring

- Track connection/disconnection rates
- Monitor message delivery times
- Log errors and failed connections
- Set up health checks

## Migration Notes

The app still saves all messages to Supabase for persistence. Socket.IO only handles real-time delivery. This means:

- Messages work even if Socket.IO is temporarily unavailable
- Historical messages are loaded from Supabase
- Real-time updates are an enhancement, not a requirement

## Next Steps

1. Deploy the Socket.IO server
2. Update the socket URL in your `.env`
3. Test with multiple users
4. Implement typing indicators (optional)
5. Add push notifications for offline users
