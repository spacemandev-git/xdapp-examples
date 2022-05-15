use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Config{
    pub owner: Pubkey,
    pub nonce: u32,
}

#[account]
#[derive(Default)]
pub struct EmitterAddrAccount{
    pub address: Pubkey
}