import {ToolConfig} from "../model/AgentConfig";
import {z} from "zod";
import {DynamicStructuredTool} from "@langchain/core/tools";
import {createReactAgent} from "@langchain/langgraph/prebuilt";
import {ChatOpenAI} from "@langchain/openai";
import * as dotenv from "dotenv";
import {PostgresSaver} from "@langchain/langgraph-checkpoint-postgres";
import {pool} from "../../server";

dotenv.config();
const config = { configurable: { thread_id: "1" } };

export class AgentService {
    public static agent: any = null;

    public static async handleMessage(message: string, tools: Array<ToolConfig>) {
        this.agent = await this.createAgent(tools)

        return { message: await this.processMessage(message) }
    }

    private static async processMessage(message: string) {
        let agentOutput = await this.agent.invoke({
            messages: [{
                role: "user",
                content: message
            }],
        }, config);
        return agentOutput.messages[agentOutput.messages.length - 1].content;
    }

    private static async createAgent(tools: Array<ToolConfig>) {
        const checkpointer = new PostgresSaver(pool);
        await checkpointer.setup();

        return createReactAgent({
            llm: this.createLLM(),
            tools: this.createTools(tools),
            checkpointSaver: checkpointer,
            messageModifier: 'Você é um assistente de um sistema de gerenciamento de usuários'
        });
    }

    private static createLLM() {
        return new ChatOpenAI( {model: 'gpt-4o-mini', temperature: 0} )
    }

    private static createTools(tools: Array<ToolConfig>): Array<DynamicStructuredTool> {
        let mountedTools: Array<DynamicStructuredTool> = new Array<DynamicStructuredTool>()

        for (let tool of tools) {
            const schema = z.object(
                Object.keys(tool.parameters).reduce((acc, key) => {
                    const param = tool.parameters[key];
                    switch (param.type) {
                        case 'number': acc[key] = z.number().describe(param.description); break;
                        case 'string': acc[key] = z.string().describe(param.description); break;
                        case 'boolean': acc[key] = z.boolean().describe(param.description); break;
                        case 'null': acc[key] = z.null(); break;
                        default:throw new Error(`Tipo de parâmetro não suportado: ${param.type}`);
                    }
                    return acc;
                }, {} as Record<string, z.ZodType>)
            );

            let mountedTool = new DynamicStructuredTool({
                name: tool.name,
                description: tool.description,
                schema,
                func: async (args: any): Promise<string> => {
                    let finalUrl = tool.url;
                    for (const [key, value] of Object.entries(args)) {
                        if (key != 'null')
                            finalUrl = finalUrl.replace(`{${key}}`, encodeURIComponent((value as string | number | boolean).toString()));
                        else
                            finalUrl = finalUrl.replace(`{${key}}`, encodeURIComponent(''));
                    }

                    const response = await fetch(finalUrl, {
                        method: tool.method,
                        headers: { 'Content-Type': 'application/json' },
                        body: tool.method !== 'GET' ? JSON.stringify(args) : undefined,
                    });
                    const data = await response.json();
                    return JSON.stringify(data);
                }
            });

            mountedTools.push(mountedTool);
        }

        return mountedTools;
    }
}