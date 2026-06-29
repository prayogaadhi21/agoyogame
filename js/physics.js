/**
 * physics.js - AGOYO Coffee Flight
 * Physics constants and utility functions.
 */
const Physics = (() => {
  const BASE_GRAVITY      = 1800;
  const FLAP_VELOCITY     = -520;
  const MAX_FALL_VELOCITY = 900;
  const MAX_RISE_VELOCITY = -600;
  const BASE_SPEED        = 180;
  const SPEED_INCREMENT   = 12;
  const MAX_SPEED         = 450;
  const BASE_GAP          = 165;
  const MIN_GAP           = 100;

  function getObstacleSpeed(score) {
    const level = Math.floor(score / 5);
    return Math.min(BASE_SPEED + level * SPEED_INCREMENT, MAX_SPEED);
  }

  function getGapSize(score) {
    const reduction = Math.floor(score / 8) * 8;
    return Math.max(BASE_GAP - reduction, MIN_GAP);
  }

  function applyGravity(vy, dt, g = BASE_GRAVITY) {
    return Math.min(vy + g * dt, MAX_FALL_VELOCITY);
  }

  function flap() {
    return FLAP_VELOCITY;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function easeOut(t) { return 1 - (1 - t) * (1 - t); }

  function randBetween(min, max) { return min + Math.random() * (max - min); }

  return {
    BASE_GRAVITY, FLAP_VELOCITY, MAX_FALL_VELOCITY,
    BASE_SPEED, MAX_SPEED, BASE_GAP, MIN_GAP,
    getObstacleSpeed, getGapSize,
    applyGravity, flap,
    lerp, clamp, easeOut, randBetween,
  };
})();
