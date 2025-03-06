import {
  airdropFactory,
  appendTransactionMessageInstructions,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  lamports,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import { getOrCreateKeypair } from "./utils";

const wallet_1 = await getOrCreateKeypair("wallet_1");
console.log("wallet_1 address:", wallet_1.address);

// Create Connection, localhost in this example
const rpc = createSolanaRpc("http://127.0.0.1:8899");
const rpcSubscriptions = createSolanaRpcSubscriptions("ws://127.0.0.1:8900");

// Request the airdrop
const transactionSignature = await airdropFactory({ rpc, rpcSubscriptions })({
  recipientAddress: wallet_1.address,
  lamports: lamports(5_000_000_000n), // 5 SOL
  commitment: "confirmed",
});

// Fetch the lamport balance after requesting airdrop
const balance = await rpc.getBalance(wallet_1.address).send();
console.log("wallet_1 balance:", balance.value / 1_000_000_000n);

// Link to the transaction on Solana Explorer, custom cluster defaults to localhost
console.log(
  "Transaction Signature:",
  `https://explorer.solana.com/tx/${transactionSignature}?cluster=custom`
);
