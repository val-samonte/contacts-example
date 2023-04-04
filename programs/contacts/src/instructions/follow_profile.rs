use anchor_lang::prelude::*;

use crate::states::{Follow, Profile};

#[derive(Accounts)]
pub struct FollowProfile<'info> {

  #[account(
    init,
    payer = owner, 
    seeds = [b"follow", owner_profile.key().as_ref(), profile_to_follow.key().as_ref()],
    bump,
    space = Follow::len()
  )]
  pub follow_account: Box<Account<'info, Follow>>,

  #[account(mut)]
  pub profile_to_follow: Box<Account<'info, Profile>>,

  #[account(
    mut,
    seeds = [b"profile", owner.key().as_ref()],
    bump = owner_profile.bump,
  )]
  pub owner_profile: Box<Account<'info, Profile>>,

  #[account(mut)]
  pub owner: Signer<'info>,

  pub system_program: Program<'info, System>
}

pub fn follow_profile_handler(ctx: Context<FollowProfile>) -> Result<()> {

  let follow_account = &mut ctx.accounts.follow_account;
  let profile_to_follow = &mut ctx.accounts.profile_to_follow;
  let owner_profile = &mut ctx.accounts.owner_profile;

  owner_profile.following_count += 1;
  profile_to_follow.followers_count += 1;

  follow_account.bump = *ctx.bumps.get("follow_account").unwrap();
  follow_account.owner_profile = owner_profile.key();
  follow_account.following = profile_to_follow.key();

  Ok(())
}
