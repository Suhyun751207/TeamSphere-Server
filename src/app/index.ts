import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "@config/database";
import { initializeSocket } from "@config/socket";
import { setupSwagger } from "@config/swagger";
import route from "./route.ts";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8080;

app.use(
    cors({
        origin: [
            "localhost:3000",
            "http://localhost:3000",
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
    })
);

app.use(express.json());
app.use(cookieParser());

// Swagger 설정
setupSwagger(app);

app.use("/", route);

(async () => {
    await connectDB();
    
    initializeSocket(server);
    
    const port = +(process.env.PORT ?? 8081);
    server.listen(port, "0.0.0.0", () => {
        console.log(`Server is listening on http://localhost:${port}`);
    });
})();
