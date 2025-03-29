export interface AgentConfig {
    message: string
    prompt: string;
    tools: Array<ToolConfig>;
}

export interface ToolConfig {
    name: string;
    description: string;
    isRequest: boolean;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    parameters: Record<string, { type: string, description: string }>;
}