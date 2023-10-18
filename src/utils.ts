import { Keypair } from "@solana/web3.js";
import base58 from "bs58";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export const getOrCreateKeypair = (variableName: string) => {
  // Check if the secret with variable name exists in the .env file
  const secretKeyString = process.env[variableName];
  if (!secretKeyString) {
    // Create new keypair one does not exist
    const keypair = new Keypair();
    // Append secretKey to .env file
    fs.appendFileSync(
      ".env",
      `\n${variableName}=${JSON.stringify(Object.values(keypair.secretKey))}`
    );
    // Return the generated keypair
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

  // Return the decoded secret key from the environment variable
  return Keypair.fromSecretKey(decodedSecretKey);
};
