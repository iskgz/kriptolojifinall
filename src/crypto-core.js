(function (root) {
  "use strict";

  const SBOX = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
  ];
  const RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

  function hex(n) {
    return n.toString(16).padStart(2, "0").toUpperCase();
  }

  function textToBlock(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    while (bytes.length < 16) bytes.push(0);
    return bytes.slice(0, 16);
  }

  function inputToBlock(input, size) {
    const bytes = Array.isArray(input) ? input.slice() : textToBlock(String(input));
    while (bytes.length < size) bytes.push(0);
    return bytes.slice(0, size);
  }

  function xorBytes(a, b) {
    return a.map((value, index) => value ^ b[index]);
  }

  function gfAdd(a, b) {
    return a ^ b;
  }

  function gfMul(a, b) {
    let product = 0;
    for (let i = 0; i < 8; i += 1) {
      if (b & 1) product ^= a;
      const highBit = a & 0x80;
      a = (a << 1) & 0xff;
      if (highBit) a ^= 0x1b;
      b >>= 1;
    }
    return product;
  }

  function gfMulTrace(a, b) {
    const steps = [];
    let aa = a;
    let bb = b;
    let product = 0;
    for (let i = 0; i < 8; i += 1) {
      const add = Boolean(bb & 1);
      if (add) product ^= aa;
      const highBit = aa & 0x80;
      const before = aa;
      aa = (aa << 1) & 0xff;
      if (highBit) aa ^= 0x1b;
      steps.push({
        round: i + 1,
        add,
        multiplicand: before,
        product,
        next: aa,
      });
      bb >>= 1;
    }
    return steps;
  }

  function subWord(word) {
    return word.map((byte) => SBOX[byte]);
  }

  function rotWord(word) {
    return [word[1], word[2], word[3], word[0]];
  }

  function keyExpansion(key) {
    const words = [];
    for (let i = 0; i < 4; i += 1) words.push(key.slice(i * 4, i * 4 + 4));
    for (let i = 4; i < 44; i += 1) {
      let temp = words[i - 1].slice();
      if (i % 4 === 0) {
        temp = subWord(rotWord(temp));
        temp[0] ^= RCON[i / 4];
      }
      words.push(words[i - 4].map((byte, index) => byte ^ temp[index]));
    }
    const roundKeys = [];
    for (let r = 0; r <= 10; r += 1) {
      roundKeys.push(words.slice(r * 4, r * 4 + 4).flat());
    }
    return roundKeys;
  }

  function subBytes(state) {
    return state.map((byte) => SBOX[byte]);
  }

  function shiftRows(state) {
    const out = state.slice();
    for (let row = 1; row < 4; row += 1) {
      const values = [];
      for (let col = 0; col < 4; col += 1) values.push(state[col * 4 + row]);
      const shifted = values.slice(row).concat(values.slice(0, row));
      for (let col = 0; col < 4; col += 1) out[col * 4 + row] = shifted[col];
    }
    return out;
  }

  function mixSingleColumn(col) {
    return [
      gfMul(0x02, col[0]) ^ gfMul(0x03, col[1]) ^ col[2] ^ col[3],
      col[0] ^ gfMul(0x02, col[1]) ^ gfMul(0x03, col[2]) ^ col[3],
      col[0] ^ col[1] ^ gfMul(0x02, col[2]) ^ gfMul(0x03, col[3]),
      gfMul(0x03, col[0]) ^ col[1] ^ col[2] ^ gfMul(0x02, col[3]),
    ];
  }

  function mixColumns(state) {
    const out = state.slice();
    for (let col = 0; col < 4; col += 1) {
      const mixed = mixSingleColumn(state.slice(col * 4, col * 4 + 4));
      for (let row = 0; row < 4; row += 1) out[col * 4 + row] = mixed[row];
    }
    return out;
  }

  function addRoundKey(state, key) {
    return xorBytes(state, key);
  }

  function aesEncryptTrace(plainText, keyText) {
    const plain = textToBlock(plainText);
    const key = textToBlock(keyText);
    return aesEncryptBlockTrace(plain, key);
  }

  function aesEncryptBlockTrace(plain, key) {
    const roundKeys = keyExpansion(key);
    let state = plain.slice();
    const steps = [
      {
        title: "Başlangıç durumu",
        round: 0,
        state: state.slice(),
        explanation: "Metin 16 byte'a tamamlanır ve AES'in sütun tabanlı durum matrisine yerleştirilir.",
      },
    ];
    state = addRoundKey(state, roundKeys[0]);
    steps.push({
      title: "Round 0 - AddRoundKey",
      round: 0,
      state: state.slice(),
      explanation: "İlk round anahtarı durum matrisi ile XOR'lanır. AES'te toplama GF(2^8) üzerinde XOR işlemidir.",
    });
    for (let round = 1; round <= 9; round += 1) {
      state = subBytes(state);
      steps.push({ title: `Round ${round} - SubBytes`, round, state: state.slice(), explanation: "Her byte AES S-box ile doğrusal olmayan biçimde değiştirilir. Bu adım karıştırma ve saldırılara direnç sağlar." });
      state = shiftRows(state);
      steps.push({ title: `Round ${round} - ShiftRows`, round, state: state.slice(), explanation: "Satırlar sola kaydırılır. Böylece byte'lar sütunlar arasında yayılır ve difüzyon artar." });
      state = mixColumns(state);
      steps.push({ title: `Round ${round} - MixColumns`, round, state: state.slice(), explanation: "Her sütun GF(2^8) aritmetiğiyle sabit bir matrisle çarpılır. Çarpma indirgeme polinomu x^8+x^4+x^3+x+1 ile yapılır." });
      state = addRoundKey(state, roundKeys[round]);
      steps.push({ title: `Round ${round} - AddRoundKey`, round, state: state.slice(), explanation: "Round anahtarı tekrar XOR ile eklenir. Anahtar genişletme çıktısı her round için farklıdır." });
    }
    state = subBytes(state);
    steps.push({ title: "Round 10 - SubBytes", round: 10, state: state.slice(), explanation: "Final round doğrusal olmayan S-box dönüşümüyle başlar." });
    state = shiftRows(state);
    steps.push({ title: "Round 10 - ShiftRows", round: 10, state: state.slice(), explanation: "Final round'da satırlar yine kaydırılır." });
    state = addRoundKey(state, roundKeys[10]);
    steps.push({ title: "Round 10 - AddRoundKey", round: 10, state: state.slice(), explanation: "Final round'da MixColumns yoktur; son anahtar XOR'u şifreli bloğu üretir." });
    return { steps, cipherHex: state.map(hex).join(""), roundKeys };
  }

  function feistelRound(right, key, round) {
    const out = [];
    for (let i = 0; i < right.length; i += 1) {
      const rotated = ((right[i] << 1) | (right[i] >> 7)) & 0xff;
      out.push((rotated ^ key[(i + round) % key.length] ^ (round * 17)) & 0xff);
    }
    return out;
  }

  function educationalDesBlock(text, keyText, decrypt = false) {
    const block = inputToBlock(text, 8);
    const key = inputToBlock(keyText, 8);
    let left = block.slice(0, 4);
    let right = block.slice(4, 8);
    const order = decrypt ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
    const rounds = [];
    for (const round of order) {
      const f = feistelRound(right, key, round);
      const newRight = left.map((byte, index) => byte ^ f[index]);
      left = right;
      right = newRight;
      rounds.push({ round, left: left.slice(), right: right.slice(), f });
    }
    return { bytes: right.concat(left), rounds };
  }

  function educationalTripleDes(text, key1, key2) {
    const first = educationalDesBlock(text, key1, false);
    const second = educationalDesBlock(first.bytes, key2, true);
    const third = educationalDesBlock(second.bytes, key1, false);
    return { first, second, third, bytes: third.bytes };
  }

  const api = {
    aesEncryptTrace,
    aesEncryptBlockTrace,
    educationalDesBlock,
    educationalTripleDes,
    gfAdd,
    gfMul,
    gfMulTrace,
    hex,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CryptoCore = api;
})(typeof window !== "undefined" ? window : globalThis);
