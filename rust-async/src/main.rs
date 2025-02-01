use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{commitment_config::CommitmentConfig, native_token::LAMPORTS_PER_SOL, signer::Signer};
use anyhow::Result;

mod utils;
use utils::get_or_create_keypair;

#[tokio::main]
async fn main() -> Result<()> {
    let wallet_1 = get_or_create_keypair("wallet_1").await?;
    println!("wallet_1 address: {}", wallet_1.pubkey());

    let client =
        RpcClient::new_with_commitment(String::from("http://127.0.0.1:8899"), CommitmentConfig::confirmed());
    
    let transaction_signature = client.request_airdrop(&wallet_1.pubkey(), 5 * LAMPORTS_PER_SOL).await?;

    loop {
       if client.confirm_transaction(&transaction_signature).await? {
        break;
       }
    }

    let balance = client.get_balance(&wallet_1.pubkey()).await?;
    println!("wallet_1 balance: {}", balance / LAMPORTS_PER_SOL);

    println!(
        "Transaction Signature: https://explorer.solana.com/tx/{}?cluster=custom",
        transaction_signature
    );
    Ok(())
}
