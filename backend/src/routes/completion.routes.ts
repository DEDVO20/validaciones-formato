import { Router } from "express";
import { createCompletion, listCompletions, updateCompletion } from "../controllers/completion.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const completionRouter = Router();

completionRouter.post("/", authMiddleware, createCompletion as any);
completionRouter.get("/", authMiddleware, listCompletions as any);
completionRouter.put("/:id", authMiddleware, updateCompletion as any);

export default completionRouter;