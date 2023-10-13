import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";

import { getOrCreateKeypair } from "./utils";

// Establish a connection to the Solana devnet cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Use existing keypairs or generate new ones if they don't exist
const wallet_1 = getOrCreateKeypair("wallet_1");
console.log("wallet_1 address:", wallet_1.publicKey.toBase58());

// Fetch the lamport balance for the specified public key
const balance = await connection.getBalance(wallet_1.publicKey);
console.log("wallet_1 balance:", balance / LAMPORTS_PER_SOL);
