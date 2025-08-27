import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "@config/database";
import { initializeSocket } from "@config/socket";
import route from "./route.ts";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8080;

// CORS 설정
app.use(
    cors({
        origin: [
            "localhost:3000",
            "http://localhost:3000"
        ],
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

// API 라우트
app.use("/", route);

// MongoDB 연결 및 Socket.IO 초기화
(async () => {
    await connectDB();
    
    // Socket.IO 초기화
    initializeSocket(server);
    
    const port = +(process.env.PORT ?? 8080);
    server.listen(port, "0.0.0.0", () => {
        console.log(`Server is listening on http://localhost:${port}`);
        console.log(`Socket.IO server is ready`);
    });
})();
