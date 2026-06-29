/**
 * player.js - AGOYO Coffee Flight
 * The AGOYO coffee bean player character.
 * Handles drawing, physics, collision hitbox, particles.
 */
class Player {
  constructor(canvasW, canvasH) {
    this.resize(canvasW, canvasH);
    this._trail = [];
    this.dead   = false;
  }

  resize(canvasW, canvasH) {
    this.canvasW   = canvasW;
    this.canvasH   = canvasH;
    this.radius    = Math.max(18, canvasW * 0.028);
    this.x         = canvasW * 0.22;
    this.y         = canvasH * 0.45;
    this.vy        = 0;
    this.rotation  = 0;
    this.shakeTime = 0;
  }

  reset(canvasW, canvasH) {
    this.resize(canvasW, canvasH);
    this._trail = [];
    this.dead   = false;
  }

  flap() {
    this.vy = Physics.flap();
  }

  triggerShake(duration = 0.45) {
    this.shakeTime = duration;
  }

  update(dt) {
    // Gravity
    this.vy = Physics.applyGravity(this.vy, dt);
    this.y += this.vy * dt;

    // Tilt based on velocity
    const targetRot = Physics.clamp(this.vy * 0.0022, -0.5, 1.25);
    this.rotation   = Physics.lerp(this.rotation, targetRot, 14 * dt);

    // Trail
    this._trail.push({ x: this.x, y: this.y, alpha: 0.35, r: this.radius * 0.45 });
    if (this._trail.length > 8) this._trail.shift();
    for (const t of this._trail) { t.alpha -= dt * 1.5; t.r *= 0.96; }

    // Shake
    if (this.shakeTime > 0) this.shakeTime -= dt;

    // Return true if dead (out of bounds)
    return this.y - this.radius > this.canvasH || this.y + this.radius < -30;
  }

  draw(ctx) {
    const { x, y, radius, rotation } = this;

    // Trail
    for (const t of this._trail) {
      if (t.alpha <= 0) continue;
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.beginPath();
      ctx.ellipse(t.x, t.y, t.r, t.r * 1.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#7A3B10';
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Shadow
    ctx.shadowColor   = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur    = 12;
    ctx.shadowOffsetY = 5;

    // Bean gradient
    const bw = radius * 1.05;
    const bh = radius * 1.38;
    const g  = ctx.createRadialGradient(-bw*0.2, -bh*0.3, bw*0.1, 0, 0, bw*1.1);
    g.addColorStop(0,   '#D4904A');
    g.addColorStop(0.4, '#8B4513');
    g.addColorStop(1,   '#4A2008');
    ctx.beginPath();
    ctx.ellipse(0, 0, bw, bh, 0, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // Crease line
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.moveTo(0, -bh * 0.76);
    ctx.bezierCurveTo(bw*0.42, -bh*0.22, bw*0.42, bh*0.22, 0, bh*0.76);
    ctx.strokeStyle = 'rgba(25,8,0,0.55)';
    ctx.lineWidth   = radius * 0.12;
    ctx.lineCap     = 'round';
    ctx.stroke();

    // Highlight
    ctx.beginPath();
    ctx.ellipse(-bw*0.25, -bh*0.32, bw*0.22, bh*0.14, -0.4, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,220,170,0.22)';
    ctx.fill();

    ctx.restore();
  }

  /** Axis-aligned bounding box for collision */
  get hitbox() {
    const r = this.radius * 0.72;
    return { x: this.x - r, y: this.y - r, w: r*2, h: r*2 };
  }

  /** Canvas shake offset */
  get shakeOffset() {
    if (this.shakeTime <= 0) return { x: 0, y: 0 };
    const mag = this.shakeTime * 22;
    return {
      x: (Math.random() - 0.5) * mag,
      y: (Math.random() - 0.5) * mag,
    };
  }
}
