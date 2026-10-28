# The House That Remembered
## Offline First-Person 3D Mystery Thriller

A complete, story-driven, fully offline 3D mystery exploration game designed for college exhibition demonstrations (20–30 minutes of engaging gameplay), optimized for an 8 GB RAM PC.

---

## 🌟 Key Features

- **100% Offline**: All assets, libraries (Three.js r128, Tailwind CSS), procedural sound engine, textures, and SQLite database are stored locally. Zero internet connection required.
- **Strictly First-Person**: From the dusk road opening to the subterranean vault finale, you never leave first-person perspective.
- **Deep Atmospheric Horror & Mystery**: Dark visual theme with realistic localized tungsten point lights, shadows, dust motes, and creaking floorboards.
- **Three Elaborate House Floors**:
  - **First Floor**: Starting Bedroom, Hallway with Grandfather Clock, Study, Living Room with Fireplace, Reading Library, Bathroom, Staircases.
  - **Second Floor**: Master Bedroom, Children's Bedrooms, Archive Corridor, The Sealed Room (Hydraulic Tumbler), and the Hidden Surveillance Chamber.
  - **Ground Floor**: Subterranean Stone Cellar Vault containing the family archive and the confidential dossier on the player.
- **6 Interconnected Mysteries & Detective Notebook**:
  1. *The Missing Family*: Deducing the true reason behind the sudden abandonment.
  2. *The Broken Timeline*: Reconstructing the final hour (10:15 PM &rarr; 10:45 PM &rarr; 11:15 PM &rarr; 11:42 PM).
  3. *The Sealed Room*: Deciphering the 4-symbol lock (`3-7-2-9`).
  4. *The Last Night*: Correlating surveillance evidence, threat notes, and tactical maps.
  5. *The Pendant & Lineage*: Uncovering that you are the grandchild of Nisha Sen, claiming the Antique Brass Cellar Key.
  6. *The Final Revelation*: Solving the master deduction board and facing the unanswered question.
- **Lightweight & High Performance**: Runs smoothly at 60 FPS on integrated graphics and 8 GB RAM.

---

## 🎮 Player Controls

| Key | Action |
|---|---|
| **W, A, S, D** | Move Forward / Left / Backward / Right |
| **Mouse** | First-Person Camera Look |
| **E** | Examine Clues & Interact with Objects |
| **N** or **Tab** | Open / Close Detective Notebook |
| **Shift** | Sprint |
| **Space** | Jump |
| **F11** | Toggle Fullscreen |
| **Esc** | Pause Game / Save & Load |

---

## 🚀 How to Launch 

### Method 1: Standalone Desktop Game (Recommended)
Download `TheHouseThatRemembered.exe` directly from this repository, place it on your Desktop, and double-click to play immediately:
- **No browser opens** — runs as a dedicated native desktop application window.
- **100% Offline** — runs completely locally without internet.
- No Python or dependencies required to run the `.exe`.
- Close the window anytime to exit.
- Press **F11** for fullscreen.

### Method 2: Batch Launcher
Double-click `run_game.bat`.

### Method 3: Python
Open PowerShell in this directory and run:
```powershell
python app.py
```

---

## 🛠️ Technology Stack

- **Client 3D Engine**: Three.js (r128 offline bundle), PointerLockControls.
- **Audio**: Web Audio API Procedural Synthesizer (footsteps, creaks, tape player, bulb hum, wind).
- **Textures**: Procedural HTML5 2D Canvas texture generator (wood, wallpaper, stone, framed portraits, newspapers, receipts, maps).
- **Backend**: Python 3 + Flask (Local server).
- **Storage**: SQLite 3 (`game_data.db`).
