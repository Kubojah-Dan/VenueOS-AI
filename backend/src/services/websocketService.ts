import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

class WebSocketService {
  private io: SocketIOServer | null = null;

  public initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Allow client to join role-based rooms (Ops, Security, Volunteer, Fan)
      socket.on('join-role', (role: string) => {
        socket.join(role);
        console.log(`Client ${socket.id} joined role room: ${role}`);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  public broadcast(event: string, data: any, room?: string) {
    if (!this.io) {
      console.warn('Socket.IO is not initialized yet. Skipping broadcast...');
      return;
    }
    
    if (room) {
      this.io.to(room).emit(event, data);
    } else {
      this.io.emit(event, data);
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;
