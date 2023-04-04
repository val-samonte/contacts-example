use anchor_lang::prelude::*;

mod instructions;
mod states;
use instructions::*;

declare_id!("7oGTeV9zzmmL4GbBLWC6AUt29WjBdRhj1f3jZeuvAmwe");

#[program]
pub mod contacts {

    use super::*;

    pub fn create_profile(ctx: Context<CreateProfile>, params: CreateProfileParams) -> Result<()> {
        create_profile_handler(ctx, params)
    }

    pub fn follow_profile(ctx: Context<FollowProfile>) -> Result<()> {
        follow_profile_handler(ctx)
    }
}
