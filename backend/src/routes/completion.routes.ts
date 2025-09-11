import { Router } from "express";
import { createCompletion, listCompletions } from "../controllers/completion.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const completionRouter = Router();

completionRouter.post("/", authMiddleware, createCompletion as any);
completionRouter.get("/", authMiddleware, listCompletions as any);

export default completionRouter;