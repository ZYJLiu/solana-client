import dotenv from "dotenv";
import fs from "fs";
import { createKeyPairSignerFromPrivateKeyBytes } from "@solana/web3.js";
import type { KeyPairSigner } from "@solana/web3.js";

dotenv.config();

export const getOrCreateKeypair = async (
  variableName: string
): Promise<KeyPairSigner> => {
  // Check if the secret with variable name exists in the .env file
  const secretKeyString = process.env[variableName];
  if (!secretKeyString) {
    // Generate Ed25519 keypair using Web Crypto API
    const keyPair = await crypto.subtle.generateKey("Ed25519", true, [
      "sign",
      "verify",
    ]);

    // Export the private key as JWK
    const privateKeyJwk = await crypto.subtle.exportKey(
      "jwk",
      keyPair.privateKey
    );
    if (!privateKeyJwk.d) throw new Error("Failed to get private key bytes");

    // Convert base64url to raw bytes
    const privateKeyBytes = new Uint8Array(
      Buffer.from(privateKeyJwk.d, "base64")
    );

    // Store private key bytes in .env
    fs.appendFileSync(
      ".env",
      `\n${variableName}=${JSON.stringify(Array.from(privateKeyBytes))}`
    );

    // Create and return KeyPairSigner
    return createKeyPairSignerFromPrivateKeyBytes(privateKeyBytes);
  }

  try {
    // Parse the stored array format
    const privateKeyArray = JSON.parse(secretKeyString);
    const privateKeyBytes = new Uint8Array(privateKeyArray);

    // Create and return KeyPairSigner from stored private key
    return createKeyPairSignerFromPrivateKeyBytes(privateKeyBytes);
  } catch (error) {
    console.error(error);
    throw new Error(
      `Invalid secret key in environment variable '${variableName}'!`
    );
  }
};
