import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

const NGO_SEED = Buffer.from("ngo");

// Your program ID (from `declare_id!` / `anchor keys list`)
const PROGRAM_ID = new PublicKey(
  "4wcEn4cPenW3GM1eYfNoAHsmnN1SPNLnLqSCtBruaobD"
);

async function main() {
  // Metadata URI from CLI, or a default
  const metadataUri =
    process.argv[2] || "ipfs://demo-ngo-metadata-todo-upload";

  // Use the same provider/wallet as Anchor tests
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet;

  // Load IDL from the chain (localnet or devnet)
  const idl = await anchor.Program.fetchIdl(PROGRAM_ID, provider);
  if (!idl) {
    throw new Error("Could not fetch IDL for Aidledger");
  }

  const program = new anchor.Program(idl, PROGRAM_ID, provider);

  // Derive NGO PDA: [b"ngo", admin_pubkey]
  const [ngoPda] = PublicKey.findProgramAddressSync(
    [NGO_SEED, wallet.publicKey.toBuffer()],
    program.programId
  );

  console.log("Admin wallet:", wallet.publicKey.toBase58());
  console.log("Derived NGO PDA:", ngoPda.toBase58());

  // Call on-chain registerNgo(metadata_uri)
  const tx = await program.methods
    .registerNgo(metadataUri)
    .accounts({
      ngo: ngoPda,
      admin: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("Register NGO tx:", tx);

  const ngoAccount = await program.account.ngo.fetch(ngoPda);
  console.log("NGO account:", ngoAccount);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
