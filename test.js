"use strict";

const assert = require("assert");
const CryptoCore = require("./src/crypto-core");

function fromHex(hexText) {
  return hexText.match(/../g).map((value) => Number.parseInt(value, 16));
}

const aesVector = CryptoCore.aesEncryptBlockTrace(
  fromHex("00112233445566778899aabbccddeeff"),
  fromHex("000102030405060708090a0b0c0d0e0f")
);

assert.strictEqual(aesVector.cipherHex, "69C4E0D86A7B0430D8CDB78070B4C55A");
assert.strictEqual(CryptoCore.gfMul(0x57, 0x83), 0xc1);
assert.strictEqual(CryptoCore.gfAdd(0x57, 0x83), 0xd4);

const des = CryptoCore.educationalDesBlock("CRYPTO42", "K1FINAL!");
assert.strictEqual(des.rounds.length, 8);
assert.strictEqual(des.bytes.length, 8);

const triple = CryptoCore.educationalTripleDes("CRYPTO42", "K1FINAL!", "K2FINAL!");
assert.strictEqual(triple.bytes.length, 8);

console.log("Tüm yerel doğrulamalar geçti.");
