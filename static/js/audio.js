/**
 * Web Audio API Procedural Sound Engine
 * Fully offline, zero external audio files required.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.masterVolume = 0.8;
        this.ambientGain = null;
        this.humGain = null;
        this.tapePlaying = false;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        // Master gain
        this.masterGainNode = this.ctx.createGain();
        this.masterGainNode.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        this.masterGainNode.connect(this.ctx.destination);

        // Start ambient background wind/drone
        this.startAmbientDrone();
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    startAmbientDrone() {
        if (!this.ctx) return;

        // Low frequency wind rumble
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, this.ctx.currentTime);
        filter.Q.setValueAtTime(3, this.ctx.currentTime);

        // Subtle LFO for wind gusting
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(60, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(this.ambientGain);
        this.ambientGain.connect(this.masterGainNode);
        whiteNoise.start();

        // Low electrical tungsten hum
        const humOsc = this.ctx.createOscillator();
        humOsc.type = 'sawtooth';
        humOsc.frequency.setValueAtTime(60, this.ctx.currentTime);

        const humFilter = this.ctx.createBiquadFilter();
        humFilter.type = 'lowpass';
        humFilter.frequency.setValueAtTime(120, this.ctx.currentTime);

        this.humGain = this.ctx.createGain();
        this.humGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

        humOsc.connect(humFilter);
        humFilter.connect(this.humGain);
        this.humGain.connect(this.masterGainNode);
        humOsc.start();
    }

    playFootstep(surface = 'wood') {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        const noise = this.ctx.createBufferSource();
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        if (surface === 'wood') {
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(260 + Math.random() * 40, now);
            filter.Q.setValueAtTime(4, now);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

            // Tiny creak harmonic
            if (Math.random() < 0.3) {
                this.playCreak(0.08);
            }
        } else if (surface === 'gravel') {
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(800 + Math.random() * 200, now);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        } else { // stone
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(180, now);
            filter.Q.setValueAtTime(2, now);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        }

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGainNode);
        noise.start(now);
    }

    playCreak(volume = 0.2) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';

        const startFreq = 180 + Math.random() * 120;
        const endFreq = startFreq + (Math.random() - 0.5) * 80;

        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.linearRampToValueAtTime(endFreq, now + 0.25);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.masterGainNode);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    playDoorOpen() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        // Creak glide
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';

        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.5);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.9);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGainNode);
        osc.start(now);
        osc.stop(now + 1.0);
    }

    playDoorSlam() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Heavy impact thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.4);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGainNode);
        osc.start(now);
        osc.stop(now + 0.5);

        // Latch click
        this.playLatchClick();
    }

    playLatchClick() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.masterGainNode);
        osc.start(now);
        osc.stop(now + 0.05);
    }

    playPaper() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / bufferSize);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2200, now);
        filter.Q.setValueAtTime(1.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGainNode);
        noise.start(now);
    }

    playClockTick() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(950, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        osc.connect(gain);
        gain.connect(this.masterGainNode);
        osc.start(now);
        osc.stop(now + 0.03);
    }

    playClueDiscovered() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        // Two-tone bell harmonic
        const freqs = [587.33, 880.0]; // D5, A5
        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0.25, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.2);

            osc.connect(gain);
            gain.connect(this.masterGainNode);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 1.3);
        });
    }

    playDeductionSolved() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        // Mystery solved chord (D minor - F - A - D)
        const notes = [293.66, 349.23, 440.0, 587.33];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);

            gain.gain.setValueAtTime(0.2, now + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 2.0);

            osc.connect(gain);
            gain.connect(this.masterGainNode);
            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 2.1);
        });
    }

    playHeartbeat() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        // Lub-dub
        [0, 0.16].forEach((delay) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(65, now + delay);
            osc.frequency.exponentialRampToValueAtTime(35, now + delay + 0.15);

            gain.gain.setValueAtTime(0.5, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

            osc.connect(gain);
            gain.connect(this.masterGainNode);
            osc.start(now + delay);
            osc.stop(now + delay + 0.2);
        });
    }

    playTapeRecording(onEnd) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Cassette mechanical click
        this.playLatchClick();

        // Motor hum and tape hiss
        const bufferSize = this.ctx.sampleRate * 4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.08;
        }
        const hiss = this.ctx.createBufferSource();
        hiss.buffer = buffer;

        const hissFilter = this.ctx.createBiquadFilter();
        hissFilter.type = 'bandpass';
        hissFilter.frequency.setValueAtTime(3000, now);

        const hissGain = this.ctx.createGain();
        hissGain.gain.setValueAtTime(0.15, now);
        hissGain.gain.setValueAtTime(0.15, now + 3.8);
        hissGain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);

        hiss.connect(hissFilter);
        hissFilter.connect(hissGain);
        hissGain.connect(this.masterGainNode);
        hiss.start(now);

        // Vocal frequency formants synthesis simulating Arjun's whispered warning
        const freqs = [180, 220, 195, 160, 210, 175, 150];
        freqs.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sawtooth';
            const t = now + 0.4 + i * 0.45;
            osc.frequency.setValueAtTime(f, t);

            const formFilter = this.ctx.createBiquadFilter();
            formFilter.type = 'bandpass';
            formFilter.frequency.setValueAtTime(800 + (i % 3) * 300, t);
            formFilter.Q.setValueAtTime(5, t);

            g.gain.setValueAtTime(0.12, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

            osc.connect(formFilter);
            formFilter.connect(g);
            g.connect(this.masterGainNode);
            osc.start(t);
            osc.stop(t + 0.45);
        });

        setTimeout(() => {
            this.playLatchClick();
            if (onEnd) onEnd();
        }, 4200);
    }

    muffleAudio(duration = 2.5) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        if (this.ambientGain) {
            this.ambientGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        }
        if (this.humGain) {
            this.humGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        }

        // Low muffled heartbeat pulse
        for (let i = 0; i < 3; i++) {
            const beatTime = now + i * 0.9;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(55, beatTime);
            osc.frequency.exponentialRampToValueAtTime(35, beatTime + 0.3);
            g.gain.setValueAtTime(0.25 / (i + 1), beatTime);
            g.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.35);
            osc.connect(g);
            g.connect(this.masterGainNode);
            osc.start(beatTime);
            osc.stop(beatTime + 0.4);
        }
    }

    playMorningAtmosphere() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Soft, bright morning breeze
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, now);
        filter.Q.setValueAtTime(1.5, now);

        const morningGain = this.ctx.createGain();
        morningGain.gain.setValueAtTime(0.001, now);
        morningGain.gain.exponentialRampToValueAtTime(0.08, now + 2.0);

        whiteNoise.connect(filter);
        filter.connect(morningGain);
        morningGain.connect(this.masterGainNode);
        whiteNoise.start();

        // Procedural gentle morning bird chirps at calm intervals
        const scheduleBirdChirp = () => {
            if (!this.ctx) return;
            const t = this.ctx.currentTime + 0.5 + Math.random() * 2.5;
            const chirpOsc = this.ctx.createOscillator();
            const chirpGain = this.ctx.createGain();
            chirpOsc.type = 'sine';
            const baseFreq = 2200 + Math.random() * 600;
            chirpOsc.frequency.setValueAtTime(baseFreq, t);
            chirpOsc.frequency.exponentialRampToValueAtTime(baseFreq + 800, t + 0.08);
            chirpOsc.frequency.exponentialRampToValueAtTime(baseFreq + 200, t + 0.16);

            chirpGain.gain.setValueAtTime(0.035, t);
            chirpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

            chirpOsc.connect(chirpGain);
            chirpGain.connect(this.masterGainNode);
            chirpOsc.start(t);
            chirpOsc.stop(t + 0.2);

            setTimeout(scheduleBirdChirp, 3500 + Math.random() * 4000);
        };
        scheduleBirdChirp();
    }
}

window.soundEngine = new SoundEngine();
