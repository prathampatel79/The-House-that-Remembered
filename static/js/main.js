/**
 * Main Game Director & Render Loop
 * Manages Three.js scene, opening first-person sequence, waking sequence,
 * pause menu, and exhibition conclusion.
 */
class GameDirector {
    constructor() {
        this.phase = 'title'; // 'title', 'opening_road', 'disorientation', 'waking_up', 'gameplay'
        this.clock = new THREE.Clock();

        this.initDOM();
        this.initThree();
    }

    initDOM() {
        this.titleScreen = document.getElementById('title-screen');
        this.disorientationOverlay = document.getElementById('disorientation-overlay');
        this.pauseMenu = document.getElementById('pause-menu');

        // Start button
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Resume button in pause menu
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }

        // Save button
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveGame();
            });
        }

        // Load button
        const loadBtn = document.getElementById('load-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                this.loadGame();
            });
        }

        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetGame();
            });
        }

        // Escape key pause handling & F11 fullscreen toggle
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.phase === 'gameplay' && !window.notebookUI.isOpen) {
                this.togglePause();
            } else if (e.code === 'F11') {
                e.preventDefault();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            }
        });
    }

    initThree() {
        const container = document.getElementById('canvas-container');

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x06080b);
        this.scene.fog = new THREE.FogExp2(0x06080b, 0.045);

        // Camera
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 1.7, 36);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // Player Controller
        this.playerController = new PlayerController(this.camera, this.scene, document.body);
        window.playerController = this.playerController;

        // House Architecture
        this.houseBuilder = new HouseBuilder(this.scene, this.playerController);
        window.gameHouse = this.houseBuilder;

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Start render loop
        this.animate();
    }

    showSubtitle(text) {
        let el = document.getElementById('cinematic-subtitle');
        if (!el) return;
        el.textContent = text;
        el.classList.add('visible');
    }

    hideSubtitle() {
        let el = document.getElementById('cinematic-subtitle');
        if (el) el.classList.remove('visible');
    }

    startGame() {
        if (window.soundEngine) {
            window.soundEngine.init();
            window.soundEngine.resume();
        }

        this.titleScreen.style.opacity = '0';
        setTimeout(() => {
            this.titleScreen.style.display = 'none';
        }, 800);

        this.phase = 'prologue';
        this.prologueSlammed = false;
        this.playerController.enabled = false;
        this.camera.position.set(0, 1.7, 40);
        this.camera.rotation.set(0, 0, 0);

        this.runPrologueSequence();
    }

    runPrologueSequence() {
        let startTime = performance.now();
        let lastFootstep = 0;

        const updatePrologue = () => {
            if (this.phase !== 'prologue') return;
            const elapsed = (performance.now() - startTime) / 1000;

            if (elapsed < 6.0) {
                // Phase 1: Walking along dusk road
                const t = elapsed / 6.0;
                this.camera.position.z = THREE.MathUtils.lerp(40, 24, t);
                this.camera.position.x = 0;
                this.camera.position.y = 1.7 + Math.sin(elapsed * 7) * 0.035;
                this.camera.rotation.set(0, 0, 0);

                if (elapsed - lastFootstep > 0.5) {
                    lastFootstep = elapsed;
                    if (window.soundEngine) window.soundEngine.playFootstep('gravel');
                }
                this.showSubtitle("Heading home along Blackwood Road as the evening settles...");
            } else if (elapsed < 10.0) {
                // Phase 2: Noticing the house & gate
                const t = (elapsed - 6.0) / 4.0;
                this.camera.position.z = THREE.MathUtils.lerp(24, 21, t * 0.5);
                this.camera.position.y = 1.7;
                this.camera.rotation.y = THREE.MathUtils.lerp(0, 0.25, Math.min(t * 1.5, 1));

                if (elapsed > 7.0 && elapsed < 7.2) {
                    if (window.soundEngine) window.soundEngine.playCreak(0.25);
                }
                this.showSubtitle("Wait... the old Sen house. The front gate is slightly unlatched.");
            } else if (elapsed < 15.0) {
                // Phase 3: Walking through gate to porch
                const t = (elapsed - 10.0) / 5.0;
                this.camera.position.z = THREE.MathUtils.lerp(21, 9.8, t);
                this.camera.position.x = THREE.MathUtils.lerp(0, 0, t);
                this.camera.position.y = 1.7 + Math.sin(elapsed * 6.5) * 0.035;
                this.camera.rotation.y = THREE.MathUtils.lerp(0.25, 0, t);

                if (elapsed - lastFootstep > 0.52) {
                    lastFootstep = elapsed;
                    if (window.soundEngine) window.soundEngine.playFootstep(elapsed < 12 ? 'gravel' : 'stone');
                }
                this.showSubtitle("Curiosity takes over... I should see if anyone is inside.");
            } else if (elapsed < 19.5) {
                // Phase 4: Stopping on porch, noticing carved symbol
                const t = (elapsed - 15.0) / 4.5;
                this.camera.position.set(0.2, 1.7, 9.5);
                this.camera.rotation.y = THREE.MathUtils.lerp(0, -0.35, Math.min(t * 2, 1));

                if (elapsed > 16.5 && elapsed < 16.7) {
                    if (window.soundEngine) window.soundEngine.playClueDiscovered();
                }
                this.showSubtitle("That carved marking beside the door... It matches my heirloom silver pendant!");
            } else if (elapsed < 23.0) {
                // Phase 5: Stepping into the entrance
                const t = (elapsed - 19.5) / 3.5;
                this.camera.position.z = THREE.MathUtils.lerp(9.5, 6.2, t);
                this.camera.position.x = 0;
                this.camera.position.y = 1.7 + Math.sin(elapsed * 7) * 0.03;
                this.camera.rotation.y = THREE.MathUtils.lerp(-0.35, 0, t);

                if (elapsed - lastFootstep > 0.5) {
                    lastFootstep = elapsed;
                    if (window.soundEngine) window.soundEngine.playFootstep('wood');
                }
                this.showSubtitle("Hello? Is anyone here?");
            } else if (elapsed < 26.5) {
                // Phase 6: Front door slams shut behind!
                if (!this.prologueSlammed) {
                    this.prologueSlammed = true;
                    if (window.soundEngine) {
                        window.soundEngine.playDoorSlam();
                        window.soundEngine.playHeartbeat();
                    }
                }
                const t = (elapsed - 23.0) / 3.5;
                this.camera.rotation.y = THREE.MathUtils.lerp(0, Math.PI, Math.min(t * 2, 1));
                this.showSubtitle("The door! It slammed shut from outside! Hey, let me out!");
            } else if (elapsed < 29.0) {
                // Phase 7: Disorientation and blackout
                const t = (elapsed - 26.5) / 2.5;
                this.camera.rotation.z = Math.sin(elapsed * 9) * 0.2;
                this.camera.position.y = THREE.MathUtils.lerp(1.7, 0.6, t);
                this.disorientationOverlay.style.opacity = String(Math.min(t * 1.4, 1));
                this.showSubtitle("My head... everything is turning dark...");
            } else {
                // Phase 8: Black screen, wake up in bedroom floor
                this.hideSubtitle();
                this.phase = 'waking_up';
                this.disorientationOverlay.style.opacity = '1';

                setTimeout(() => {
                    this.startWakingSequence();
                }, 1400);
                return;
            }

            requestAnimationFrame(updatePrologue);
        };

        requestAnimationFrame(updatePrologue);
    }

    startWakingSequence() {
        this.phase = 'waking_up';

        // Teleport camera to starting bedroom floor (clear of bed collision box at X: [-7.2, -4.8], Z: [-0.6, 2.6])
        this.playerController.controls.getObject().position.set(-3.6, 0.35, -0.5);
        this.camera.rotation.set(0, Math.PI / 2, 0);

        if (window.soundEngine) {
            window.soundEngine.playCreak(0.3);
        }

        this.showSubtitle("Ugh... my head... Where am I?");

        setTimeout(() => {
            // Fade out blackness
            this.disorientationOverlay.style.opacity = '0';

            // Camera smoothly rises from floor (y = 0.35) to eye height (y = 1.7)
            let riseProgress = 0;
            const riseInterval = setInterval(() => {
                riseProgress += 0.025;
                const targetY = THREE.MathUtils.lerp(0.35, 1.7, riseProgress);
                this.playerController.controls.getObject().position.y = targetY;

                if (riseProgress >= 1.0) {
                    clearInterval(riseInterval);
                    this.hideSubtitle();

                    // PLAYER CONTROL ENABLED ONLY NOW!
                    this.phase = 'gameplay';
                    this.playerController.enabled = true;
                    try {
                        this.playerController.controls.lock();
                    } catch (e) {}

                    // If pointer lock was blocked due to user gesture requirement, display click prompt
                    if (!this.playerController.controls.isLocked && this.playerController.clickPrompt) {
                        this.playerController.clickPrompt.classList.remove('hidden');
                    }

                    window.gameState.currentFloor = 'first_floor';
                    window.gameState.setObjective('Find a way out.', 'Waking Up');
                    window.gameState.showToast("Find a way out.");
                }
            }, 45);
        }, 1200);
    }

    togglePause() {
        const isPaused = this.pauseMenu.classList.contains('active');
        if (isPaused) {
            this.pauseMenu.classList.remove('active');
            this.playerController.controls.lock();
        } else {
            this.pauseMenu.classList.add('active');
            this.playerController.controls.unlock();
        }
    }

    saveGame() {
        const pos = this.playerController.controls.getObject().position;
        const rot = { yaw: this.camera.rotation.y, pitch: this.camera.rotation.x };

        fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slot_name: 'autosave',
                position: { x: pos.x, y: pos.y, z: pos.z },
                rotation: rot,
                current_floor: window.gameState.currentFloor,
                current_objective: window.gameState.objective,
                active_mystery: window.gameState.activeMystery
            })
        })
        .then(res => res.json())
        .then(data => {
            window.gameState.showToast('Progress saved locally to SQLite!');
            this.togglePause();
        })
        .catch(err => {
            console.error('Save error:', err);
            window.gameState.showToast('Save failed.');
        });
    }

    loadGame() {
        fetch('/api/load', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slot_name: 'autosave' })
        })
        .then(res => res.json())
        .then(data => {
            if (data.save) {
                const s = data.save;
                this.playerController.controls.getObject().position.set(s.player_x, s.player_y, s.player_z);
                window.gameState.currentFloor = s.current_floor;
                window.gameState.setObjective(s.current_objective);
                window.gameState.showToast('Game loaded successfully!');
                this.togglePause();
            } else {
                window.gameState.showToast('No save slot found.');
            }
        })
        .catch(err => {
            console.error('Load error:', err);
            window.gameState.showToast('Load failed.');
        });
    }

    resetGame() {
        if (!confirm('Reset game and restart investigation?')) return;
        fetch('/api/reset', { method: 'POST' })
        .then(() => {
            window.location.reload();
        });
    }

    // =============================================================
    // FINAL SECRET REVELATION & MORNING AWAKENING SEQUENCE
    // =============================================================

    startFinalSecretSequence() {
        if (this.phase === 'final_secret' || this.phase === 'morning_after') return;
        this.phase = 'final_secret';

        // 1. Disable player movement & unlock mouse pointer
        if (this.playerController) {
            this.playerController.enabled = false;
            try {
                this.playerController.controls.unlock();
            } catch (e) {}
        }

        // 2. Hide all normal HUD overlays
        const crosshair = document.getElementById('crosshair');
        const interactPrompt = document.getElementById('interact-prompt');
        const objectiveBox = document.getElementById('objective-box');
        const bottomHud = document.getElementById('bottom-hud');
        const clickPrompt = document.getElementById('click-to-control-prompt');

        if (crosshair) crosshair.style.display = 'none';
        if (interactPrompt) interactPrompt.style.display = 'none';
        if (objectiveBox) objectiveBox.style.display = 'none';
        if (bottomHud) bottomHud.style.display = 'none';
        if (clickPrompt) clickPrompt.style.display = 'none';
        if (window.notebookUI) window.notebookUI.close();

        // 3. Fade screen completely to pitch black
        this.disorientationOverlay.style.transition = 'opacity 1.5s ease-in-out';
        this.disorientationOverlay.style.opacity = '1';

        // 4. Begin sequential blank screen text revelation
        setTimeout(() => {
            this.displayFinalSecretCinematicText();
        }, 1600);
    }

    displayFinalSecretCinematicText() {
        const paragraphs = (window.STORY_CONFIG && window.STORY_CONFIG.finalSecretParagraphs) || [
            "The family never abandoned this house.",
            "They discovered the truth behind the pendant\nand knew that someone would eventually come looking.",
            "The pendant was passed down through Nisha's family.",
            "It eventually reached you.",
            "You were never a stranger to this house.",
            "You were the person they had been waiting for."
        ];

        let cinematicContainer = document.getElementById('final-secret-cinematic');
        if (!cinematicContainer) {
            cinematicContainer = document.createElement('div');
            cinematicContainer.id = 'final-secret-cinematic';
            cinematicContainer.className = 'final-secret-overlay';
            document.body.appendChild(cinematicContainer);
        }

        cinematicContainer.innerHTML = '';
        cinematicContainer.style.display = 'flex';
        cinematicContainer.style.opacity = '1';

        const textWrapper = document.createElement('div');
        textWrapper.className = 'final-secret-wrapper';
        cinematicContainer.appendChild(textWrapper);

        let pIndex = 0;
        const showNextParagraph = () => {
            if (pIndex < paragraphs.length) {
                const p = document.createElement('p');
                p.className = 'final-secret-para';
                p.innerHTML = paragraphs[pIndex].replace(/\n/g, '<br>');
                textWrapper.appendChild(p);

                // Gentle fade in
                setTimeout(() => {
                    p.classList.add('visible');
                    if (window.soundEngine) window.soundEngine.playPaper();
                }, 80);

                pIndex++;
                setTimeout(showNextParagraph, 2500);
            } else {
                // All text rendered -> show elegant Continue button
                setTimeout(() => {
                    const continueBtn = document.createElement('button');
                    continueBtn.id = 'final-secret-continue-btn';
                    continueBtn.className = 'final-secret-btn';
                    continueBtn.textContent = 'Continue';
                    continueBtn.addEventListener('click', () => {
                        this.startUnconsciousToMorningSequence();
                    });
                    textWrapper.appendChild(continueBtn);
                    setTimeout(() => continueBtn.classList.add('visible'), 120);
                }, 1200);
            }
        };

        showNextParagraph();
    }

    startUnconsciousToMorningSequence() {
        const cinematicContainer = document.getElementById('final-secret-cinematic');
        if (cinematicContainer) {
            cinematicContainer.style.transition = 'opacity 1.4s ease-out';
            cinematicContainer.style.opacity = '0';
            setTimeout(() => {
                cinematicContainer.style.display = 'none';
            }, 1400);
        }

        // Audio muffling and heartbeat fade
        if (window.soundEngine) {
            window.soundEngine.muffleAudio(3.0);
        }

        const transitionText = (window.STORY_CONFIG && window.STORY_CONFIG.unconsciousTransition) ||
            "A sudden wave of exhaustion washes over... The underground vault grows quiet... Everything is slipping away...";
        this.showSubtitle(transitionText);

        // First-person camera slight instability and blackout
        let sway = 0;
        const swayInterval = setInterval(() => {
            sway += 0.05;
            this.camera.rotation.z = Math.sin(sway * 6) * 0.12;
            if (sway >= 2.5) {
                clearInterval(swayInterval);
                this.camera.rotation.z = 0;
            }
        }, 50);

        setTimeout(() => {
            this.hideSubtitle();

            // Transform world lighting and environment into morning
            this.houseBuilder.transitionToMorningEnvironment();

            // Teleport camera outside the house on the lawn facing the house (Z = 8 is house front door)
            // Lying down outside at (0, 0.4, 20), looking towards north (-Z) at the closed house
            this.playerController.controls.getObject().position.set(0, 0.4, 20);
            this.camera.rotation.set(0, Math.PI, 0);

            // After moment in black, wake up into the dawn
            setTimeout(() => {
                this.startMorningAwakening();
            }, 1800);
        }, 3200);
    }

    startMorningAwakening() {
        this.phase = 'morning_after';

        // Play calm morning atmosphere (procedural morning wind and birdsong)
        if (window.soundEngine) {
            window.soundEngine.playMorningAtmosphere();
        }

        // Screen slowly fades from black into the bright morning
        this.disorientationOverlay.style.transition = 'opacity 3.2s ease-in-out';
        this.disorientationOverlay.style.opacity = '0';

        const lines = (window.STORY_CONFIG && window.STORY_CONFIG.morningSequence) || [
            "The cold morning breeze... The air smells of wet pine and dawn.",
            "The silver pendant rests cold against my chest. It was with me all along.",
            "Everything that happened inside this house... was real.",
            "What happened inside the house will never be forgotten."
        ];

        // First-person camera slowly rises from lying down (y = 0.4) to eye height (y = 1.7)
        let riseProgress = 0;
        const riseInterval = setInterval(() => {
            riseProgress += 0.015;
            const targetY = THREE.MathUtils.lerp(0.4, 1.7, riseProgress);
            this.playerController.controls.getObject().position.y = targetY;

            if (riseProgress >= 1.0) {
                clearInterval(riseInterval);
                this.playerController.controls.getObject().position.y = 1.7;

                // Restore player first-person controls outside
                this.playerController.enabled = true;
                try {
                    this.playerController.controls.lock();
                } catch (e) {}

                const crosshair = document.getElementById('crosshair');
                const interactPrompt = document.getElementById('interact-prompt');
                const objectiveBox = document.getElementById('objective-box');

                if (crosshair) crosshair.style.display = 'block';
                if (interactPrompt) interactPrompt.style.display = 'block';
                if (objectiveBox) {
                    objectiveBox.style.display = 'block';
                    const morningObj = (window.STORY_CONFIG && window.STORY_CONFIG.objectives && window.STORY_CONFIG.objectives.morningReflect) ?
                        window.STORY_CONFIG.objectives.morningReflect : { text: "Look upon the quiet house in the morning light.", title: "Dawn" };
                    window.gameState.setObjective(morningObj.text, morningObj.title);
                }

                this.showMorningResolutionBanner();
            }
        }, 50);

        // Sequential morning subtitle thoughts
        this.showSubtitle(lines[0]);
        setTimeout(() => {
            this.showSubtitle(lines[1]);
            window.gameState.showToast("Pendant Retained: Heirloom of Nisha Sen");
        }, 4200);
        setTimeout(() => {
            this.showSubtitle(lines[2]);
        }, 9000);
        setTimeout(() => {
            this.showSubtitle(lines[3]);
        }, 13500);
        setTimeout(() => {
            this.hideSubtitle();
        }, 18500);
    }

    showMorningResolutionBanner() {
        let banner = document.getElementById('morning-resolution-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'morning-resolution-banner';
            banner.className = 'morning-resolution-box';
            banner.innerHTML = `
                <div class="morning-title">THE HOUSE THAT REMEMBERED</div>
                <div class="morning-sub">Exhibition Demonstration Complete &bull; The Truth Has Been Uncovered</div>
                <button onclick="window.location.reload()" class="morning-restart-btn">Restart Exhibition</button>
            `;
            document.body.appendChild(banner);
        }
        setTimeout(() => {
            banner.classList.add('visible');
        }, 6000);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = Math.min(this.clock.getDelta(), 0.1);

        // Update player movement and interaction
        if (this.playerController) {
            this.playerController.update(delta);
        }


        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Global ending trigger for the college exhibition
window.triggerGameEnding = function() {
    if (window.notebookUI) window.notebookUI.close();
    if (window.gameDirector) {
        window.gameDirector.startFinalSecretSequence();
    }
};

window.addEventListener('DOMContentLoaded', () => {
    window.gameDirector = new GameDirector();
});
