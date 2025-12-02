use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;

use instructions::*; // optional, but keeps things tidy

declare_id!("4wcEn4cPenW3GM1eYfNoAHsmnN1SPNLnLqSCtBruaobD"); // synced by `anchor keys sync`

#[program]
pub mod aidledger {
    use super::*;

    pub fn register_ngo(ctx: Context<RegisterNgo>, metadata_uri: String) -> Result<()> {
        instructions::register_ngo(ctx, metadata_uri)
    }

    pub fn submit_batch(
        ctx: Context<SubmitBatch>,
        batch_index: u64,
        merkle_root: [u8; 32],
        data_uri: String,
        region: String,
        program_tag: String,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        instructions::submit_batch(
            ctx,
            batch_index,
            merkle_root,
            data_uri,
            region,
            program_tag,
            start_time,
            end_time,
        )
    }
}
