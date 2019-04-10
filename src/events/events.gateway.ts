import { OnGatewayConnection, WebSocketServer, SubscribeMessage, WsResponse, WebSocketGateway } from '@nestjs/websockets';
import { Server, Client } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway(3001)
export class EventsGateway implements OnGatewayConnection{
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('events')
    handleEvent(client: Client, data: unknown): WsResponse<unknown>{
        const event = 'events';
        return { event, data };
    }

    handleConnection(client){
        console.log(client.request.headers);
        console.log(client.id);
        client.emit('connection', 'Successfully connected to server');
    }
}