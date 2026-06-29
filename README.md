# Coffee Flight - AGOYO

> A Flappy Bird-inspired browser game with AGOYO Coffee branding.
> Navigate your coffee bean through obstacles. Simple. Addictive. Delicious.

![AGOYO Coffee Flight](screenshots/preview.png)

## About

**Coffee Flight** is a browser-based HTML5 Canvas game inspired by Flappy Bird,
featuring the AGOYO coffee brand. Guide a flying coffee bean through an endless
stream of coffee-themed obstacles — cups, espresso machines, straws, and more.

- No install. No dependencies. Just open `index.html`.
- Works on Desktop, Tablet, Android, and iPhone.
- High scores saved in LocalStorage.

## Features

- Smooth 60 FPS gameplay with realistic physics
- Coffee-themed obstacles (cups, glasses, espresso machines, bean stacks, straws, leaves)
- Progressive difficulty — speed and gap change as score increases
- Score system with LocalStorage high score persistence
- Achievement system with toast notifications
- Particle effects on collision
- Parallax cloud background
- Screen shake on collision
- Countdown before start
- Pause/Resume (P key)
- Sound toggle
- Fully responsive (desktop / tablet / mobile)
- Audio support for SFX and background music

## Getting Started

1. Clone or download the repository:
   ```bash
   git clone https://github.com/prayogaadhi21/agoyogame.git
   cd agoyogame
   ```

2. Open `index.html` in your browser. No server required.

## Controls

| Action       | Input                       |
|:-------------|:---------------------------|
| Flap / Jump  | Click, Tap, or Space key   |
| Pause        | P key or pause button      |
| Resume       | P key or Resume button     |

## Project Structure

```
AGOYO-Flappy/
├── index.html              Main HTML
├── README.md
├── LICENSE
├── .gitignore
├── css/
│   └── style.css           All styles (coffee shop theme)
├── js/
│   ├── storage.js          LocalStorage manager
│   ├── audio.js            Audio manager (SFX + music)
│   ├── physics.js          Physics constants & helpers
│   ├── player.js           Coffee bean player class
│   ├── obstacle.js         Obstacle system & manager
│   ├── ui.js               UI/screen manager
│   ├── game.js             Core game engine & loop
│   └── main.js             Entry point & event wiring
├── assets/
│   ├── logo/
│   │   └── agoyo-logo.png  Place your AGOYO logo here
│   ├── audio/
│   │   ├── jump.wav
│   │   ├── point.wav
│   │   ├── hit.wav
│   │   ├── gameover.wav
│   │   └── background.mp3
│   ├── fonts/
│   └── icons/
└── screenshots/
```

## How to Replace the Logo

1. Export your AGOYO logo as `agoyo-logo.png` (transparent background recommended).
2. Place it at `assets/logo/agoyo-logo.png`.
3. Refresh the browser — the logo appears on all screens automatically.

## How to Replace Audio

Place audio files in `assets/audio/` with these exact filenames:

| File               | Usage                        |
|:-------------------|:-----------------------------|
| `jump.wav`         | Player flap sound            |
| `point.wav`        | Score point sound            |
| `hit.wav`          | Collision / hit sound        |
| `gameover.wav`     | Game over sting              |
| `background.mp3`   | Looping background music     |

All audio files are optional — missing files are handled gracefully.

## Deploy to GitHub Pages

1. Go to your repository on GitHub.
2. Click **Settings** → **Pages**.
3. Under **Source**, select `main` branch and `/ (root)`.
4. Click **Save**.
5. Your game is live at: `https://prayogaadhi21.github.io/agoyogame/`

## Color Palette

| Name       | Hex       | Usage                    |
|:-----------|:----------|:-------------------------|
| Dark Brown | `#1A0E06` | Background               |
| Coffee     | `#3B2415` | Surface / cards          |
| Caramel    | `#C8873A` | Primary / accent         |
| Sienna     | `#A0522D` | Secondary                |
| Cream      | `#E8C99A` | Text accent              |
| Beige      | `#F5ECD7` | Light text               |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Made with love and coffee by AGOYO. Stop. Sip. Smile.
