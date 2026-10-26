// Ambient Soundscape Generator & Sloth Voice Narrator
// Pure Web Audio API procedural synthesis (zero mp3 assets needed) + Web Speech API narration

export class AmbientSoundscape {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.gainNode = null;
    this.noiseNode = null;
    this.oscillatorNode = null;
    this.speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isNarrating = false;
  }

  _initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleAmbient(forceState) {
    if (this.isPlaying || forceState === false) {
      this.stopAmbient();
      return false;
    } else {
      this.startAmbient();
      return true;
    }
  }

  startAmbient() {
    try {
      this._initContext();
      if (this.isPlaying) return;

      // Master Gain
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.08, this.audioCtx.currentTime + 3);
      this.gainNode.connect(this.audioCtx.destination);

      // Procedural Rain / Pink Noise Buffer
      const bufferSize = this.audioCtx.sampleRate * 2;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
        b6 = white * 0.115926;
      }

      this.noiseNode = this.audioCtx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      // Lowpass Filter for Warm Rain Tone
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);

      this.noiseNode.connect(filter);
      filter.connect(this.gainNode);
      this.noiseNode.start();

      // Soft Zen Drone (Harmonic 108Hz / 216Hz)
      this.oscillatorNode = this.audioCtx.createOscillator();
      this.oscillatorNode.type = 'sine';
      this.oscillatorNode.frequency.setValueAtTime(108, this.audioCtx.currentTime);

      const oscGain = this.audioCtx.createGain();
      oscGain.gain.setValueAtTime(0.015, this.audioCtx.currentTime);

      this.oscillatorNode.connect(oscGain);
      oscGain.connect(this.gainNode);
      this.oscillatorNode.start();

      this.isPlaying = true;
    } catch (e) {
      console.warn('AudioContext autoplay policy prevented ambient sound:', e);
    }
  }

  stopAmbient() {
    if (!this.isPlaying) return;
    try {
      if (this.gainNode && this.audioCtx) {
        this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.5);
        setTimeout(() => {
          this.noiseNode?.stop();
          this.oscillatorNode?.stop();
          this.isPlaying = false;
        }, 1500);
      }
    } catch (e) {
      this.isPlaying = false;
    }
  }

  /**
   * Narrates the 2-line sloth briefing using a soothing speech synthesizer
   */
  narrateText(text, onEnd) {
    if (!this.speechSynth) return;

    if (this.isNarrating) {
      this.speechSynth.cancel();
      this.isNarrating = false;
      onEnd?.();
      return;
    }

    this.speechSynth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.90; // Slow and steady sloth pacing
    utterance.pitch = 0.95;

    // Pick a gentle English voice if available
    const voices = this.speechSynth.getVoices();
    const calmVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (calmVoice) utterance.voice = calmVoice;

    this.isNarrating = true;

    utterance.onend = () => {
      this.isNarrating = false;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.isNarrating = false;
      onEnd?.();
    };

    this.speechSynth.speak(utterance);
  }

  stopNarrating() {
    if (this.speechSynth) {
      this.speechSynth.cancel();
      this.isNarrating = false;
    }
  }
}
