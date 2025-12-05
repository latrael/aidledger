// check_devnet_data.ts
import { Connection, PublicKey, clusterApiUrl, GetProgramAccountsFilter } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("4wcEn4cPenW3GM1eYfNoAHsmnN1SPNLnLqSCtBruaobD");
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

async function main() {
  try {
    console.log("🔍 Checking devnet for existing data...");
    console.log(`Program ID: ${PROGRAM_ID.toBase58()}`);
    console.log(`RPC URL: ${clusterApiUrl("devnet")}`);
    
    // Fetch all program accounts
    console.log("\n📋 Fetching all program accounts...");
    const accounts = await connection.getProgramAccounts(PROGRAM_ID);
    console.log(`Found ${accounts.length} account(s) owned by the program:`);
    
    for (const account of accounts) {
      console.log(`\n  Account: ${account.pubkey.toBase58()}`);
      console.log(`  Data Length: ${account.account.data.length} bytes`);
      console.log(`  Owner: ${account.account.owner.toBase58()}`);
      console.log(`  Lamports: ${account.account.lamports}`);
      
      // Try to identify account type by discriminator (first 8 bytes)
      if (account.account.data.length >= 8) {
        const discriminator = Array.from(account.account.data.slice(0, 8));
        console.log(`  Discriminator: [${discriminator.join(', ')}]`);
        
        // NGO discriminator based on IDL
        if (discriminator.join(',') === '5,168,204,75,108,93,89,244') {
          console.log(`  → This appears to be an NGO account`);
        }
        // Batch discriminator
        else if (discriminator.join(',') === '144,55,16,105,136,253,225,90') {
          console.log(`  → This appears to be a Batch account`);
        }
      }
    }
    
    if (accounts.length === 0) {
      console.log("\n⚠️  No accounts found on devnet. You may need to register some first.");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main().catch(console.error);