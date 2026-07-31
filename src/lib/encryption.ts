import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm" as const;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;
const SALT = "n8ncopy-credentials";
const DEV_KEY = "dev-only-insecure-key";

const getKey = () => {
  const secret = process.env.CREDENTIALS_ENCRYPTION_KEY?.trim();

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CREDENTIALS_ENCRYPTION_KEY is not set. Refusing to use a fallback key in production.",
      );
    }

    return scryptSync(DEV_KEY, SALT, KEY_LENGTH);
  }

  return scryptSync(secret, SALT, KEY_LENGTH);
};

export const encryptSecret = (plainText: string) => {
  if (!plainText) {
    throw new Error("Cannot encrypt an empty credential");
  }

  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
};

export const decryptSecret = (encoded: string) => {
  const parts = encoded.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted credential value");
  }

  const [ivHex, authTagHex, dataHex] = parts;

  if (
    !/^[0-9a-f]+$/i.test(ivHex) ||
    !/^[0-9a-f]+$/i.test(authTagHex) ||
    !/^[0-9a-f]+$/i.test(dataHex)
  ) {
    throw new Error("Invalid encrypted credential encoding");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");

  if (iv.length !== IV_LENGTH || authTag.length !== 16 || encrypted.length === 0) {
    throw new Error("Invalid encrypted credential value");
  }

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    throw new Error("Unable to decrypt credential");
  }
};
