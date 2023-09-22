// import { IoAdapter } from "@nestjs/platform-socket.io";
// import { ServerOptions } from "socket.io";
// const { useAzureSocketIO } = require("@azure/web-pubsub-socket.io");

// export class AzureSocketIO extends IoAdapter{
//     createIOServer(port: number, options?: ServerOptions): any {
//         const server = super.createIOServer(port, options);
//         useAzureSocketIO(server, {
//             hub: "Hub",
//             connectionString: 'Endpoint=https://gop-taxi.webpubsub.azure.com;AccessKey=HaiyEIfWOHxbB1qJnD457T9sexdibFHOU0FJGVUpybk=;Version=1.0;'
//            });
//         return server;
//     }
// }