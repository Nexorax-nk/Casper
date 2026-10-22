/**
 * Cryptocurrency Address Validation Utility
 * Validates EVM (Ethereum, Polygon, BSC, Arbitrum), Solana, and Bitcoin address formats.
 */

export function isValidCryptoAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  const trimmed = address.trim();

  // Allowed internal case references and preset case IDs
  if (
    trimmed.startsWith("case_") ||
    trimmed.startsWith("CASE-") ||
    trimmed.startsWith("TRACE-")
  ) {
    return true;
  }

  // EVM format: strictly 0x followed by exactly 40 hexadecimal characters (42 total)
  const isEvm = /^0x[a-fA-F0-9]{40}$/.test(trimmed);
  if (isEvm) return true;

  // Solana format: 32 to 44 base58 characters (excludes 0, O, I, l)
  const isSolana = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed);
  if (isSolana) return true;

  // Bitcoin format: Legacy (1...), P2SH (3...), or Native SegWit (bc1...)
  const isBtc = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$/i.test(trimmed);
  if (isBtc) return true;

  return false;
}

export function getAddressValidationError(address: string): string | null {
  if (!address || !address.trim()) {
    return "Please enter a wallet address.";
  }

  const trimmed = address.trim();

  if (trimmed.startsWith("case_") || trimmed.startsWith("CASE-") || trimmed.startsWith("TRACE-")) {
    return null;
  }

  if (trimmed.length < 20) {
    return "Address is too short. Expected a 42-character hexadecimal EVM address (e.g. 0x71c8...5973).";
  }

  if (trimmed.startsWith("0x")) {
    if (trimmed.length !== 42) {
      return `Invalid EVM address length (${trimmed.length} chars). Expected exactly 42 characters starting with '0x'.`;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      return "Invalid EVM hex format. Address contains non-hexadecimal characters.";
    }
    return null;
  }

  if (!isValidCryptoAddress(trimmed)) {
    return "Invalid wallet format. Please enter a valid 0x... EVM address, Solana, or Bitcoin address.";
  }

  return null;
}
