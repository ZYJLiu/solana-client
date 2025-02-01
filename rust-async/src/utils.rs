use anyhow::Result;
use solana_sdk::signer::keypair::Keypair;
use std::{env, fs::OpenOptions, io::Write};

pub async fn get_or_create_keypair(variable_name: &str) -> Result<Keypair> {
    dotenv::dotenv().ok();

    if let Ok(secret_key_string) = env::var(variable_name) {
        let decoded_secret_key: Vec<u8> = serde_json::from_str(&secret_key_string)?;
        return Ok(Keypair::from_bytes(&decoded_secret_key)?);
    }

    let keypair = Keypair::new();
    let secret_key_bytes = keypair.to_bytes().to_vec();
    let json_secret_key = serde_json::to_string(&secret_key_bytes)?;

    OpenOptions::new()
        .append(true)
        .create(true)
        .open(".env")?
        .write_all(format!("{}={}\n", variable_name, json_secret_key).as_bytes())?;

    Ok(keypair)
}
