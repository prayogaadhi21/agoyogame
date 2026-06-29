/**
 * obstacle.js - AGOYO Coffee Flight
 * Obstacle system: coffee cups, espresso machines, bean stacks, etc.
 * Each obstacle is a top-bottom pair with a gap for the player.
 */

const OBSTACLE_TYPES = ['cup', 'glass', 'espresso', 'beans', 'straw', 'leaf'];

class Obstacle {
  /**
   * @param {number} x          - Starting x position
   * @param {number} gapY       - Center Y of the gap
   * @param {number} gapSize    - Height of the gap in px
   * @param {number} canvasH    - Canvas height
   * @param {number} speed      - Horizontal speed px/s
   */
  constructor(x, gapY, gapSize, canvasH, speed) {
    this.x        = x;
    this.gapY     = gapY;
    this.gapSize  = gapSize;
    this.canvasH  = canvasH;
    this.speed    = speed;
    this.width    = Math.max(52, canvasH * 0.075);
    this.passed   = false;
    this.type     = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    this._colors  = this._pickColors();
  }

  _pickColors() {
    const palettes = {
      cup:      { body: '#D4A96A', rim: '#8B5E3C', liquid: '#4A2008' },
      glass:    { body: '#A8C8D8', rim: '#6B9AB8', liquid: '#2C1A0E' },
      espresso: { body: '#5C3D1E', rim: '#C8873A', liquid: '#1A0E06' },
      beans:    { body: '#8B4513', rim: '#C8873A', liquid: '#4A2008' },
      straw:    { body: '#E8C99A', rim: '#A0522D', liquid: '#3B2415' },
      leaf:     { body: '#4A7C3F', rim: '#2D5A27', liquid: '#1A3A15' },
    };
    return palettes[this.type] || palettes.cup;
  }

  update(dt) {
    this.x -= this.speed * dt;
  }

  /** @returns {boolean} true if off-screen (left) */
  isOffScreen() { return this.x + this.width < 0; }

  /** Draw top and bottom obstacles */
  draw(ctx) {
    const topH    = this.gapY - this.gapSize / 2;
    const botY    = this.gapY + this.gapSize / 2;
    const botH    = this.canvasH - botY;
    const x       = this.x;
    const w       = this.width;
    const c       = this._colors;

    // ── Top obstacle ───────────────────────────────────────
    this._drawPillar(ctx, x, 0, w, topH, c, true);
    // ── Bottom obstacle ─────────────────────────────────────
    this._drawPillar(ctx, x, botY, w, botH, c, false);
  }

  _drawPillar(ctx, x, y, w, h, colors, isTop) {
    if (h <= 0) return;

    // Main body gradient
    const grad = ctx.createLinearGradient(x, 0, x + w, 0);
    grad.addColorStop(0,   this._darken(colors.body, 0.7));
    grad.addColorStop(0.3, colors.body);
    grad.addColorStop(0.7, colors.body);
    grad.addColorStop(1,   this._darken(colors.body, 0.75));

    ctx.save();
    ctx.shadowColor   = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur    = 8;
    ctx.shadowOffsetX = 3;

    // Body
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = grad;
    ctx.fill();

    // Edge cap at opening (facing the gap)
    const capH = Math.max(12, w * 0.22);
    const capY = isTop ? y + h - capH : y;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.rect(x - 4, capY, w + 8, capH);
    ctx.fillStyle = colors.rim;
    ctx.fill();

    // Decorative icon in center of pillar
    ctx.shadowColor = 'transparent';
    const iconX  = x + w / 2;
    const iconY  = isTop ? y + h / 2 : y + h / 2;
    if (h > 40) this._drawIcon(ctx, iconX, iconY, w * 0.45, this.type, isTop);

    ctx.restore();
  }

  _drawIcon(ctx, cx, cy, size, type, isTop) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle   = 'rgba(255,240,210,0.9)';
    ctx.font        = `bold ${Math.round(size)}px serif`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    const icons = { cup:'☕', glass:'🧋', espresso:'☕', beans:'🫘', straw:'🥤', leaf:'🍃' };
    ctx.fillText(icons[type] || '☕', cx, cy);
    ctx.restore();
  }

  _darken(hex, factor) {
    const n = parseInt(hex.replace('#',''), 16);
    const r = Math.floor(((n>>16)&255) * factor);
    const g = Math.floor(((n>>8) &255) * factor);
    const b = Math.floor(((n)    &255) * factor);
    return `rgb(${r},${g},${b})`;
  }

  /** Hitboxes for collision detection */
  get topHitbox()    { return { x: this.x, y: 0, w: this.width, h: this.gapY - this.gapSize/2 }; }
  get bottomHitbox() { return { x: this.x, y: this.gapY + this.gapSize/2, w: this.width, h: this.canvasH }; }
}

/** Manages the pool of obstacles */
class ObstacleManager {
  constructor() {
    this._obstacles = [];
    this._spawnTimer = 0;
  }

  reset() {
    this._obstacles = [];
    this._spawnTimer = 0;
  }

  /** @returns {Obstacle[]} */
  get list() { return this._obstacles; }

  update(dt, score, canvasW, canvasH) {
    const speed   = Physics.getObstacleSpeed(score);
    const gapSize = Physics.getGapSize(score);

    // Dynamic spawn interval based on speed
    const spawnInterval = Math.max(1.4, 2.8 - score * 0.04);

    this._spawnTimer += dt;
    if (this._spawnTimer >= spawnInterval || this._obstacles.length === 0) {
      this._spawnTimer = 0;
      const margin = canvasH * 0.18;
      const gapY   = Physics.randBetween(margin + gapSize/2, canvasH - margin - gapSize/2);
      this._obstacles.push(new Obstacle(canvasW + 10, gapY, gapSize, canvasH, speed));
    }

    // Update all obstacles
    for (const obs of this._obstacles) obs.update(dt);

    // Remove off-screen
    this._obstacles = this._obstacles.filter(o => !o.isOffScreen());
  }

  draw(ctx) {
    for (const obs of this._obstacles) obs.draw(ctx);
  }

  /**
   * Check collision with player hitbox.
   * @param {{ x,y,w,h }} hitbox
   * @returns {boolean}
   */
  checkCollision(hitbox) {
    for (const obs of this._obstacles) {
      if (this._rectsOverlap(hitbox, obs.topHitbox))    return true;
      if (this._rectsOverlap(hitbox, obs.bottomHitbox)) return true;
    }
    return false;
  }

  /**
   * Count how many obstacles the player has passed.
   * @param {number} playerX
   * @returns {number} newly passed count
   */
  countPassed(playerX) {
    let count = 0;
    for (const obs of this._obstacles) {
      if (!obs.passed && obs.x + obs.width < playerX) {
        obs.passed = true;
        count++;
      }
    }
    return count;
  }

  _rectsOverlap(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  }
}
