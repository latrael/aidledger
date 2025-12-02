use anchor_lang::prelude::*;

/// NGO account – one per organization
#[account]
pub struct Ngo {
    pub admin: Pubkey,
    pub metadata_uri: String,
    pub is_active: bool,
    pub bump: u8,
    pub created_at: i64,
}

/// Batch of disbursement data committed on-chain
#[account]
pub struct Batch {
    pub ngo: Pubkey,
    pub batch_index: u64,
    pub merkle_root: [u8; 32],
    pub data_uri: String,     // ipfs://...
    pub region: String,
    pub program_tag: String,
    pub start_time: i64,
    pub end_time: i64,
    pub is_flagged: bool,
    pub bump: u8,
}

// Rough size helpers (Anchor needs space, but we’ll use generous defaults in the contexts)
impl Ngo {
    pub const MAX_SIZE: usize = 8  // discriminator
        + 32                       // admin
        + 4 + 256                  // metadata_uri (string, 256 bytes max)
        + 1                        // is_active
        + 1                        // bump
        + 8;                       // created_at
}

impl Batch {
    pub const MAX_SIZE: usize = 8   // discriminator
        + 32                        // ngo
        + 8                         // batch_index
        + 32                        // merkle_root
        + 4 + 256                   // data_uri
        + 4 + 64                    // region
        + 4 + 64                    // program_tag
        + 8                         // start_time
        + 8                         // end_time
        + 1                         // is_flagged
        + 1;                        // bump
}