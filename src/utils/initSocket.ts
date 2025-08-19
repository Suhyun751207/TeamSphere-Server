import { Server as SocketServer, ServerOptions } from 'socket.io';
import { Server as HttpServer } from 'http';

interface SocketConfig {
	httpServer?: HttpServer;
	cors?: {
		origin?: string | string[];
		methods?: string[];
	};
	serverOptions?: Partial<ServerOptions>;
}
export default async function initSocket(
	httpServer: HttpServer,
	callback: (io: SocketServer) => Promise<void>,
	config: SocketConfig = {}
) {
	const {
		cors = {
			origin: '*',
			methods: ['GET', 'POST']
		},
		serverOptions = {}
	} = config;
	const io = new SocketServer(httpServer, {
		cors,
		...serverOptions
	});

	await callback(io);
	return io;
}