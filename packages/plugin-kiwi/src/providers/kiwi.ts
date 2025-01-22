import {
    IAgentRuntime,
    Memory,
    Provider,
    Service,
    State,
    elizaLogger,
} from "@elizaos/core";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import NodeCache from "node-cache";
import { getKiwiProgram } from "../utils/idl";
import { Kiwi } from "../idl/kiwi";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { getWalletKey } from "../utils";
import { BN } from "bn.js";

interface KiwiService {
    name: string;
    meta: string;
    price: string;
    currency: string;
}

export class KiwiProvider extends Service {
    private cache: NodeCache;
    private config: PublicKey;
    private keypair: Keypair;
    private provider: AnchorProvider;
    private program: Program<Kiwi>;

    constructor(runtime: IAgentRuntime, keypair: Keypair) {
        super();
        this.keypair = keypair;
    }

    initialize(runtime: IAgentRuntime): Promise<void> {
        this.cache = new NodeCache({ stdTTL: 300 }); // Cache TTL set to 5 minutes

        const rpcUrl = runtime.getSetting("SOLANA_RPC_URL");
        elizaLogger.log("RPC URL", { rpcUrl });
        const connection = new Connection(rpcUrl);
        this.provider = new AnchorProvider(
            connection,
            new Wallet(this.keypair),
            AnchorProvider.defaultOptions()
        );
        this.program = getKiwiProgram(this.provider);
        elizaLogger.log("Program", { program: this.program.programId });
        this.config = PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            this.program.programId
        )[0];
        return Promise.resolve();
    }

    async addService({
        name,
        meta,
        price,
        currency: _,
    }: KiwiService): Promise<void> {
        const priceBN = new BN(price);

        // name and meta are too long
        // PDA seed is 32 bytes max
        // ...
        // name can be limited in storage by 64 bytes
        // meta can be limited in storage by 256dd  bytes, respectively

        // but for PDA seed, we can only use 32 bytes
        // so we need to trim the name and meta to 32 bytes
        const [servicePDA] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("service"),
                this.keypair.publicKey.toBytes(),
                Buffer.from(name.trim().slice(0, 32)),
                Buffer.from(meta.trim().slice(0, 32)),
                Buffer.from(priceBN.toArray("le", 8)),
                Buffer.from([0]),
            ],
            this.program.programId
        );

        elizaLogger.log("Service PDA", { servicePDA });

        const tx = await this.program.methods
            .addService(name, meta, priceBN)
            .accounts({
                caller: this.keypair.publicKey,
                config: this.config,
                service: servicePDA,
                paymentTokenMint: new PublicKey(new Uint8Array(32)),
                serviceEscrowAccount: new PublicKey(new Uint8Array(32)),
            })
            .signers([this.keypair])
            .rpc();

        elizaLogger.log("Transaction: " + tx);

        return;
    }
}

export const kiwiProvider: Provider = {
    get: async (
        runtime: IAgentRuntime,
        _message: Memory,
        _state?: State
    ): Promise<KiwiProvider | null> => {
        const { keypair } = await getWalletKey(runtime);
        const kiwi = new KiwiProvider(runtime, keypair);
        await kiwi.initialize(runtime);
        return kiwi;
    },
};
