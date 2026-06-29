/**
 * audio.js - AGOYO Coffee Flight
 * Audio manager. All files are optional — missing files are handled gracefully.
 * Place files in assets/audio/:
 *   jump.wav, point.wav, hit.wav, gameover.wav, background.mp3
 */
class AudioManager {
  constructor() {
    this._sounds  = {};
    this._music   = null;
    this._enabled = Storage.get('soundOn') !== false;
    this._musicVol = 0.3;
    this._sfxVol   = 0.65;
    this._define('jump',     'assets/audio/jump.wav');
    this._define('point',    'assets/audio/point.wav');
    this._define('hit',      'assets/audio/hit.wav');
    this._define('gameover', 'assets/audio/gameover.wav');
    this._defineMusic('assets/audio/background.mp3');
  }

  _define(id, src) { this._sounds[id] = src; }

  _defineMusic(src) {
    const el = new Audio();
    el.src    = src;
    el.loop   = true;
    el.volume = this._musicVol;
    el.preload = 'none';
    this._music = el;
  }

  play(id) {
    if (!this._enabled) return;
    const src = this._sounds[id];
    if (!src) return;
    try {
      const audio = new Audio(src);
      audio.volume = this._sfxVol;
      audio.play().catch(() => {});
    } catch {}
  }

  startMusic() {
    if (!this._enabled || !this._music) return;
    this._music.play().catch(() => {});
  }

  stopMusic() {
    if (!this._music) return;
    this._music.pause();
    this._music.currentTime = 0;
  }

  toggle() {
    this._enabled = !this._enabled;
    Storage.set('soundOn', this._enabled);
    if (this._enabled) { this.startMusic(); }
    else { this.stopMusic(); }
    return this._enabled;
  }

  get enabled() { return this._enabled; }
}

const Audio$ = new AudioManager();
