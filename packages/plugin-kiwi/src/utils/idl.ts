import fs from "fs";
import { Kiwi } from "../idl/kiwi";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { fileURLToPath } from "url";
import { dirname } from "path";

const PROGRAM_ID = new PublicKey(
    "9WV2AszpVhHAKijN2GE6jcGfz2BiCfp35W3UBkKEp5YE"
);

// helper function to get the IDL
export function getIDL(): Kiwi {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const idlPath = `${__dirname}/../src/idl/kiwi.json`;
    console.log({ idlPath });
    const idlData = fs.readFileSync(idlPath, "utf8");
    return JSON.parse(idlData) as Kiwi;
}

export function getKiwiProgram(provider: AnchorProvider): Program<Kiwi> {
    const idl = getIDL();
    return new Program(idl as Kiwi, PROGRAM_ID, provider);
}
