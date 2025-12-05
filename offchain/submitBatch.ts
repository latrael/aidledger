// submitBatch.ts
// @ts-nocheck

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
const { BN } = anchor;

const NGO_SEED = Buffer.from("ngo");
const BATCH_SEED = Buffer.from("batch");

// ---- load & patch IDL same way as registerNgo.ts ----

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rawIdl = require("../target/idl/aidledger.json");
const modernIdl = rawIdl && rawIdl.default ? rawIdl.default : rawIdl;

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
  "submitBatch: IDL instructions:",
  patchedIdl.instructions?.map((ix: any) => ix.name)
);
console.log(
  "submitBatch: accounts:",
  patchedIdl.accounts?.map((a: any) => a.name)
);

// ---- main script ----

// Usage (example):
// npx ts-node submitBatch.ts "NGO_PDA" "0" "ipfs://aidledger-demo-batch" "Kenya" "Cash-vouchers-Jan" "startTime" "endTime"

async function main() {
  // CLI args - updated to handle NGO PDA as first parameter
  const ngoPdaArg = process.argv[2]; // NGO PDA (required)
  const batchIndexArg = process.argv[3] ?? "0";
  const dataUri = process.argv[4] ?? "ipfs://aidledger-demo-batch";
  const region = process.argv[5] ?? "Global";
  const programTag = process.argv[6] ?? "DemoProgram";
  const startTimeArg = process.argv[7] ?? Math.floor(Date.now() / 1000).toString();
  const endTimeArg = process.argv[8] ?? (Math.floor(Date.now() / 1000) + 86400).toString();

  if (!ngoPdaArg) {
    throw new Error("NGO PDA is required as the first argument");
  }

  const batchIndex = BigInt(batchIndexArg);
  const startTime = new BN(startTimeArg);
  const endTime = new BN(endTimeArg);

  // simple dummy merkle root: 32 zero bytes
  const merkleRoot: number[] = new Array(32).fill(0);

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet;

  const program = new anchor.Program(
    patchedIdl as anchor.Idl,
    provider
  );

  console.log("Program ID from IDL:", program.programId.toBase58());
  console.log("Admin wallet:", wallet.publicKey.toBase58());
  console.log("batchIndex:", batchIndex.toString());
  console.log("dataUri:", dataUri);
  console.log("region:", region);
  console.log("programTag:", programTag);

  // ---- use provided NGO PDA ----
  const ngoPda = new PublicKey(ngoPdaArg);
  console.log("NGO PDA:", ngoPda.toBase58());

  // ---- derive Batch PDA ----
  // Assuming seeds = ["batch", ngo.key(), batch_index_le_bytes]
  const batchIndexBuf = Buffer.alloc(8);
  batchIndexBuf.writeBigUInt64LE(batchIndex);

  const [batchPda] = PublicKey.findProgramAddressSync(
    [BATCH_SEED, ngoPda.toBuffer(), batchIndexBuf],
    program.programId
  );
  console.log("Batch PDA:", batchPda.toBase58());

  // ---- call submit_batch ----
  // Rust:
  // submit_batch(ctx,
  //   batch_index: u64,
  //   merkle_root: [u8; 32],
  //   data_uri: String,
  //   region: String,
  //   program_tag: String,
  //   start_time: i64,
  //   end_time: i64,
  // )
  //
  // In Anchor TS, u64/i64 can be plain numbers if small, but BN is safer.
  const tx = await program.methods
    .submitBatch(
      new anchor.BN(batchIndex.toString()), // u64
      merkleRoot,
      dataUri,
      region,
      programTag,
      new anchor.BN(startTime), // i64
      new anchor.BN(endTime),   // i64
    )
    .accounts({
      ngo: ngoPda,
      batch: batchPda,
      admin: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("submitBatch tx:", tx);

  // ---- fetch and print the batch account ----
  const batchAccount = await (program as any).account.batch.fetch(batchPda);
  console.log("Batch account:", batchAccount);
}

main()
  .then(() => console.log("submitBatch done"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
