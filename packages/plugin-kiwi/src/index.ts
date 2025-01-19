// export * from "./providers/wallet.ts";

import { elizaLogger, Plugin } from "@elizaos/core";
import { addService } from "./actions/add_service.ts";
// import { WalletProvider } from "./providers/wallet.ts";
// import { testEvaluator } from "./evaluators/test.ts";
// export { WalletProvider };

elizaLogger.log("kiwi plugin loaded");

export const kiwiPlugin: Plugin = {
    name: "kiwi",
    description: "Kiwi.Markets Plugin for Eliza",
    actions: [addService],
    evaluators: [],
    providers: [],
};

export default kiwiPlugin;
