use anchor_lang::prelude::*;

#[account]
pub struct Follow {
    pub bump: u8,
    pub owner_profile: Pubkey,
    pub following: Pubkey,
}

impl Follow {
    pub fn len() -> usize {
        8 + 1 + 32 + 32
    }
}
