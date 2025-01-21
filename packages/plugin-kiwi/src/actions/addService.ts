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
} from "@elizaos/core";
import { WalletProvider, walletProvider } from "../providers/wallet";
import { kiwiProvider, KiwiProvider } from "../providers/kiwi";
// import { Connection, PublicKey } from "@solana/web3.js";

const addServiceTemplate = `Respond with a JSON object containing only the required values.

Example response:
\`\`\`json
{
    "name": "Software Development",
    "meta": "Software development services that are performed in accordance tot the latest industry standards.",
    "price": "1000000",
    "currency": "SOL",
}
\`\`\`


Given your bio and your intentions, compose a service description, price and currency:

{{bio}}

Following information is required to add the service to kiwi.markets:
- Name of the service
- Meta of the service
- Price of the service (Determine the price in chosen currency, consider decimals and provide full number as string)
- Currency of the service

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined. The result should be a valid JSON object with the following schema:
\`\`\`json
{
    "name": string,
    "meta": string,
    "price": string,
    "currency": string
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

        const addServiceContext = composeContext({
            state,
            template: addServiceTemplate,
        });
        elizaLogger.log("addServiceContext", addServiceContext);

        const addServiceParams = await generateObjectDeprecated({
            runtime,
            context: addServiceContext,
            modelClass: ModelClass.LARGE,
        });
        elizaLogger.log("addServiceParams", addServiceParams);

        const name = addServiceParams.name;
        const meta = addServiceParams.meta;
        const price = addServiceParams.price;
        const currency = addServiceParams.currency;

        elizaLogger.log("addServiceParams.name", name);
        elizaLogger.log("addServiceParams.meta", meta);
        elizaLogger.log("addServiceParams.price", price);
        elizaLogger.log("addServiceParams.currency", currency);

        const kiwi: KiwiProvider = await kiwiProvider.get(
            runtime,
            message,
            state
        );
        const tx = await kiwi.addService({ name, meta, price, currency });
        elizaLogger.log("Transaction other", JSON.stringify(tx, null, 2));

        // elizaLogger.log("kiwi", kiwi);
        //
        // await kiwiProvider.addService({ name, meta, price, currency });

        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Have you heard it? You can list your services on kiwi.markets and get paid in on chain. I already listed couple of services and got some traction!",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I might also want to list my services on kiwi.markets. I want to offer my expertise and get paid too...",
                    action: "ADD_SERVICE",
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
