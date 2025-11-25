use anchor_lang::prelude::*;

/// This is a minimal Anchor program skeleton for zkVerse.
/// It does not implement real zk routing yet, but anchors the
/// idea of an on-chain program that will verify proofs in the
/// future.

declare_id!("ZkVerSeDemo111111111111111111111111111111111");

#[program]
pub mod zkverse_demo {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        // For now this program does nothing. In a real implementation,
        // this would set up PDA state, authority, or configuration.
        Ok(())
    }

    pub fn record_deposit(
        _ctx: Context<RecordDeposit>,
        _amount: u64,
        _recipient: Pubkey,
    ) -> Result<()> {
        // Future: record a deposit commitment, not the raw values.
        Ok(())
    }

    pub fn record_withdrawal(
        _ctx: Context<RecordWithdrawal>,
        _nullifier: [u8; 32],
    ) -> Result<()> {
        // Future: mark nullifier as spent (prevent double spend).
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct RecordDeposit<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is a demo; in real code, proper constraints are required.
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordWithdrawal<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is a demo; in real code, proper constraints are required.
    pub system_program: Program<'info, System>,
}
