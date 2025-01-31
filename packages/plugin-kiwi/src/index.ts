import { Plugin } from "@elizaos/core";

import { kiwiProvider } from "./providers/kiwi.ts";
import { walletProvider } from "./providers/wallet.ts";

import { addService } from "./actions/addService.ts";
import { checkServices } from "./actions/checkServices.ts";

export const kiwiPlugin: Plugin = {
    name: "kiwi",
    description: "Kiwi.Markets Plugin for Eliza",
    actions: [checkServices, addService],
    evaluators: [],
    providers: [walletProvider, kiwiProvider],
};

export default kiwiPlugin;
