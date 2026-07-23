import "server-only";

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * Encrypts/decrypts credential secrets (API keys, tokens, etc.) before they
 * are stored in / read from the database. The `Credential.value` column
 * should never contain plaintext.
 *
 * Requires a `CREDENTIALS_ENCRYPTION_KEY` env var (any non-empty string —
 * it's stretched into a 32 byte key via scrypt). Falls back to a fixed dev
 * key outside production so local setup keeps working, but this MUST be set
 * to a strong random value in production.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const SALT = "n8ncopy-credentials";

const getKey = () => {
    const secret = process.env.CREDENTIALS_ENCRYPTION_KEY;

    if (!secret) {
        if (process.env.NODE_ENV === "production") {
            throw new Error(
                "CREDENTIALS_ENCRYPTION_KEY is not set. Refusing to encrypt credentials with a fallback key in production."
            );
        }
        return scryptSync("dev-only-insecure-key", SALT, 32);
    }

    return scryptSync(secret, SALT, 32);
};

export const encryptSecret = (plainText: string) => {
    const key = getKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
};

export const decryptSecret = (encoded: string) => {
    const [ivHex, authTagHex, dataHex] = encoded.split(":");

    if (!ivHex || !authTagHex || !dataHex) {
        throw new Error("Invalid encrypted credential value");
    }

    const key = getKey();
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(dataHex, "hex")),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
};
