import * as fs from "fs";
import * as path from "path";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { parse } from "csv-parse/sync";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
// import { Aidledger } from "../target/types/aidledger"; // if you want TS types

const NGO_SEED = Buffer.from("ngo");
const BATCH_SEED = Buffer.from("batch");

async function main() {
  // 1. CLI args: csv path + basic metadata
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: ts-node submitBatch.ts <path/to/file.csv>");
    process.exit(1);
  }

  const region = process.argv[3] || "MENA";
  const programTag = process.argv[4] || "FoodAid";
  const batchIndex = 0; // later: increment or take from arg

  // 2. Read CSV and parse rows
  const absPath = path.resolve(csvPath);
  const csvContent = fs.readFileSync(absPath, "utf8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];

  console.log(`Loaded ${records.length} rows from ${absPath}`);

  // 3. Canonicalize each row and hash it
  const leaves = records.map((row) => {
    // deterministic ordering of keys
    const keys = Object.keys(row).sort();
    const canonical = keys.map((k) => `${k}=${row[k]}`).join("|");
    return keccak256(Buffer.from(canonical));
  });

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const root = tree.getRoot(); // Buffer (32 bytes)

  if (root.length !== 32) {
    throw new Error(`Merkle root is not 32 bytes, got ${root.length}`);
  }

  console.log("Merkle root:", "0x" + root.toString("hex"));

  // 4. TODO: upload CSV to IPFS and get URI
  // For now, just fake it:
  const dataUri = "ipfs://TODO-real-ipfs-hash";

  // 5. Anchor provider / program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet;

  const idl = await anchor.Program.fetchIdl(
    new PublicKey("4wcEn4cPenW3GM1eYfNoAHsmnN1SPNLnLqSCtBruaobD"),
    provider
  );
  if (!idl) {
    throw new Error("Could not fetch IDL for Aidledger");
  }

  const program = new anchor.Program(
    idl,
    new PublicKey("4wcEn4cPenW3GM1eYfNoAHsmnN1SPNLnLqSCtBruaobD"),
    provider
  );

  // 6. Derive NGO PDA (assumes NGO already registered; we can add a register step too)
  const [ngoPda] = PublicKey.findProgramAddressSync(
    [NGO_SEED, wallet.publicKey.toBuffer()],
    program.programId
  );

  // 7. Derive Batch PDA
  const batchIndexBN = new anchor.BN(batchIndex);
  const [batchPda] = PublicKey.findProgramAddressSync(
    [
      BATCH_SEED,
      ngoPda.toBuffer(),
      batchIndexBN.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const now = Math.floor(Date.now() / 1000);

  // 8. Call submit_batch on-chain
  const tx = await program.methods
    .submitBatch(
      batchIndexBN,
      Array.from(root), // [u8;32]
      dataUri,
      region,
      programTag,
      new anchor.BN(now),
      new anchor.BN(now + 3600)
    )
    .accounts({
      ngo: ngoPda,
      batch: batchPda,
      admin: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("Submitted batch tx:", tx);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
