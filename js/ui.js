/**
 * ui.js - AGOYO Coffee Flight
 * UI manager: screen transitions, HUD updates, toasts, achievements.
 */
class UI {
  constructor() {
    // Screen elements
    this.$loading   = document.getElementById('loading-screen');
    this.$menu      = document.getElementById('menu-screen');
    this.$gameover  = document.getElementById('gameover-screen');
    this.$highscore = document.getElementById('highscore-screen');
    this.$howto     = document.getElementById('howto-screen');
    this.$hud       = document.getElementById('hud');
    this.$pause     = document.getElementById('pause-overlay');
    this.$countdown = document.getElementById('countdown-overlay');
    this.$cdNumber  = document.getElementById('countdown-number');
    this.$toast     = document.getElementById('achievement-toast');
    this.$achText   = document.getElementById('achievement-text');
    this.$newHS     = document.getElementById('new-highscore-banner');
    this.$hudScore  = document.getElementById('hud-score');
    this.$goScore   = document.getElementById('go-score');
    this.$goBest    = document.getElementById('go-best');
    this.$hsBest    = document.getElementById('hs-best');
    this.$hsGames   = document.getElementById('hs-games');
    this.$hsTotal   = document.getElementById('hs-total');
    this.$btnSound  = document.getElementById('btn-sound');
    this._toastTimer = null;
  }

  /* ── Screen Control ────────────────────────────────────── */

  _hideAll() {
    [this.$loading, this.$menu, this.$gameover, this.$highscore, this.$howto]
      .forEach(el => { if(el) el.classList.remove('active'); });
  }

  show(screenId) {
    this._hideAll();
    const el = document.getElementById(screenId + '-screen');
    if (el) setTimeout(() => el.classList.add('active'), 10);
  }

  showLoading() {
    this._hideAll();
    if (this.$loading) this.$loading.classList.add('active');
  }

  hideLoading() {
    if (this.$loading) this.$loading.classList.remove('active');
  }

  showMenu() { this.show('menu'); this.hideHUD(); }

  showGameOver(score, best, isNewBest) {
    this._hideAll();
    if (this.$goScore) this.$goScore.textContent = score;
    if (this.$goBest)  this.$goBest.textContent  = best;
    if (this.$newHS) {
      if (isNewBest) this.$newHS.classList.remove('hidden');
      else           this.$newHS.classList.add('hidden');
    }
    setTimeout(() => { if (this.$gameover) this.$gameover.classList.add('active'); }, 10);
    this.hideHUD();
  }

  showHighScore() {
    const d = Storage.load();
    if (this.$hsBest)  this.$hsBest.textContent  = d.highScore   || 0;
    if (this.$hsGames) this.$hsGames.textContent  = d.gamesPlayed || 0;
    if (this.$hsTotal) this.$hsTotal.textContent  = d.totalScore  || 0;
    this.show('highscore');
  }

  showHowTo()   { this.show('howto'); }

  /* ── HUD ──────────────────────────────────────────────── */

  showHUD() {
    if (this.$hud) this.$hud.classList.remove('hidden');
  }

  hideHUD() {
    if (this.$hud) this.$hud.classList.add('hidden');
  }

  updateScore(score) {
    if (this.$hudScore) this.$hudScore.textContent = score;
  }

  /* ── Pause ────────────────────────────────────────────── */

  showPause() {
    if (this.$pause) this.$pause.classList.remove('hidden');
  }

  hidePause() {
    if (this.$pause) this.$pause.classList.add('hidden');
  }

  /* ── Countdown ────────────────────────────────────────── */

  /** Run 3-2-1-GO countdown, then call onDone. */
  runCountdown(onDone) {
    let n = 3;
    this.$countdown.classList.remove('hidden');
    const tick = () => {
      this.$cdNumber.textContent = n > 0 ? n : 'GO!';
      this.$cdNumber.style.animation = 'none';
      void this.$cdNumber.offsetWidth;
      this.$cdNumber.style.animation = 'countPulse 1s ease-out forwards';
      if (n <= 0) {
        setTimeout(() => {
          this.$countdown.classList.add('hidden');
          onDone();
        }, 700);
        return;
      }
      n--;
      setTimeout(tick, 1000);
    };
    tick();
  }

  /* ── Loading Bar ─────────────────────────────────────── */

  setLoadingProgress(pct) {
    const bar = document.getElementById('loading-bar');
    if (bar) bar.style.width = pct + '%';
  }

  /* ── Sound Button ────────────────────────────────────── */

  updateSoundBtn(enabled) {
    if (this.$btnSound) this.$btnSound.textContent = enabled ? 'Sound ON' : 'Sound OFF';
  }

  /* ── Achievement Toast ───────────────────────────────── */

  showToast(message, duration = 2800) {
    if (!this.$toast) return;
    clearTimeout(this._toastTimer);
    this.$achText.textContent = message;
    this.$toast.classList.remove('hidden');
    requestAnimationFrame(() => this.$toast.classList.add('show'));
    this._toastTimer = setTimeout(() => {
      this.$toast.classList.remove('show');
      setTimeout(() => this.$toast.classList.add('hidden'), 400);
    }, duration);
  }

  /* ── Loading Bar Fake Progress ───────────────────────── */

  animateLoadingBar(onDone) {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 8;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        this.setLoadingProgress(100);
        setTimeout(onDone, 300);
        return;
      }
      this.setLoadingProgress(p);
    }, 90);
  }
  }
