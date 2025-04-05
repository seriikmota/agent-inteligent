import {CachedTools} from "../model/AgentConfig";

const toolsCache: Map<string, CachedTools> = new Map()
const TTL = 60 * 60 * 1000

export default async function toolsMiddleware(req: any, res: any, next: any) {
    try {
        const universityId: string = req.query.universityId

        const cacheEntry = toolsCache.get(universityId)

        if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
            (req as any).tools = cacheEntry.tools
            return next()
        }

        const tools = await getToolsFromAD(universityId)

        toolsCache.set(universityId, {
            tools,
            expiresAt: Date.now() + TTL
        });

        (req as any).tools = tools

        next()
    } catch (error) {
        console.error('Erro no middleware de ferramentas:', error)
        res.status(500).send({ message: 'Erro' })
    }
}



async function getToolsFromAD(universityId: string): Promise<any> {
    try {
        // const response = await fetch('http://localhost:8080', {
        //     method: 'GET',
        //     headers: { 'Content-Type': 'application/json' },
        // });
        //
        // return await response.json()

        if (universityId == '1') {
            return [
                {
                    name: "get_user_by_id",
                    description: "Obter o usuário pelo id",
                    isRequest: true,
                    method: "GET",
                    url: "https://user-api.erikmota.dev/user/{id}",
                    parameters: {
                        id: {
                            type: "number",
                            description: "O id para obter o usuário"
                        }
                    }
                }
            ]
        } else {
            return [
                {
                    name: "get_all_users",
                    description: "Obter todos usuários",
                    isRequest: true,
                    method: "GET",
                    url: "https://user-api.erikmota.dev/user",
                    parameters: {
                        null: {
                            type: "null",
                        }
                    }
                }
            ]
        }
    } catch (error) {
        console.error("Ocorreu um erro ao buscar as ferramentas!", error)
        throw error
    }
}