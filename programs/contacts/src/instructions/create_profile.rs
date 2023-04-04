use anchor_lang::prelude::*;

use crate::states::profile::Profile;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateProfileParams {
    name: String,
    uri: String,
}

#[derive(Accounts)]
#[instruction(params:CreateProfileParams)]
pub struct CreateProfile<'info> {

    #[account(
        init,
        payer = owner,
        seeds = [b"profile", owner.key().as_ref()],
        bump, 
        space = Profile::len(params.name, params.uri)
    )]
    pub profile: Box<Account<'info, Profile>>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_profile_handler(
    ctx: Context<CreateProfile>,
    params: CreateProfileParams,
) -> Result<()> {

    let profile = &mut ctx.accounts.profile;

    profile.bump = *ctx.bumps.get("profile").unwrap();
    // profile.owner = ctx.accounts.owner.key();
    profile.name = params.name;
    profile.uri = params.uri;

    Ok(())
}

