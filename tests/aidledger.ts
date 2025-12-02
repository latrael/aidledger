import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Aidledger } from "../target/types/aidledger";
import { SystemProgram, PublicKey } from "@solana/web3.js";

describe("aidledger", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Aidledger as Program<Aidledger>;
  const admin = provider.wallet;

  it("Registers an NGO", async () => {
    // Derive the NGO PDA: seeds = [b"ngo", admin.key().as_ref()]
    const [ngoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ngo"), admin.publicKey.toBuffer()],
      program.programId
    );

    const metadataUri = "ipfs://example-ngo-metadata";

    const tx = await program.methods
      .registerNgo(metadataUri)
      .accounts({
        ngo: ngoPda,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Register NGO tx:", tx);

    const ngoAccount = await program.account.ngo.fetch(ngoPda);
    console.log("NGO account:", ngoAccount);

    // Simple sanity asserts
    if (!ngoAccount.admin.equals(admin.publicKey)) {
      throw new Error("NGO admin mismatch");
    }
    if (ngoAccount.metadataUri !== metadataUri) {
      throw new Error("NGO metadata_uri mismatch");
    }
  });

  it("Submits a batch for that NGO", async () => {
    // Same NGO PDA as above
    const [ngoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ngo"), admin.publicKey.toBuffer()],
      program.programId
    );

    // Batch index as u64 (BN in TS)
    const batchIndex = new anchor.BN(0);

    // Derive Batch PDA: seeds = [b"batch", ngo.key().as_ref(), batch_index_le_bytes]
    const [batchPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("batch"),
        ngoPda.toBuffer(),
        batchIndex.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    // Dummy 32-byte Merkle root
    const merkleRoot = new Array(32).fill(0);
    merkleRoot[0] = 1; // just to make it non-zero

    const dataUri = "ipfs://example-batch";
    const region = "MENA";
    const programTag = "FoodAid";
    const now = Math.floor(Date.now() / 1000);

    const tx = await program.methods
      .submitBatch(
        batchIndex,
        merkleRoot as number[],
        dataUri,
        region,
        programTag,
        new anchor.BN(now),
        new anchor.BN(now + 3600)
      )
      .accounts({
        ngo: ngoPda,
        batch: batchPda,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Submit batch tx:", tx);

    const batchAccount = await program.account.batch.fetch(batchPda);
    console.log("Batch account:", batchAccount);

    if (!batchAccount.ngo.equals(ngoPda)) {
      throw new Error("Batch NGO mismatch");
    }
    if (batchAccount.batchIndex.toString() !== batchIndex.toString()) {
      throw new Error("Batch index mismatch");
    }
  });
});
