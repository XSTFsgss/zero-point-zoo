// Lightweight Web Audio API sound effects (no external files needed)
(function (global) {
class SoundFX {
  constructor() {
    this.enabled = localStorage.getItem('anyue_sound') !== 'off';
    this.ctx = null;
  }

  _getCtx() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('anyue_sound', this.enabled ? 'on' : 'off');
    if (this.enabled) this.chime();
    return this.enabled;
  }

  chime(freq = 660, duration = 0.14) {
    const ctx = this._getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.28, now + duration);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  earTap() {
    this.chime(740, 0.1);
    setTimeout(() => this.chime(980, 0.12), 70);
  }

  walkieBeep() {
    const ctx = this._getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Double radio squelch beep
    [0, 0.12].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(i === 0 ? 1180 : 1420, now + offset);
      gain.gain.setValueAtTime(0.07, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.09);
    });
  }

  alertPing(level = 1) {
    const ctx = this._getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const count = level >= 2 ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(level >= 2 ? 880 : 620, now + i * 0.16);
      gain.gain.setValueAtTime(0.08, now + i * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.16 + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.16);
      osc.stop(now + i * 0.16 + 0.13);
    }
  }

  notebookFlip() {
    this.chime(520, 0.08);
  }
}

global.AnYueAudio = new SoundFX();
})(window);
