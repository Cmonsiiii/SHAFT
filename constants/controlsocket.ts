import { CONTROL_IP } from "./config";

class WebSocketManager {
    private static instance: WebSocketManager | null = null;
    private sockets: { [address: string]: WebSocket } = {};

    private constructor() {}

    static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
            WebSocketManager.instance.connect(CONTROL_IP); // Auto-connect to CONTROL_IP
        }
        return WebSocketManager.instance;
    }

    connect(address: string = CONTROL_IP): void { // Default to CONTROL_IP if no address provided
        if (this.sockets[address]) {
            console.log(`WebSocket is already connected to ${address}`);
            return;
        }

        const socket = new WebSocket(address);
        this.sockets[address] = socket;

        socket.onopen = () => console.log(`Connected to ${address}`);
        socket.onclose = () => {
            console.log(`Disconnected from ${address}`);
            delete this.sockets[address];
        };
        socket.onerror = (error) => {
            console.error(`WebSocket error on ${address}:`, error);
            socket.close();
        };
    }

    disconnect(address: string = CONTROL_IP): void { // Default to CONTROL_IP if no address provided
        const socket = this.sockets[address];
        
        if (socket) {
            socket.close();
            delete this.sockets[address];
            console.log(`Disconnected from ${address}`);
        }
    }

    sendMessage(address: string = CONTROL_IP, message: object): void { // Default to CONTROL_IP if no address provided
        const socket = this.sockets[address];

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        } else {
            console.warn(`WebSocket ${address} is not connected`);
        }
    }
}

export default WebSocketManager;
