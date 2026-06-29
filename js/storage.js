/**
 * storage.js - AGOYO Coffee Flight
 * Handles all localStorage operations with safe JSON serialization.
 */
const Storage = (() => {
  const KEY = 'agoyo_coffee_flight';
  const defaults = {
    highScore: 0,
    gamesPlayed: 0,
    totalScore: 0,
    soundOn: true,
    achievements: [],
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...defaults };
      return { ...defaults, ...JSON.parse(raw) };
    } catch { return { ...defaults }; }
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { console.warn('[Storage] Could not save:', e); }
  }

  function get(key) { return load()[key] ?? defaults[key]; }

  function set(key, value) {
    const data = load();
    data[key] = value;
    save(data);
  }

  function updateHighScore(score) {
    const data = load();
    let isNew = false;
    if (score > data.highScore) { data.highScore = score; isNew = true; }
    data.gamesPlayed = (data.gamesPlayed || 0) + 1;
    data.totalScore  = (data.totalScore  || 0) + score;
    save(data);
    return isNew;
  }

  function unlockAchievement(id) {
    const data = load();
    if (!data.achievements.includes(id)) {
      data.achievements.push(id);
      save(data);
      return true;
    }
    return false;
  }

  function reset() { save({ ...defaults }); }

  return { load, save, get, set, updateHighScore, unlockAchievement, reset };
})();
