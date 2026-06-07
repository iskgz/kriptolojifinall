"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

let aesSteps = [];
let aesIndex = 0;
let aesTimer = null;

function setStatus(text) {
  $("#statusPill").textContent = text;
}

function normalizeHex(input) {
  const clean = input.trim().replace(/^0x/i, "");
  const value = Number.parseInt(clean || "0", 16);
  if (Number.isNaN(value) || value < 0 || value > 255) throw new Error("Hex değer 00-FF aralığında olmalıdır.");
  return value;
}

function renderMatrix(step, previous) {
  const matrix = $("#aesMatrix");
  matrix.innerHTML = "";
  step.state.forEach((byte, index) => {
    const cell = document.createElement("div");
    cell.className = "byte-cell";
    if (previous && previous.state[index] !== byte) cell.classList.add("changed");
    cell.textContent = CryptoCore.hex(byte);
    matrix.appendChild(cell);
  });
  $("#aesStepTitle").textContent = step.title;
  $("#aesStepIndex").textContent = `${aesIndex + 1} / ${aesSteps.length}`;
  $("#aesExplanation").textContent = step.explanation;
}

function showAesStep() {
  if (!aesSteps.length) return;
  renderMatrix(aesSteps[aesIndex], aesSteps[aesIndex - 1]);
}

function runAes() {
  const trace = CryptoCore.aesEncryptTrace($("#aesPlain").value, $("#aesKey").value);
  aesSteps = trace.steps;
  aesIndex = 0;
  $("#aesCipher").textContent = trace.cipherHex;
  showAesStep();
  setStatus("AES adımları üretildi");
}

function moveAes(delta) {
  aesIndex = Math.min(Math.max(aesIndex + delta, 0), aesSteps.length - 1);
  showAesStep();
}

function toggleAesPlay() {
  if (aesTimer) {
    clearInterval(aesTimer);
    aesTimer = null;
    $("#aesPlay").textContent = "Oynat";
    return;
  }
  $("#aesPlay").textContent = "Dur";
  aesTimer = setInterval(() => {
    if (aesIndex >= aesSteps.length - 1) {
      toggleAesPlay();
      return;
    }
    moveAes(1);
  }, Number($("#aesSpeed").value));
}

function runGf() {
  try {
    const a = normalizeHex($("#gfA").value);
    const b = normalizeHex($("#gfB").value);
    const sum = CryptoCore.gfAdd(a, b);
    const product = CryptoCore.gfMul(a, b);
    $("#gfResult").innerHTML = `<code>${CryptoCore.hex(a)}</code> + <code>${CryptoCore.hex(b)}</code> = <code>${CryptoCore.hex(sum)}</code><br><code>${CryptoCore.hex(a)}</code> x <code>${CryptoCore.hex(b)}</code> = <code>${CryptoCore.hex(product)}</code>`;
    const trace = $("#gfTrace");
    trace.innerHTML = "";
    CryptoCore.gfMulTrace(a, b).forEach((step) => {
      const li = document.createElement("li");
      li.textContent = `${step.round}. tur: ${step.add ? "sonuca ekle" : "ekleme yok"}, ara çarpan ${CryptoCore.hex(step.multiplicand)}, yeni sonuç ${CryptoCore.hex(step.product)}, sonraki çarpan ${CryptoCore.hex(step.next)}`;
      trace.appendChild(li);
    });
    setStatus("GF hesaplandı");
  } catch (error) {
    setStatus(error.message);
  }
}

function bytesHex(bytes) {
  return bytes.map(CryptoCore.hex).join("");
}

function runDes() {
  const text = $("#desText").value;
  const key1 = $("#desKey1").value;
  const key2 = $("#desKey2").value;
  const des = CryptoCore.educationalDesBlock(text, key1);
  const triple = CryptoCore.educationalTripleDes(text, key1, key2);
  const rounds = $("#desRounds");
  rounds.innerHTML = "";
  des.rounds.forEach((round) => {
    const card = document.createElement("div");
    card.className = "round-card";
    card.innerHTML = `<strong>Round ${round.round}</strong><code>L=${bytesHex(round.left)} R=${bytesHex(round.right)} F=${bytesHex(round.f)}</code>`;
    rounds.appendChild(card);
  });
  $("#desResult").innerHTML = `Basitleştirilmiş DES çıktısı: <code>${bytesHex(des.bytes)}</code><br>3-DES EDE çıktısı: <code>${bytesHex(triple.bytes)}</code><br><br>3-DES aynı Feistel çekirdeğini şifrele-çöz-şifrele zinciriyle kullanır; iki anahtar kullanıldığı için tek DES'e göre anahtar uzayı büyür.`;
  setStatus("DES/3-DES çalıştı");
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(CryptoCore.hex).join("");
}

async function hmacHex(text, keyText) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(keyText), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(text));
  return Array.from(new Uint8Array(sig)).map(CryptoCore.hex).join("");
}

async function runHash() {
  const text = $("#hashText").value;
  const key = $("#hmacKey").value;
  $("#shaOut").textContent = await sha256Hex(text);
  $("#hmacOut").textContent = await hmacHex(text, key);
  setStatus("Hash ve HMAC üretildi");
}

function runRbg() {
  const count = Math.min(Math.max(Number($("#rbgCount").value) || 16, 4), 64);
  const bytes = new Uint8Array(count);
  crypto.getRandomValues(bytes);
  const bits = Array.from(bytes, (byte) => byte.toString(2).padStart(8, "0")).join("");
  const ones = bits.split("").filter((bit) => bit === "1").length;
  const zeros = bits.length - ones;
  const ratio = ones / bits.length;
  $("#rbgBits").textContent = bits.match(/.{1,8}/g).join(" ");
  $("#rbgStats").innerHTML = `Toplam bit: <strong>${bits.length}</strong><br>0 sayısı: <strong>${zeros}</strong><br>1 sayısı: <strong>${ones}</strong><br>1 oranı: <strong>${(ratio * 100).toFixed(2)}%</strong>`;
  $("#rbgBar").style.width = `${ratio * 100}%`;
  setStatus("Rastgele bit üretildi");
}

function bindNavigation() {
  $$(".nav-button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".nav-button").forEach((item) => item.classList.remove("active"));
      $$(".panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      $(`#panel-${button.dataset.panel}`).classList.add("active");
    });
  });
}

function boot() {
  bindNavigation();
  $("#aesRun").addEventListener("click", runAes);
  $("#aesPrev").addEventListener("click", () => moveAes(-1));
  $("#aesNext").addEventListener("click", () => moveAes(1));
  $("#aesPlay").addEventListener("click", toggleAesPlay);
  $("#gfRun").addEventListener("click", runGf);
  $("#desRun").addEventListener("click", runDes);
  $("#hashRun").addEventListener("click", runHash);
  $("#rbgRun").addEventListener("click", runRbg);
  runAes();
  runGf();
  runDes();
  runHash();
  runRbg();
}

boot();
