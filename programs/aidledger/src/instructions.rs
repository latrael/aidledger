use anchor_lang::prelude::*;

use crate::state::{Ngo, Batch};

/// Seeds
pub const NGO_SEED: &[u8] = b"ngo";
pub const BATCH_SEED: &[u8] = b"batch";

pub fn register_ngo(ctx: Context<RegisterNgo>, metadata_uri: String) -> Result<()> {
    let ngo = &mut ctx.accounts.ngo;
    let admin = &ctx.accounts.admin;

    ngo.admin = admin.key();
    ngo.metadata_uri = metadata_uri;
    ngo.is_active = true;
    ngo.bump = ctx.bumps.ngo;
    ngo.created_at = Clock::get()?.unix_timestamp;

    Ok(())
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
    let ngo = &ctx.accounts.ngo;
    let batch = &mut ctx.accounts.batch;

    require_keys_eq!(ngo.admin, ctx.accounts.admin.key(), AidledgerError::Unauthorized);

    batch.ngo = ngo.key();
    batch.batch_index = batch_index;
    batch.merkle_root = merkle_root;
    batch.data_uri = data_uri;
    batch.region = region;
    batch.program_tag = program_tag;
    batch.start_time = start_time;
    batch.end_time = end_time;
    batch.is_flagged = false;
    batch.bump = ctx.bumps.batch;

    emit!(BatchSubmitted {
        ngo: ngo.key(),
        batch_index,
        merkle_root,
    });

    Ok(())
}

// ---------- Contexts ----------

#[derive(Accounts)]
#[instruction(metadata_uri: String)]
pub struct RegisterNgo<'info> {
    #[account(
        init,
        payer = admin,
        space = Ngo::MAX_SIZE,
        seeds = [NGO_SEED, admin.key().as_ref()],
        bump,
    )]
    pub ngo: Account<'info, Ngo>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(batch_index: u64)]
pub struct SubmitBatch<'info> {
    #[account(
        mut,
        seeds = [NGO_SEED, admin.key().as_ref()],
        bump = ngo.bump,
        has_one = admin @ AidledgerError::Unauthorized,
    )]
    pub ngo: Account<'info, Ngo>,

    #[account(
        init,
        payer = admin,
        space = Batch::MAX_SIZE,
        seeds = [BATCH_SEED, ngo.key().as_ref(), &batch_index.to_le_bytes()],
        bump,
    )]
    pub batch: Account<'info, Batch>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ---------- Events & Errors ----------

#[event]
pub struct BatchSubmitted {
    pub ngo: Pubkey,
    pub batch_index: u64,
    pub merkle_root: [u8; 32],
}

#[error_code]
pub enum AidledgerError {
    #[msg("Unauthorized")]
    Unauthorized,
}