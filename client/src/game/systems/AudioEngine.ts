export class AudioEngine {
  private context: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  unlock(): void {
    if (this.context) { void this.context.resume(); return; }
    const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    this.context = new AudioContextConstructor(); this.oscillator = this.context.createOscillator(); this.gain = this.context.createGain();
    this.oscillator.type = "sawtooth"; this.oscillator.frequency.value = 54; this.gain.gain.value = 0.0001; this.oscillator.connect(this.gain); this.gain.connect(this.context.destination); this.oscillator.start();
  }
  update(speed: number, nitro: boolean): void {
    if (!this.context || !this.oscillator || !this.gain) return;
    const now = this.context.currentTime; const pitch = 52 + Math.max(0, speed) * 5.9 + (nitro ? 45 : 0);
    this.oscillator.frequency.setTargetAtTime(pitch, now, 0.045); this.gain.gain.setTargetAtTime(Math.min(0.045, 0.003 + Math.max(0, speed) * 0.00075), now, 0.08);
  }
  dispose(): void { this.oscillator?.stop(); void this.context?.close(); }
}
