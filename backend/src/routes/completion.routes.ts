import { Router } from "express";
import { createCompletion, listCompletions } from "../controllers/completion.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const completionRouter = Router();

completionRouter.post("/", authMiddleware, createCompletion);
completionRouter.get("/", authMiddleware, listCompletions);

export default completionRouter;