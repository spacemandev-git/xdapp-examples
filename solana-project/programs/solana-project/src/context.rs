use anchor_lang::prelude::*;
use crate::constants::*;
use crate::state::*;
use std::str::FromStr;
use anchor_lang::solana_program::sysvar::{rent, clock};
#[derive(Accounts)]
pub struct SetOwner<'info> {
    #[account(
        init,
        seeds=[b"owner".as_ref()],
        payer=owner,
        bump,
        space=8+32
    )]
    pub owner_acc: Account<'info, OwnerAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(_chain_id:u16, emitter_addr:Pubkey)]
pub struct RegisterChain<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        constraint = owner_acc.owner == owner.key()
    )]
    pub owner_acc: Account<'info, OwnerAccount>,
    #[account(
        init,
        seeds=[b"EmitterAddress".as_ref(), _chain_id.to_be_bytes().as_ref()],
        payer=owner,
        bump,
        space=8+32
    )]
    pub emitter_address: Account<'info, EmitterAddrAccount>,
}

#[derive(Accounts)]
pub struct SendMsg<'info>{
    #[account(
        constraint = core_bridge.key() == Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap()
    )]
    pub core_bridge: AccountInfo<'info>,
    #[account(
        seeds = [
            b"Bridge".as_ref()
        ],
        bump,
        seeds::program = Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap()
    )]
    pub wormhole_config: AccountInfo<'info>,
    #[account(
        seeds = [
            b"fee_collector".as_ref()
        ],
        bump,
        seeds::program = Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap()
    )]
    pub wormhole_fee_collector: AccountInfo<'info>,
    #[account(
        seeds = [
            b"emitter".as_ref(),
        ],
        bump,
        seeds::program = Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap()
    )]
    pub wormhole_derived_emitter: AccountInfo<'info>,
    #[account(
        seeds = [
            b"sequence".as_ref(),
            wormhole_derived_emitter.key().to_bytes().as_ref()
        ],
        bump,
        seeds::program = Pubkey::from_str(CORE_BRIDGE_ADDRESS).unwrap()
    )]
    pub wormhole_sequence: AccountInfo<'info>,

    //TODO: FIGURE OUT WHAT THIS IS USED FOR
    pub wormhole_message_key: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    #[account(
        constraint = clock.key() == clock::id()
    )]
    pub clock: AccountInfo<'info>,
    #[account(
        constraint = rent.key() == rent::id()
    )]
    pub rent: AccountInfo<'info>
}

#[derive(Accounts)]
pub struct RecieveMsg{

}