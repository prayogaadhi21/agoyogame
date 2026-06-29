/**
 * main.js - AGOYO Coffee Flight
 * Entry point: bootstraps the game, wires up all UI events and input handlers.
 */

(function() {
  'use strict';

  /* ── Init ───────────────────────────────────────────────── */

  const game = new Game();
  const ui   = new UI();
  game.ui    = ui;

  /* ── Loading Sequence ───────────────────────────────────── */

  window.addEventListener('load', () => {
    ui.showLoading();
    ui.animateLoadingBar(() => {
      ui.hideLoading();
      ui.showMenu();
      game.toMenu();
      ui.updateSoundBtn(Audio$.enabled);
    });
  });

  /* ── Menu Buttons ───────────────────────────────────────── */

  document.getElementById('btn-play').addEventListener('click', () => {
    ui._hideAll();
    ui.runCountdown(() => { game.startGame(); });
    Audio$.startMusic();
  });

  document.getElementById('btn-highscore').addEventListener('click', () => {
    ui.showHighScore();
  });

  document.getElementById('btn-howto').addEventListener('click', () => {
    ui.showHowTo();
  });

  document.getElementById('btn-sound').addEventListener('click', () => {
    const on = Audio$.toggle();
    ui.updateSoundBtn(on);
  });

  /* ── High Score / How To Back ───────────────────────────── */

  document.getElementById('btn-hs-back').addEventListener('click', () => {
    ui.showMenu();
  });

  document.getElementById('btn-howto-back').addEventListener('click', () => {
    ui.showMenu();
  });

  /* ── Game Over Buttons ──────────────────────────────────── */

  document.getElementById('btn-play-again').addEventListener('click', () => {
    ui._hideAll();
    ui.runCountdown(() => { game.startGame(); });
  });

  document.getElementById('btn-menu-go').addEventListener('click', () => {
    game.toMenu();
    ui.showMenu();
  });

  /* ── Pause Buttons ──────────────────────────────────────── */

  document.getElementById('btn-pause').addEventListener('click', () => {
    game.pause();
  });

  document.getElementById('btn-resume').addEventListener('click', () => {
    game.resume();
  });

  document.getElementById('btn-menu-pause').addEventListener('click', () => {
    game.toMenu();
    ui.hidePause();
    ui.showMenu();
  });

  /* ── Input Handlers ─────────────────────────────────────── */

  // Mouse / touch click on canvas → flap
  document.getElementById('game-canvas').addEventListener('click', (e) => {
    e.preventDefault();
    game.flap();
  });

  // Touch on canvas → flap
  document.getElementById('game-canvas').addEventListener('touchstart', (e) => {
    e.preventDefault();
    game.flap();
  }, { passive: false });

  // Keyboard
  window.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'Space':
      case 'ArrowUp':
        e.preventDefault();
        game.flap();
        break;
      case 'KeyP':
        if (game.state === 'playing') game.pause();
        else if (game.state === 'paused') game.resume();
        break;
      case 'Escape':
        if (game.state === 'paused') game.resume();
        break;
    }
  });

  /* ── Prevent context menu on canvas ─────────────────────── */

  document.getElementById('game-canvas').addEventListener('contextmenu', e => e.preventDefault());

})();
