import {
    IAgentRuntime,
    Memory,
    Provider,
    State,
    elizaLogger,
} from "@elizaos/core";
import { Connection, PublicKey } from "@solana/web3.js";
import NodeCache from "node-cache";
import { getWalletKey } from "../utils";

// Provider configuration
const PROVIDER_CONFIG = {
    DEFAULT_RPC: "http://localhost:8899",
};

export class WalletProvider {
    private cache: NodeCache;

    constructor(
        private connection: Connection,
        private walletPublicKey: PublicKey
    ) {
        this.cache = new NodeCache({ stdTTL: 300 }); // Cache TTL set to 5 minutes
    }

    async getSolBalance(): Promise<number> {
        return this.connection.getBalance(this.walletPublicKey);
    }
}

const walletProvider: Provider = {
    get: async (
        runtime: IAgentRuntime,
        _message: Memory,
        _state?: State
    ): Promise<WalletProvider | null> => {
        try {
            const { publicKey } = await getWalletKey(runtime);

            const rpcUrl =
                runtime.getSetting("SOLANA_RPC_URL") ||
                PROVIDER_CONFIG.DEFAULT_RPC;

            const connection = new Connection(rpcUrl);
            const provider = new WalletProvider(connection, publicKey);

            return provider;
        } catch (error) {
            elizaLogger.error("Error in wallet provider:", error);
            return null;
        }
    },
};

// Module exports
export { walletProvider };
