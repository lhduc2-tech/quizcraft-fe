import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioCtx: AudioContext | null = null;
  readonly soundEnabled = signal<boolean>(true);

  constructor() {
    const saved = localStorage.getItem('qc_craft_sound');
    if (saved !== null) {
      this.soundEnabled.set(saved !== 'false');
    }
  }

  toggleSound(): boolean {
    const nextVal = !this.soundEnabled();
    this.soundEnabled.set(nextVal);
    localStorage.setItem('qc_craft_sound', String(nextVal));
    return nextVal;
  }

  play(soundType: 'type' | 'correct' | 'wrong' | 'complete' | 'click' | 'paper'): void {
    if (!this.soundEnabled()) return;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (soundType === 'type' || soundType === 'click') {
        // Warm typewriter / pencil tap
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (soundType === 'paper') {
        // Paper rustle sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (soundType === 'correct') {
        // Marimba positive chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (soundType === 'wrong') {
        // Soft wooden dull knock
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (soundType === 'complete') {
        // Cheerful harp flourish
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, i) => {
          if (!this.audioCtx) return;
          const noteOsc = this.audioCtx.createOscillator();
          const noteGain = this.audioCtx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(this.audioCtx.destination);
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(freq, now + i * 0.08);
          noteGain.gain.setValueAtTime(0.1, now + i * 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
          noteOsc.start(now + i * 0.08);
          noteOsc.stop(now + i * 0.08 + 0.3);
        });
      }
    } catch (err) {
      console.debug('Audio play error:', err);
    }
  }
}
