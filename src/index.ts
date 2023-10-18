import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateKeypair } from "./utils";

// Helper function to generate or reuse existing keypairs from `.env` file
const wallet_1 = getOrCreateKeypair("wallet_1");
console.log("wallet_1 address:", wallet_1.publicKey.toBase58());

// Establish a connection to the Solana devnet cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Fetch the lamport balance before requesting airdrop
const preBalance = await connection.getBalance(wallet_1.publicKey);
console.log("wallet_1 prebalance:", preBalance / LAMPORTS_PER_SOL);

// Request the airdrop
const transactionSignature = await connection.requestAirdrop(
  wallet_1.publicKey,
  5 * LAMPORTS_PER_SOL // 5 SOL
);

// Fetch the latest blockhash from the cluster
const { blockhash, lastValidBlockHeight } =
  await connection.getLatestBlockhash();

// Confirm the airdrop transaction
await connection.confirmTransaction(
  {
    blockhash,
    lastValidBlockHeight,
    signature: transactionSignature,
  },
  "confirmed"
);

// Fetch the lamport balance after requesting airdrop
const postBalance = await connection.getBalance(wallet_1.publicKey);
console.log("wallet_1 postbalance:", postBalance / LAMPORTS_PER_SOL);

// Link to the transaction on Solana Explorer
console.log(
  "Transaction Signature:",
  `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
);
