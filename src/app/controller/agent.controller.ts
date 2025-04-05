import {Request, Response} from "express";
import {AgentService} from "../service/agent.service";
import { ToolConfig} from "../model/AgentConfig";

export class AgentController {

    public handleMessage(req: Request, res: Response) {
        let message: string = req.body.message
        let tools: Array<ToolConfig> = (req as any).tools

        AgentService.handleMessage(message, tools).then((result) => {
            res.status(200).send(result)
        })
    }
}