import express from "express";
import v1Router from "./v1/route.ts";
const route = express.Router();

route.use("/v1", v1Router);

export default route;
