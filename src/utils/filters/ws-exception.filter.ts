import {
    Catch,
    ArgumentsHost,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(WsException)
export class WSExceptionFilter extends BaseWsExceptionFilter  {
    catch(exception: WsException , host: ArgumentsHost) {
        const client = host.switchToWs().getClient() as WebSocket;
        const data = host.switchToWs().getData();
        const error = exception.getError();
        const details = error instanceof Object ? { ...error } : { message: error };
        client.send(JSON.stringify({
        event: "error",
        data: {
            id: (client as any).id,
            rid: data.rid,
            ...details
        }
        }));
    }
}
