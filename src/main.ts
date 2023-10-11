import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";

import { getKeypairFromEnvironment } from "./utils";

// Establish a connection to the Solana devnet cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Use existing keypairs or generate new ones if they don't exist
const wallet_1 = await getKeypairFromEnvironment("wallet_1");

// Fetch the lamport balance for the specified public key
const balance = await connection.getBalance(wallet_1.publicKey);
console.log("wallet_1 balance:", balance / LAMPORTS_PER_SOL);
