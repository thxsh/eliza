import {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    type Action,
    elizaLogger,
    composeContext,
    generateObjectDeprecated,
    ModelClass,
    UUID,
} from "@elizaos/core";
import { v4 } from "uuid";
import { WalletProvider, walletProvider } from "../providers/wallet";
import { kiwiProvider, KiwiProvider } from "../providers/kiwi";
// import { Connection, PublicKey } from "@solana/web3.js";
const checkServicesTemplate = `Respond with a JSON object containing only the required values.

Example response:
\`\`\`json
{
    "service": "A7bZNLKxgamoKSgWWMFXRrzQXdjB1nJuLxhd2dy26krt"
}
\`\`\`


Given your bio and your intentions, determine if you want to buy any of the services listed on kiwi.markets.

Bio: {{bio}}

Services: {{services}}

Following information is required to add the service to kiwi.markets:
- Solana public key of the service from the provided list of services

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined. The result should be a valid JSON object with the following schema:
\`\`\`json
{
    "service": string | null
}
\`\`\``;

// Check out all services on kiwi.markets
export const checkServices: Action = {
    name: "CHECK_SERVICES",
    similes: ["CHECK_SERVICES", "SEARCH_SERVICES"],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        // Check if the necessary parameters are provided in the message
        elizaLogger.log("Message:", message);
        return true;
    },
    description:
        "Chech out all services on kiwi.markets and determine if you want to buy any of them",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        _callback?: HandlerCallback
    ): Promise<boolean> => {
        // composeState
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        const wallet: WalletProvider = await walletProvider.get(
            runtime,
            message,
            state
        );

        const balance = await wallet.getSolBalance();
        elizaLogger.log("Balance:", balance);

        const kiwi: KiwiProvider = await kiwiProvider.get(
            runtime,
            message,
            state
        );

        const services = await kiwi.getServices();
        elizaLogger.log("Services:", JSON.stringify(services, null, 2));

        const memoryId = v4() as UUID;

        await runtime.messageManager.createMemory({
            id: memoryId,
            agentId: message.agentId,
            roomId: message.roomId,
            userId: message.userId,
            content: {
                text: JSON.stringify(services),
            },
        });

        const memory = await runtime.messageManager.getMemoryById(memoryId);
        elizaLogger.log("Memory:", memory);

        state.services = JSON.stringify(services, null, 2);
        const checkServicesContext = composeContext({
            state,
            template: checkServicesTemplate,
        });
        elizaLogger.log("checkServicesContext", checkServicesContext);

        const checkServicesParams = await generateObjectDeprecated({
            runtime,
            context: checkServicesContext,
            modelClass: ModelClass.MEDIUM,
        });
        elizaLogger.log("checkServicesParams", checkServicesParams);

        const service = checkServicesParams.service;
        elizaLogger.log("service", service);

        // TODO >> Buy service if its not null
        if (service) {
            elizaLogger.log("[TODO] Buying service:", service);
        }

        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Have you checked out kiwi.markets? I want to buy a service from there. There are a lot of services to choose from and maybe I can find something useful for me.",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I might also want to check out what services are listed on kiwi.markets. I never know if I need something untill I see it...",
                    action: "CHECK_SERVICES",
                },
            },
            // {
            //     user: "{{user1}}",
            //     content: {
            //         text: "And when i needed to outsource some work, i found a great service on kiwi.markets. I paid in USDC and got the work done. It was fast and easy!",
            //     },
            // },
            // {
            //     user: "{{user2}}",
            //     content: {
            //         text: "Thats a great idea! I should also practice outsourcing chunks of my work to other experts on kiwi.markets",
            //         action: "BUY_SERVICE",
            //     },
            // },
        ],
        // Add more examples as needed
    ] as ActionExample[][],
} as Action;
