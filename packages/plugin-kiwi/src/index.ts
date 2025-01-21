import { Plugin } from "@elizaos/core";
import { addService } from "./actions/addService.ts";
import { walletProvider } from "./providers/wallet.ts";
import { kiwiProvider } from "./providers/kiwi.ts";

export const kiwiPlugin: Plugin = {
    name: "kiwi",
    description: "Kiwi.Markets Plugin for Eliza",
    actions: [addService],
    evaluators: [],
    providers: [walletProvider, kiwiProvider],
};

export default kiwiPlugin;
