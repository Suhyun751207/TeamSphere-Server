import "dotenv/config";
import express from "express";
import { createServer } from "http";
import route from "./route.ts";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "@config/database.ts";
import { redisService } from "@config/redis";

(async () => {
    await connectDB();
    await redisService.connect();
    const app = express();
    const httpServer = createServer(app);
    
    app.use(
        cors({
            origin: [
                "localhost:3000",
                "http://localhost:3000"
            ],
            credentials: true,
        })
    );
    app.use(cookieParser());
    app.use(express.json());

    app.use("/", route);

    const port = +(process.env.PORT ?? 8080);
    httpServer.listen(port, "0.0.0.0", () => {
        console.log(`Server is listening on http://localhost:${port}`);
    });
})();
