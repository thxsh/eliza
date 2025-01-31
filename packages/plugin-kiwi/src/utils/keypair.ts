import bs58 from "bs58";
import { Keypair, PublicKey } from "@solana/web3.js";
import { IAgentRuntime, elizaLogger } from "@elizaos/core";

export interface KeypairResult {
    keypair?: Keypair;
    publicKey?: PublicKey;
}

/**
 * Gets either a keypair or public key based on TEE mode and runtime settings
 * @param runtime The agent runtime
 * @returns KeypairResult containing either keypair or public key
 */
export async function getWalletKey(
    runtime: IAgentRuntime
): Promise<KeypairResult> {
    const privateKeyString = runtime.getSetting("SOLANA_PRIVATE_KEY");
    if (!privateKeyString) {
        throw new Error("Private key not found in settings");
    }

    try {
        // First try base58
        const secretKey = bs58.decode(privateKeyString);
        const keypair = Keypair.fromSecretKey(secretKey);
        return {
            keypair: Keypair.fromSecretKey(secretKey),
            publicKey: keypair.publicKey,
        };
    } catch (e) {
        elizaLogger.log("Error decoding base58 private key:", e);
        try {
            // Then try base64
            elizaLogger.log("Try decoding base64 instead");
            const secretKey = Uint8Array.from(
                Buffer.from(privateKeyString, "base64")
            );
            const keypair = Keypair.fromSecretKey(secretKey);
            return {
                keypair: Keypair.fromSecretKey(secretKey),
                publicKey: keypair.publicKey,
            };
        } catch (e2) {
            elizaLogger.error("Error decoding private key: ", e2);
            throw new Error("Invalid private key format");
        }
    }
}
