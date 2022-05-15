use anchor_lang::prelude::*;
use anchor_lang::solana_program::instruction::Instruction;
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_lang::solana_program::borsh::try_from_slice_unchecked;
mod context;
mod constants;
mod state;
mod wormhole;
use wormhole::*;
use context::*;


declare_id!("AxJUYo5P9SL9f1XHxdqUSaAvGPqSbFNMcgQ9tZENyofB");

#[program]
pub mod solana_project {

    use anchor_lang::solana_program::program::invoke_signed;

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.config.owner = ctx.accounts.owner.key();
        ctx.accounts.config.nonce = 1;
        Ok(())
    }

    pub fn register_chain(ctx:Context<RegisterChain>, _chain_id:u16, emitter_addr:Pubkey) -> Result<()> {
        ctx.accounts.emitter_address.address = emitter_addr;
        Ok(())
    }

    pub fn send_msg(ctx:Context<SendMsg>, msg:String) -> Result<()> {
        //Look Up Fee
        let bridge_data:BridgeData = try_from_slice_unchecked(&ctx.accounts.wormhole_config.data.borrow_mut())?;
        
        //Send Fee
        invoke_signed(
            &transfer(
                &ctx.accounts.payer.key(),
                &ctx.accounts.wormhole_fee_collector.key(),
                bridge_data.config.fee
            ),
            &[],
            &[]
        )?;

        //Send Post Msg Tx
        let sendmsg_ix = Instruction {
            program_id: ctx.accounts.core_bridge.key(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.payer.key(), true),
                AccountMeta::new_readonly(ctx.accounts.wormhole_derived_emitter.key(), false),
                AccountMeta::new(ctx.accounts.wormhole_message_key.key(), true),
                AccountMeta::new(ctx.accounts.wormhole_config.key(), false),
                AccountMeta::new(ctx.accounts.wormhole_fee_collector.key(), false),
                AccountMeta::new(ctx.accounts.wormhole_sequence.key(), false),
                AccountMeta::new_readonly(ctx.accounts.core_bridge.key(), false),
                AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                AccountMeta::new_readonly(ctx.accounts.rent.key(), false),
                AccountMeta::new_readonly(ctx.accounts.clock.key(), false),
            ],
            data: (
                wormhole::Instruction::PostMessage,
                PostMessageData {
                    nonce: ctx.accounts.config.nonce,
                    payload: msg.as_bytes().try_to_vec()?,
                    consistency_level: wormhole::ConsistencyLevel::Confirmed,
                },
            ).try_to_vec()?,
        };

        invoke_signed(&sendmsg_ix,
            &[
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.wormhole_derived_emitter.to_account_info(),
                ctx.accounts.wormhole_message_key.to_account_info(),
                ctx.accounts.wormhole_config.to_account_info(),
                ctx.accounts.wormhole_fee_collector.to_account_info(),
                ctx.accounts.wormhole_sequence.to_account_info(),
                ctx.accounts.core_bridge.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
                ctx.accounts.clock.to_account_info()
            ],
            &[
                &[
                    b"Bridge".as_ref(),
                    &[*ctx.bumps.get("wormhole_config").unwrap()]
                ],
                &[
                    b"fee_collector".as_ref(),
                    &[*ctx.bumps.get("wormhole_fee_collector").unwrap()]
                ],
                &[
                    b"sequence".as_ref(),
                    ctx.accounts.wormhole_derived_emitter.key().to_bytes().as_ref(),
                    &[*ctx.bumps.get("wormhole_sequence").unwrap()]
                ],
                &[
                    b"fee_collector".as_ref(),
                    &[*ctx.bumps.get("wormhole_fee_collector").unwrap()]
                ],
            ]
        )?;

        ctx.accounts.config.nonce += 1;
        Ok(())
    }

    pub fn recieve_msg(_ctx:Context<RecieveMsg>) -> Result<()> {
        Ok(())
    }
}