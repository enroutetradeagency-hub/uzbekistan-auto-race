export class AudioEngine {
  private context: AudioContext | null = null;
  private engine: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private tireSource: AudioBufferSourceNode | null = null;
  private tireFilter: BiquadFilterNode | null = null;
  private tireGain: GainNode | null = null;
  private brakeGain: GainNode | null = null;

  unlock(): void {
    if (this.context) { void this.context.resume(); return; }
    const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    this.context = new AudioContextConstructor();
    this.engine = this.context.createOscillator(); this.engine.type = "sawtooth"; this.engine.frequency.value = 54;
    this.engineGain = this.context.createGain(); this.engineGain.gain.value = .0001; this.engine.connect(this.engineGain); this.engineGain.connect(this.context.destination); this.engine.start();
    const noiseBuffer = this.context.createBuffer(1, this.context.sampleRate * 2, this.context.sampleRate); const samples = noiseBuffer.getChannelData(0); for (let index = 0; index < samples.length; index += 1) samples[index] = Math.random() * 2 - 1;
    this.tireSource = this.context.createBufferSource(); this.tireSource.buffer = noiseBuffer; this.tireSource.loop = true; this.tireFilter = this.context.createBiquadFilter(); this.tireFilter.type = "bandpass"; this.tireFilter.frequency.value = 820; this.tireGain = this.context.createGain(); this.tireGain.gain.value = .0001; this.brakeGain = this.context.createGain(); this.brakeGain.gain.value = .0001;
    this.tireSource.connect(this.tireFilter); this.tireFilter.connect(this.tireGain); this.tireFilter.connect(this.brakeGain); this.tireGain.connect(this.context.destination); this.brakeGain.connect(this.context.destination); this.tireSource.start();
  }

  update(speed: number, nitro: boolean, braking = false, drifting = false, offRoad = false): void {
    if (!this.context || !this.engine || !this.engineGain || !this.tireGain || !this.brakeGain || !this.tireFilter) return;
    const now = this.context.currentTime; const velocity = Math.max(0, speed); const pitch = 52 + velocity * 5.9 + (nitro ? 45 : 0);
    this.engine.frequency.setTargetAtTime(pitch, now, .045); this.engineGain.gain.setTargetAtTime(Math.min(.052, .003 + velocity * .00082), now, .08);
    this.tireFilter.frequency.setTargetAtTime(offRoad ? 330 : drifting ? 1220 : 720 + velocity * 8, now, .07); this.tireGain.gain.setTargetAtTime(Math.min(.026, velocity * .00026 + (offRoad ? .014 : 0)), now, .08); this.brakeGain.gain.setTargetAtTime(braking && velocity > 16 ? .018 + (drifting ? .018 : 0) : .0001, now, .04);
  }

  collision(): void {
    if (!this.context) return;
    const tone = this.context.createOscillator(); const gain = this.context.createGain(); tone.type = "square"; tone.frequency.setValueAtTime(115, this.context.currentTime); tone.frequency.exponentialRampToValueAtTime(52, this.context.currentTime + .11); gain.gain.setValueAtTime(.035, this.context.currentTime); gain.gain.exponentialRampToValueAtTime(.0001, this.context.currentTime + .12); tone.connect(gain); gain.connect(this.context.destination); tone.start(); tone.stop(this.context.currentTime + .13);
  }

  dispose(): void { this.engine?.stop(); this.tireSource?.stop(); void this.context?.close(); }
}
