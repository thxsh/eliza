import {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    type Action,
    elizaLogger,
} from "@elizaos/core";
import { WalletProvider, walletProvider } from "../providers/wallet";
// import { Connection, PublicKey } from "@solana/web3.js";

const _addServiceTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "name": "Software Development",
    "meta": "We provide software development services that are performed in accordance tot the latest industry standards.",
    "price": 1_000_000, // 1 SOL
    "currency": "SOL",
}
\`\`\`

{{recentMessages}}

Given the recent messages and wallet information below:

{{walletInfo}}

Extract the following information about the requested token swap:
- Name of the service
- Meta of the service
- Price of the service
- Currency of the service

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined. The result should be a valid JSON object with the following schema:
\`\`\`json
{
    "name": string | null,
    "meta": string | null,
    "price": number | string | null,
    "currency": string | null
}
\`\`\``;

// swapToken should took CA, not symbol

export const addService: Action = {
    name: "ADD_SERVICE",
    similes: ["ADD_SERVICE", "LIST_SERVICE"],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        // Check if the necessary parameters are provided in the message
        elizaLogger.log("Message:", message);
        return true;
    },
    description: "List services on kiwi.markets",
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

        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Have you thought of listing your favorite services on kiwi.markets?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Listing my services on kiwi.markets...",
                    action: "ADD_SERVICE",
                    params: {
                        name: "Software Development",
                        meta: "We provide software development services that are performed in accordance tot the latest industry standards.",
                        price: 1_000_000, // 1 SOL
                        currency: "SOL",
                    },
                },
            },
        ],
        // Add more examples as needed
    ] as ActionExample[][],
} as Action;
