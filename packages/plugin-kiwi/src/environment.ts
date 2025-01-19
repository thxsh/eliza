// import { IAgentRuntime } from "@elizaos/core";
// import { z } from "zod";

// export const kiwiEnvSchema = z
//     .object({
//         WALLET_SECRET_SALT: z.string().optional(),
//     })
//     .and(
//         z.union([
//             z.object({
//                 WALLET_SECRET_KEY: z
//                     .string()
//                     .min(1, "Wallet secret key is required"),
//                 WALLET_PUBLIC_KEY: z
//                     .string()
//                     .min(1, "Wallet public key is required"),
//             }),
//             z.object({
//                 WALLET_SECRET_SALT: z
//                     .string()
//                     .min(1, "Wallet secret salt is required"),
//             }),
//             z.object({
//                 SOL_ADDRESS: z.string().min(1, "SOL address is required"),
//                 SOLANA_RPC_URL: z.string().min(1, "RPC URL is required"),
//             }),
//         ])
//     );

// export type KiwiConfig = z.infer<typeof kiwiEnvSchema>;

// export async function validateKiwiConfig(
//     runtime: IAgentRuntime
// ): Promise<KiwiConfig> {
//     try {
//         const config = {
//             WALLET_SECRET_SALT:
//                 runtime.getSetting("WALLET_SECRET_SALT") ||
//                 process.env.WALLET_SECRET_SALT,
//             WALLET_SECRET_KEY:
//                 runtime.getSetting("WALLET_SECRET_KEY") ||
//                 process.env.WALLET_SECRET_KEY,
//             WALLET_PUBLIC_KEY:
//                 runtime.getSetting("SOLANA_PUBLIC_KEY") ||
//                 runtime.getSetting("WALLET_PUBLIC_KEY") ||
//                 process.env.WALLET_PUBLIC_KEY,
//             SOL_ADDRESS:
//                 runtime.getSetting("SOL_ADDRESS") || process.env.SOL_ADDRESS,
//             SOLANA_RPC_URL:
//                 runtime.getSetting("SOLANA_RPC_URL") ||
//                 process.env.SOLANA_RPC_URL,
//         };

//         return kiwiEnvSchema.parse(config);
//     } catch (error) {
//         if (error instanceof z.ZodError) {
//             const errorMessages = error.errors
//                 .map((err) => `${err.path.join(".")}: ${err.message}`)
//                 .join("\n");
//             throw new Error(
//                 `Kiwi configuration validation failed:\n${errorMessages}`
//             );
//         }
//         throw error;
//     }
// }
