use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct OwnerAccount{
    pub owner: Pubkey
}

#[account]
#[derive(Default)]
pub struct EmitterAddrAccount{
    pub address: Pubkey
}