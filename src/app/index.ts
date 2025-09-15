import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "../config/database";
import { initializeSocket } from "../config/socket";
import { setupSwagger } from "../config/swagger";
import route from "./route";
import path from "path";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8080;

app.use(express.static("build"));

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/build/index.html");
});

app.use(
    cors({
        origin: [
            "localhost:3000",
            "http://localhost:3000",
            "teamsphere-client-production.up.railway.app",
            "https://teamsphere-client-production.up.railway.app",
            "teamsphere-client.railway.internal",
            "https://teamsphere-client.railway.internal",
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
