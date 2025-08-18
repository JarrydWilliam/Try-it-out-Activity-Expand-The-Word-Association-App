// public/javascripts/auth.js
// Tiny helpers using Web Crypto API for SHA-256 hashing and salt generation

function toHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let b of bytes) {
    hex += b.toString(16).padStart(2, '0');
  }
  return hex;
}

async function sha256Hex(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}

function randomSaltHex(lenBytes = 8) { // 8 bytes = 16 hex chars
  const arr = new Uint8Array(lenBytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}
