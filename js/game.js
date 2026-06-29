/**
 * game.js - AGOYO Coffee Flight
 * Core game engine: canvas rendering, game loop, background, particles.
 */

const STATE = { IDLE: 'idle', PLAYING: 'playing', PAUSED: 'paused', DEAD: 'dead' };

class Game {
  constructor() {
    this.canvas  = document.getElementById('game-canvas');
    this.ctx     = this.canvas.getContext('2d');
    this.state   = STATE.IDLE;
    this.score   = 0;
    this._lastTS = 0;
    this._raf    = null;

    // Background layers for parallax
    this._bgLayers = [];
    this._particles = [];
    this._clouds    = [];

    // Modules
    this.player    = null;
    this.obstacles = new ObstacleManager();
    this.ui        = null; // set by main.js

    this._initCanvas();
    this._buildBgLayers();
    this._spawnClouds(5);

    window.addEventListener('resize', () => this._initCanvas());
  }

  /* ── Canvas Setup ──────────────────────────────────────── */

  _initCanvas() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.player) this.player.resize(this.canvas.width, this.canvas.height);
  }

  get W() { return this.canvas.width; }
  get H() { return this.canvas.height; }

  /* ── Background Layers ─────────────────────────────────── */

  _buildBgLayers() {
    this._bgLayers = [
      { color: '#1A0E06', speed: 0 },
      { color: '#221208', speed: 0.3 },
    ];
  }

  _spawnClouds(n) {
    this._clouds = [];
    for (let i = 0; i < n; i++) {
      this._clouds.push(this._newCloud(Math.random() * this.W || 400));
    }
  }

  _newCloud(startX) {
    const H = this.H || window.innerHeight;
    return {
      x:     startX,
      y:     H * 0.05 + Math.random() * H * 0.45,
      r:     30 + Math.random() * 50,
      alpha: 0.04 + Math.random() * 0.06,
      speed: 18 + Math.random() * 22,
    };
  }

  /* ── Particle System ───────────────────────────────────── */

  _spawnParticles(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 160;
      this._particles.push({
        x, y,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed - 80,
        r:     2 + Math.random() * 5,
        alpha: 1,
        color: ['#C8873A','#8B4513','#E8C99A','#F5ECD7'][Math.floor(Math.random()*4)],
        life:  0.6 + Math.random() * 0.4,
        maxLife: 0,
      });
      this._particles[this._particles.length-1].maxLife =
        this._particles[this._particles.length-1].life;
    }
  }

  _updateParticles(dt) {
    for (const p of this._particles) {
      p.x    += p.vx * dt;
      p.y    += p.vy * dt;
      p.vy   += 500 * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
    this._particles = this._particles.filter(p => p.life > 0);
  }

  _drawParticles() {
    for (const p of this._particles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle   = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  /* ── Background Drawing ────────────────────────────────── */

  _drawBackground() {
    const ctx = this.ctx;
    const W = this.W, H = this.H;

    // Deep gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,    '#0F0800');
    bg.addColorStop(0.4,  '#1A0E06');
    bg.addColorStop(0.75, '#2C1A0E');
    bg.addColorStop(1,    '#1A0E06');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Ground
    const groundH = Math.max(40, H * 0.06);
    const gGrad = ctx.createLinearGradient(0, H - groundH, 0, H);
    gGrad.addColorStop(0, '#3B2415');
    gGrad.addColorStop(1, '#1A0E06');
    ctx.fillStyle = gGrad;
    ctx.fillRect(0, H - groundH, W, groundH);

    // Ground highlight line
    ctx.fillStyle = 'rgba(200,135,58,0.15)';
    ctx.fillRect(0, H - groundH, W, 2);

    // Steam / mist particles (decorative)
    for (let i = 0; i < 3; i++) {
      const cx = (W * 0.15) + i * (W * 0.35);
      const cy = H - groundH - 10;
      const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy - 20, 60);
      gr.addColorStop(0,   'rgba(200,135,58,0.04)');
      gr.addColorStop(1,   'transparent');
      ctx.fillStyle = gr;
      ctx.fillRect(cx - 60, cy - 80, 120, 80);
    }
  }

  _drawClouds(dt) {
    const ctx = this.ctx;
    const speed = this.state === STATE.PLAYING ? Physics.getObstacleSpeed(this.score) * 0.12 : 20;
    for (const c of this._clouds) {
      c.x -= speed * dt;
      if (c.x + c.r * 2 < 0) {
        c.x = this.W + c.r;
        c.y = this.H * 0.05 + Math.random() * this.H * 0.45;
      }
      ctx.save();
      ctx.globalAlpha = c.alpha;
      ctx.fillStyle   = '#E8C99A';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
      ctx.arc(c.x + c.r*0.7, c.y - c.r*0.35, c.r*0.65, 0, Math.PI*2);
      ctx.arc(c.x + c.r*1.3, c.y, c.r*0.5, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ── Ground collision ──────────────────────────────────── */

  _isOnGround() {
    if (!this.player) return false;
    return this.player.y + this.player.radius >= this.H - Math.max(40, this.H*0.06);
  }

  /* ── Game Loop ─────────────────────────────────────────── */

  _loop(ts) {
    const dt = Math.min((ts - this._lastTS) / 1000, 0.05);
    this._lastTS = ts;
    this._update(dt);
    this._render(dt);
    if (this.state !== STATE.DEAD && this.state !== STATE.IDLE) {
      this._raf = requestAnimationFrame(ts => this._loop(ts));
    }
  }

  _update(dt) {
    if (this.state !== STATE.PLAYING) return;

    // Update player
    const oob = this.player.update(dt);

    // Ground / ceiling
    if (this._isOnGround() || oob) {
      this._die();
      return;
    }

    // Update obstacles
    this.obstacles.update(dt, this.score, this.W, this.H);

    // Score
    const passed = this.obstacles.countPassed(this.player.x);
    if (passed > 0) {
      this.score += passed;
      this.ui?.updateScore(this.score);
      Audio$.play('point');
      this._checkAchievements();
    }

    // Collision
    if (this.obstacles.checkCollision(this.player.hitbox)) {
      this._die();
    }
  }

  _render(dt) {
    const ctx  = this.ctx;
    const W = this.W, H = this.H;

    // Shake offset
    const shake = this.player?.shakeOffset ?? { x:0, y:0 };
    ctx.save();
    ctx.translate(shake.x, shake.y);

    this._drawBackground();
    this._drawClouds(dt);

    if (this.state === STATE.PLAYING || this.state === STATE.PAUSED || this.state === STATE.DEAD) {
      this.obstacles.draw(ctx);
      this.player?.draw(ctx);
      this._updateParticles(dt);
      this._drawParticles();
    } else {
      // Idle: draw player in floating animation
      if (this.player) {
        this.player.y = H * 0.45 + Math.sin(Date.now() * 0.002) * 12;
        this.player.draw(ctx);
      }
    }

    ctx.restore();
  }

  /* ── Death ─────────────────────────────────────────────── */

  _die() {
    if (this.state === STATE.DEAD) return;
    this.state = STATE.DEAD;
    Audio$.play('hit');
    this.player.triggerShake();
    this._spawnParticles(this.player.x, this.player.y, 18);
    cancelAnimationFrame(this._raf);
    this._raf = null;

    setTimeout(() => {
      Audio$.play('gameover');
    }, 300);

    // Render animasi shake selama 800ms, lalu tampilkan game over
    const startTime = performance.now();
    const animateDeath = (now) => {
      const elapsed = now - startTime;
      this._render(0.016);
      if (elapsed < 800) {
        requestAnimationFrame(animateDeath);
      } else {
        // Hentikan rendering canvas, tampilkan game over
        this.canvas.style.pointerEvents = 'none';
        const isNew = Storage.updateHighScore(this.score);
        const best = Storage.get('highScore');
        this.ui?.showGameOver(this.score, best, isNew);
        if (isNew) this.ui?.showToast('New High Score! ' + this.score);
      }
    };
    requestAnimationFrame(animateDeath);
  }
  _checkAchievements() {
    const milestones = [
      { score: 1,   id: 'first_point',   msg: 'First Point!' },
      { score: 5,   id: 'five_points',   msg: '5 Points - Getting Warm!' },
      { score: 10,  id: 'ten_points',    msg: '10 Points - Coffee Expert!' },
      { score: 25,  id: 'twentyfive',    msg: '25 Points - Barista Mode!' },
      { score: 50,  id: 'fifty',         msg: '50 Points - Coffee Master!' },
      { score: 100, id: 'hundred',       msg: '100 Points - LEGENDARY!' },
    ];
    for (const m of milestones) {
      if (this.score === m.score) {
        if (Storage.unlockAchievement(m.id)) {
          this.ui?.showToast('Achievement: ' + m.msg);
        }
      }
    }
  }

  /* ── Public API ─────────────────────────────────────────── */

  startGame() {
    this.canvas.style.pointerEvents = '';
    this.score = 0;
    this.state = STATE.PLAYING;
    this._particles = [];
    this.player = new Player(this.W, this.H);
    this.player.flap();
    this.obstacles.reset();
    this.ui?.updateScore(0);
    this.ui?.showHUD();
    this._lastTS = performance.now();
    this._raf = requestAnimationFrame(ts => this._loop(ts));
    Audio$.startMusic();
  }

  pause() {
    if (this.state !== STATE.PLAYING) return;
    this.state = STATE.PAUSED;
    cancelAnimationFrame(this._raf);
    this.ui?.showPause();
  }

  resume() {
    if (this.state !== STATE.PAUSED) return;
    this.state = STATE.PLAYING;
    this.ui?.hidePause();
    this._lastTS = performance.now();
    this._raf = requestAnimationFrame(ts => this._loop(ts));
  }

  toMenu() {
    this.state = STATE.IDLE;
    cancelAnimationFrame(this._raf);
    this.obstacles.reset();
    this._particles = [];
    Audio$.stopMusic();
    this.player = new Player(this.W, this.H);
    // Start idle animation
    this._lastTS = performance.now();
    const idleLoop = (ts) => {
      if (this.state !== STATE.IDLE) return;
      const dt = Math.min((ts - this._lastTS) / 1000, 0.05);
      this._lastTS = ts;
      this._render(dt);
      requestAnimationFrame(idleLoop);
    };
    requestAnimationFrame(idleLoop);
  }

  flap() {
    if (this.state === STATE.PLAYING) {
      this.player?.flap();
      Audio$.play('jump');
    }
  }
      }
