"use strict";
const input = document.getElementById("text-input");
const button = document.getElementById("show-button");
const output = document.getElementById("output");
const TYPING_DELAY_MS = 70;
let typingTimer;
// ---- 사운드 (Web Audio API, 소리 파일 없이 코드로 생성) ----
const BEEP_VOLUME = 0.08; // 0 ~ 1
const BEEP_DURATION_S = 0.05; // 삑 소리 길이(초)
let audioCtx;
function getAudioContext() {
    // 브라우저는 사용자 클릭 이후에만 소리를 허용하므로 버튼을 누를 때 처음 만든다
    if (!audioCtx)
        audioCtx = new AudioContext();
    if (audioCtx.state === "suspended")
        void audioCtx.resume();
    return audioCtx;
}
function playBeep() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "square";
    // 높이를 조금씩 바꿔서 8비트 게임 대사창 느낌을 냄
    osc.frequency.value = 600 + Math.floor(Math.random() * 4) * 100;
    const gain = ctx.createGain();
    // 시작/끝을 아주 짧게 페이드해서 '딱' 하는 잡음을 막음
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(BEEP_VOLUME, now + 0.005);
    gain.gain.setValueAtTime(BEEP_VOLUME, now + BEEP_DURATION_S - 0.01);
    gain.gain.linearRampToValueAtTime(0, now + BEEP_DURATION_S);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + BEEP_DURATION_S);
}
function typeText(text) {
    // 이전 타이핑이 진행 중이면 멈추고 새로 시작
    if (typingTimer !== undefined) {
        clearTimeout(typingTimer);
        typingTimer = undefined;
    }
    output.textContent = "";
    // 한글·이모지가 깨지지 않도록 문자 단위로 분리
    const chars = Array.from(text);
    let index = 0;
    const typeNext = () => {
        if (index >= chars.length) {
            typingTimer = undefined;
            return;
        }
        const ch = chars[index];
        output.textContent += ch;
        // 공백에서는 소리를 내지 않음
        if (ch.trim() !== "")
            playBeep();
        index++;
        // 글자마다 간격을 살짝 다르게 해서 실제 타이핑처럼 보이게 함
        const jitter = Math.random() * 60;
        typingTimer = window.setTimeout(typeNext, TYPING_DELAY_MS + jitter);
    };
    typeNext();
}
function showValue() {
    typeText(input.value);
}
button.addEventListener("click", showValue);
input.addEventListener("keydown", (event) => {
    if (event.key === "Enter")
        showValue();
});
