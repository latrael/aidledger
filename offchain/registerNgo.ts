// @ts-nocheck

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

const NGO_SEED = Buffer.from("ngo");

// Load modern Anchor IDL straight from target/idl
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rawIdl = require("../target/idl/aidledger.json");
const modernIdl = rawIdl && rawIdl.default ? rawIdl.default : rawIdl;

// Debug what we actually have
console.log("Raw IDL keys:", Object.keys(modernIdl));
console.log("Modern metadata:", modernIdl.metadata);
console.log(
  "Modern instructions:",
  modernIdl.instructions?.map((ix: any) => ix.name)
);
console.log(
  "Modern accounts:",
  modernIdl.accounts?.map((a: any) => a.name)
);

// Patch accounts: make sure `size` exists so Anchor's AccountClient
// doesn't blow up on `account.size`
const patchedIdl: any = {
  ...modernIdl,
  accounts: (modernIdl.accounts ?? [])
    .filter((acc: any) => !!acc)
    .map((acc: any) => ({
      ...acc,
      size: acc.size ?? 0,
    })),
};

console.log(
  "Patched accounts:",
  patchedIdl.accounts.map((a: any) => ({ name: a.name, size: a.size }))
);

// ---- MAIN SCRIPT ----

async function main() {
  const metadataUri =
    process.argv[2] || "ipfs://demo-ngo-metadata-todo-upload";

  // Use env provider (ANCHOR_WALLET + ANCHOR_PROVIDER_URL)
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet;

  // IMPORTANT: use the modern constructor: new Program(idl, provider)
  // This lets Anchor pick up `idl.address` / `metadata.address`
  const program = new anchor.Program(
    patchedIdl as anchor.Idl,
    provider
  );

  console.log("Program ID from IDL:", program.programId.toBase58());

  // Derive NGO PDA: [b"ngo", admin_pubkey]
  const [ngoPda] = PublicKey.findProgramAddressSync(
    [NGO_SEED, wallet.publicKey.toBuffer()],
    program.programId
  );

  console.log("Admin wallet:", wallet.publicKey.toBase58());
  console.log("Derived NGO PDA:", ngoPda.toBase58());
  console.log("Metadata URI:", metadataUri);

  // register_ngo (snake) -> registerNgo (camel) in program.methods
  const tx = await program.methods
    .registerNgo(metadataUri)
    .accounts({
      ngo: ngoPda,
      admin: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("Register NGO tx:", tx);

  // Now accounts should be wired correctly
  const ngoAccount = await (program as any).account.ngo.fetch(ngoPda);
  console.log("NGO account:", ngoAccount);
}

main(process.argv[2]!)
  .then(() => console.log("Done"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
