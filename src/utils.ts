import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";

import base58 from "bs58";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export const getKeypairFromEnvironment = (variableName: string) => {
  const secretKeyString = process.env[variableName];
  if (!secretKeyString) {
    // Generate a new keypair
    const keypair = Keypair.generate();
    // Save to .env file
    fs.appendFileSync(
      ".env",
      `\n${variableName}=${JSON.stringify(Array.from(keypair.secretKey))}`
    );
    return keypair;
  }

  // Try the shorter base58 format first
  let decodedSecretKey: Uint8Array;
  try {
    decodedSecretKey = base58.decode(secretKeyString);
    return Keypair.fromSecretKey(decodedSecretKey);
  } catch (throwObject) {
    const error = throwObject as Error;
    if (!error.message.includes("Non-base58 character")) {
      throw new Error(
        `Invalid secret key in environment variable '${variableName}'!`
      );
    }
  }

  // Try the longer JSON format
  try {
    decodedSecretKey = Uint8Array.from(JSON.parse(secretKeyString));
  } catch (error) {
    throw new Error(
      `Invalid secret key in environment variable '${variableName}'!`
    );
  }
  return Keypair.fromSecretKey(decodedSecretKey);
};

// This function will request an airdrop of 2 SOL to the given public key if its balance is less than 1 SOL
export async function airdropSolIfNeeded(publicKey: PublicKey) {
  // Establish a connection to the Solana devnet cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Get the current balance of the public key
  const currentBalance = await connection.getBalance(publicKey);
  const balanceInSOL = currentBalance / LAMPORTS_PER_SOL;
  console.log("Current balance is", balanceInSOL);

  // Check if the balance is less than 1 SOL
  const insufficientFunds = balanceInSOL < 1;

  if (insufficientFunds) {
    try {
      // 2 SOL
      console.log("Balance is less than 1 SOL. Airdropping 2 SOL...");
      const amountInLamports = 2 * LAMPORTS_PER_SOL;

      // Request the airdrop
      const txSignature = await connection.requestAirdrop(
        publicKey,
        amountInLamports
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      // Confirm the airdrop transaction
      await connection.confirmTransaction(
        { blockhash, lastValidBlockHeight, signature: txSignature },
        "confirmed"
      );

      // Check and log the new balance
      const newBalance = await connection.getBalance(publicKey);
      console.log("New balance is", newBalance / LAMPORTS_PER_SOL);
    } catch (e) {
      // Log an error message if the airdrop fails (likely due to rate limits)
      console.log(
        "Airdrop Unsuccessful, likely rate-limited. Try again later."
      );
    }
  }
}
