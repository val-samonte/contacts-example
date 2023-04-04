use anchor_lang::prelude::*;

#[account]
pub struct Profile {
    pub bump: u8,

    pub following_count: u16,

    pub followers_count: u16,

    pub name: String,

    pub uri: String,
}

impl Profile {
    pub fn len(name: String, uri: String) -> usize {
        8 + 1 + 2 + 2 + (4 + name.len()) + (4 + uri.len())
    }
}
