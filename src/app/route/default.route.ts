import { Router } from "express";
import { DefaultController } from "../controller/default.controller";
import {AgentController} from "../controller/agent.controller";

const defaultRouter = Router();
const defaultController = new DefaultController();
const agentController = new AgentController();

defaultRouter.get("/", defaultController.handle);
defaultRouter.post("/agent/config", agentController.handleAgentConfig);
defaultRouter.post("/agent/message", agentController.handleMessage);

export { defaultRouter };
