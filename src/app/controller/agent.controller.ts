import {Request, Response} from "express";
import {AgentService} from "../service/agent.service";
import {AgentConfig} from "../model/AgentConfig";

export class AgentController {

    public handleAgentConfig(req: Request, res: Response) {
        let config: AgentConfig = req.body;
        const serviceResponse = AgentService.handleConfig(config);
        res.status(200).send(serviceResponse);
    }

    public handleMessage(req: Request, res: Response) {
        let message: string = req.body.message;
        AgentService.handleMessage(message).then((result) => {
            res.status(200).send(result)
        });
    }
}