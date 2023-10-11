import { Keypair } from "@solana/web3.js";
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
