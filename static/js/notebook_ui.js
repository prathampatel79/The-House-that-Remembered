/**
 * Detective Notebook & Investigation UI
 * Progressive, spoiler-free investigation tool featuring:
 * 1. Field Journal (Chronological personal detective notes)
 * 2. Evidence Pinboard (Interactive corkboard with red yarn evidence connections)
 * 3. Deductions & Hypotheses (Unlocked organically when evidence is connected)
 */
class NotebookUI {
    constructor() {
        this.modal = document.getElementById('notebook-modal');
        this.isOpen = false;
        this.currentTab = 'journal';
        this.selectedPins = [];

        this.initDOM();
        this.setupKeybindings();
    }

    initDOM() {
        // Tab buttons
        const container = document.getElementById('notebook-tabs-container');
        if (container) {
            container.addEventListener('click', (e) => {
                const btn = e.target.closest('.nb-tab-btn');
                if (btn && btn.dataset.tab) {
                    this.switchTab(btn.dataset.tab);
                }
            });
        }

        // Close button
        const closeBtn = document.getElementById('nb-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Open button from HUD
        const hudNbBtn = document.getElementById('hud-notebook-btn');
        if (hudNbBtn) {
            hudNbBtn.addEventListener('click', () => this.toggle());
        }
    }

    setupKeybindings() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyN' || e.code === 'Tab') {
                e.preventDefault();
                this.toggle();
            } else if (e.code === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.modal.classList.add('active');

        if (window.soundEngine) {
            window.soundEngine.resume();
            window.soundEngine.playPaper();
        }

        if (window.playerController && window.playerController.controls) {
            window.playerController.controls.unlock();
        }

        this.renderCurrentTab();
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.modal.classList.remove('active');

        if (window.soundEngine) window.soundEngine.playPaper();

        if (window.playerController && window.playerController.controls && window.gameDirector.phase === 'gameplay') {
            window.playerController.controls.lock();
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.nb-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        if (window.soundEngine) window.soundEngine.playPaper();
        this.renderCurrentTab();
    }

    renderCurrentTab() {
        const container = document.getElementById('nb-tab-content');
        if (!container) return;

        switch (this.currentTab) {
            case 'journal':
                this.renderJournal(container);
                break;
            case 'pinboard':
                this.renderPinboard(container);
                break;
            case 'deductions':
                this.renderDeductions(container);
                break;
        }
    }

    /* -----------------------------------------------------------------
     * TAB 1: FIELD JOURNAL (Organic, spoiler-free detective log)
     * ----------------------------------------------------------------- */
    renderJournal(container) {
        const entries = window.gameState.journalEntries;

        let html = `
            <div class="p-6 h-full overflow-y-auto max-w-3xl mx-auto w-full">
                <div class="border-b border-gray-800 pb-3 mb-6">
                    <span class="text-xs text-yellow-500 uppercase tracking-widest font-bold">Personal Observations</span>
                    <h2 class="text-2xl font-serif text-white mt-1">Field Journal</h2>
                    <p class="text-xs text-gray-400 mt-1">Entries recorded in real time as you explore the estate.</p>
                </div>
        `;

        if (entries.length === 0) {
            html += `
                <div class="p-8 text-center text-gray-500 font-serif bg-gray-900 bg-opacity-40 rounded border border-gray-800">
                    <p class="text-base text-gray-300 italic mb-2">"I woke up trapped inside this dark, deserted estate."</p>
                    <p class="text-xs text-gray-500">The front entrance is locked shut. Walk through the rooms and press [E] to examine documents, photographs, and strange markings.</p>
                </div>
            `;
        } else {
            html += `<div class="space-y-4">`;
            entries.forEach((e, idx) => {
                html += `
                    <div class="p-4 bg-gray-900 border-l-4 border-yellow-600 rounded bg-opacity-60 shadow">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-serif text-sm font-semibold text-yellow-400">${e.title}</span>
                            <span class="text-xs font-mono text-gray-500">${e.time || 'Entry #' + (idx + 1)}</span>
                        </div>
                        <p class="text-sm text-gray-300 font-serif leading-relaxed italic">"${e.text}"</p>
                    </div>
                `;
            });
            html += `</div>`;
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    /* -----------------------------------------------------------------
     * TAB 2: EVIDENCE BOARD (Interactive pinboard with red yarn links)
     * ----------------------------------------------------------------- */
    renderPinboard(container) {
        const discovered = Array.from(window.gameState.discoveredClues);

        if (discovered.length === 0) {
            container.innerHTML = `
                <div class="p-12 text-center text-gray-500 font-serif w-full flex flex-col items-center justify-center">
                    <p class="text-xl mb-2 text-gray-300">Evidence Board Empty</p>
                    <p class="text-sm italic text-gray-500 max-w-md">No physical evidence discovered yet. Inspect photographs, letters, clocks, and notes to pin them here.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="pinboard-container">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="text-xs uppercase tracking-widest text-yellow-500 font-bold">Evidence Pinboard</h3>
                        <p class="text-xs text-gray-400">Select any two related pieces of evidence to form a connection.</p>
                    </div>
                    <div id="connection-action-bar">
                        ${this.selectedPins.length === 2 ? `
                            <button id="btn-connect-evidence" class="px-5 py-2 bg-red-800 hover:bg-red-700 text-white font-bold font-serif text-xs rounded shadow uppercase tracking-wider flex items-center gap-2">
                                <span>🔗</span>
                                <span>Formulate Connection</span>
                            </button>
                        ` : `
                            <span class="text-xs text-gray-500 font-mono italic">Select 2 items to connect</span>
                        `}
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
        `;

        discovered.forEach(id => {
            const clue = window.gameState.clueDatabase[id];
            if (!clue) return;
            const isSelected = this.selectedPins.includes(id);

            html += `
                <div class="pin-card ${isSelected ? 'selected' : ''}" data-clue-id="${id}">
                    <div class="push-pin"></div>
                    <div class="text-xs uppercase font-mono tracking-widest text-gray-400 mb-1">Evidence Item</div>
                    <h4 class="font-serif text-sm font-bold text-yellow-300 mb-2">${clue.title}</h4>
                    <p class="text-xs text-gray-300 line-clamp-3 italic mb-3">"${clue.desc}"</p>
                    <div class="flex justify-between items-center text-xs border-t border-gray-800 pt-2">
                        <button class="btn-inspect-pin text-yellow-500 hover:text-white" data-clue-id="${id}">Inspect Detailed &rarr;</button>
                        <span class="text-gray-500 font-mono text-xs">${isSelected ? '✓ Selected' : 'Click to select'}</span>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML = html;

        // Add event listeners for pin selection
        container.querySelectorAll('.pin-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-inspect-pin')) return; // ignore inspect click
                const id = card.dataset.clueId;
                this.togglePinSelection(id);
            });
        });

        // Add event listener for inspect detail button
        container.querySelectorAll('.btn-inspect-pin').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.clueId;
                window.gameState.openInspection(id);
            });
        });

        // Add event listener for connect button
        const connectBtn = document.getElementById('btn-connect-evidence');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                if (this.selectedPins.length === 2) {
                    const res = window.gameState.tryConnectEvidence(this.selectedPins[0], this.selectedPins[1]);
                    if (res.success) {
                        this.selectedPins = [];
                        this.renderPinboard(container);
                    } else {
                        alert(res.message);
                    }
                }
            });
        }
    }

    togglePinSelection(clueId) {
        const idx = this.selectedPins.indexOf(clueId);
        if (idx >= 0) {
            this.selectedPins.splice(idx, 1);
        } else {
            if (this.selectedPins.length >= 2) {
                this.selectedPins.shift(); // keep at most 2
            }
            this.selectedPins.push(clueId);
        }
        if (window.soundEngine) window.soundEngine.playPaper();
        const container = document.getElementById('nb-tab-content');
        if (container) this.renderPinboard(container);
    }

    /* -----------------------------------------------------------------
     * TAB 3: DEDUCTIONS & HYPOTHESES (Only unlocked via connections)
     * ----------------------------------------------------------------- */
    renderDeductions(container) {
        const unlocked = window.gameState.getUnlockedDeductionsList();

        if (unlocked.length === 0) {
            container.innerHTML = `
                <div class="p-12 text-center text-gray-500 font-serif w-full">
                    <p class="text-xl mb-2 text-gray-300">No Active Hypotheses</p>
                    <p class="text-xs italic text-gray-500">Go to the Evidence Board and connect related clues with red string to deduce hypotheses.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="p-6 h-full overflow-y-auto max-w-3xl mx-auto w-full space-y-8">
                <div class="border-b border-gray-800 pb-3">
                    <span class="text-xs text-yellow-500 uppercase tracking-widest font-bold">Logical Deductions</span>
                    <h2 class="text-2xl font-serif text-white mt-1">Formulated Hypotheses</h2>
                    <p class="text-xs text-gray-400 mt-1">Test your theories based on the correlated evidence.</p>
                </div>
        `;

        // Hyp 1: The Missing Family
        if (unlocked.includes(1)) {
            const isSolved = window.gameState.solvedDeductions.has(1);
            html += `
                <div class="bg-gray-900 border border-gray-800 rounded p-5 shadow">
                    <span class="text-xs text-yellow-500 font-mono uppercase tracking-wider">Hypothesis A</span>
                    <h3 class="text-lg font-serif text-white font-bold mb-2">The Circumstances of the Disappearance</h3>
                    ${isSolved ? `
                        <div class="p-3 bg-green-950 border border-green-700 rounded text-green-200 text-xs">
                            ✓ CONFIRMED: The Sen family did not voluntarily relocate. They fled under imminent threat, leaving packed luggage and food behind.
                        </div>
                    ` : `
                        <p class="text-xs text-gray-300 mb-3">Comparing the family photograph, Meera's anxious diary notes, and the packed suitcase abandoned in the study: What happened to this family?</p>
                        <div class="space-y-2 mb-4">
                            <label class="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                                <input type="radio" name="m1_deduction" value="voluntary_move"> The family moved away peacefully for employment.
                            </label>
                            <label class="flex items-center gap-2 text-xs text-yellow-300 font-bold cursor-pointer">
                                <input type="radio" name="m1_deduction" value="sudden_flight_under_threat"> The family fled abruptly in terror under imminent threat.
                            </label>
                        </div>
                        <button id="btn-submit-m1" class="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold font-serif text-xs rounded">Test Hypothesis</button>
                    `}
                </div>
            `;
        }

        // Hyp 2: Timeline Reconstruction
        if (unlocked.includes(2)) {
            const isSolved = window.gameState.solvedDeductions.has(2);
            html += `
                <div class="bg-gray-900 border border-gray-800 rounded p-5 shadow">
                    <span class="text-xs text-yellow-500 font-mono uppercase tracking-wider">Hypothesis B</span>
                    <h3 class="text-lg font-serif text-white font-bold mb-2">Chronology of the Final Night</h3>
                    ${isSolved ? `
                        <div class="p-3 bg-green-950 border border-green-700 rounded text-green-200 text-xs">
                            ✓ CONFIRMED: 10:15 PM (Receipt) &rarr; 10:45 PM (Diary) &rarr; 11:15 PM (Tape Whisper) &rarr; 11:42 PM (Clock Shattered). A 5th person arrived at 11:15 PM! Passage to Second Floor is accessible.
                        </div>
                    ` : `
                        <p class="text-xs text-gray-300 mb-3">Order the events of October 23, 2011 from earliest to latest based on timestamps:</p>
                        <div class="grid grid-cols-4 gap-2 mb-4 text-xs">
                            <div>
                                <label class="block text-gray-400 text-xxs mb-1">1. 10:15 PM</label>
                                <select id="tl-pos-1" class="bg-black border border-gray-700 text-white p-1 rounded w-full">
                                    <option value="receipt" selected>Store Receipt (10:15 PM)</option>
                                    <option value="diary">Diary Entry (10:45 PM)</option>
                                    <option value="audio">Tape Recording (11:15 PM)</option>
                                    <option value="clock">Clock Shattered (11:42 PM)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-gray-400 text-xxs mb-1">2. 10:45 PM</label>
                                <select id="tl-pos-2" class="bg-black border border-gray-700 text-white p-1 rounded w-full">
                                    <option value="receipt">Store Receipt (10:15 PM)</option>
                                    <option value="diary" selected>Diary Entry (10:45 PM)</option>
                                    <option value="audio">Tape Recording (11:15 PM)</option>
                                    <option value="clock">Clock Shattered (11:42 PM)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-gray-400 text-xxs mb-1">3. 11:15 PM</label>
                                <select id="tl-pos-3" class="bg-black border border-gray-700 text-white p-1 rounded w-full">
                                    <option value="receipt">Store Receipt (10:15 PM)</option>
                                    <option value="diary">Diary Entry (10:45 PM)</option>
                                    <option value="audio" selected>Tape Recording (11:15 PM)</option>
                                    <option value="clock">Clock Shattered (11:42 PM)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-gray-400 text-xxs mb-1">4. 11:42 PM</label>
                                <select id="tl-pos-4" class="bg-black border border-gray-700 text-white p-1 rounded w-full">
                                    <option value="receipt">Store Receipt (10:15 PM)</option>
                                    <option value="diary">Diary Entry (10:45 PM)</option>
                                    <option value="audio">Tape Recording (11:15 PM)</option>
                                    <option value="clock" selected>Clock Shattered (11:42 PM)</option>
                                </select>
                            </div>
                        </div>
                        <button id="btn-submit-m2" class="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold font-serif text-xs rounded">Reconstruct Sequence</button>
                    `}
                </div>
            `;
        }

        // Hyp 3: Sealed Room Hydraulic Keypad
        if (unlocked.includes(3)) {
            const isSolved = window.gameState.solvedDeductions.has(3);
            html += `
                <div class="bg-gray-900 border border-gray-800 rounded p-5 shadow">
                    <span class="text-xs text-yellow-500 font-mono uppercase tracking-wider">Hypothesis C</span>
                    <h3 class="text-lg font-serif text-white font-bold mb-2">Hydraulic Chamber Keypad Code</h3>
                    ${isSolved ? `
                        <div class="p-3 bg-green-950 border border-green-700 rounded text-green-200 text-xs">
                            ✓ CONFIRMED: 3-7-2-9 disengaged the hydraulic steel lock! The hidden chamber is open.
                        </div>
                    ` : `
                        <p class="text-xs text-gray-300 mb-3">Translate the 4 painting emblems (Sun &rarr; Eye &rarr; Key &rarr; Hourglass) using the cipher note:</p>
                        <div class="flex gap-2 mb-4">
                            <input type="text" id="m3-code-input" maxlength="4" placeholder="Code" class="w-32 bg-black border border-yellow-600 text-yellow-300 text-center font-mono text-xl p-2 rounded">
                            <button id="btn-submit-m3" class="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold font-serif text-xs rounded">Disengage Lock</button>
                        </div>
                    `}
                </div>
            `;
        }

        // Hyp 4: Surveillance Threat Matrix
        if (unlocked.includes(4)) {
            const isSolved = window.gameState.solvedDeductions.has(4);
            html += `
                <div class="bg-gray-900 border border-gray-800 rounded p-5 shadow">
                    <span class="text-xs text-yellow-500 font-mono uppercase tracking-wider">Hypothesis D</span>
                    <h3 class="text-lg font-serif text-white font-bold mb-2">Threat Correlation Matrix</h3>
                    ${isSolved ? `
                        <div class="p-3 bg-green-950 border border-green-700 rounded text-green-200 text-xs">
                            ✓ CONFIRMED: A syndicate watcher monitored the estate gate to steal the ancestral archive and heirlooms.
                        </div>
                    ` : `
                        <div class="grid grid-cols-3 gap-2 mb-4 text-xs">
                            <select id="m4-person" class="bg-black border border-gray-700 text-white p-1 rounded">
                                <option value="watcher">Syndicate Watcher</option>
                                <option value="postman">Town Postman</option>
                            </select>
                            <select id="m4-location" class="bg-black border border-gray-700 text-white p-1 rounded">
                                <option value="gate">Property Gate</option>
                                <option value="roof">Roof</option>
                            </select>
                            <select id="m4-event" class="bg-black border border-gray-700 text-white p-1 rounded">
                                <option value="surveillance">Covert Surveillance</option>
                                <option value="burglary">Burglary</option>
                            </select>
                        </div>
                        <button id="btn-submit-m4" class="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold font-serif text-xs rounded">Submit Matrix</button>
                    `}
                </div>
            `;
        }

        // Hyp 5: Family Lineage & Talisman
        if (unlocked.includes(5)) {
            const isSolved = window.gameState.solvedDeductions.has(5);
            html += `
                <div class="bg-gray-900 border border-gray-800 rounded p-5 shadow">
                    <span class="text-xs text-yellow-500 font-mono uppercase tracking-wider">Hypothesis E</span>
                    <h3 class="text-lg font-serif text-white font-bold mb-2">The Talisman & Your Ancestry</h3>
                    ${isSolved ? `
                        <div class="p-3 bg-green-950 border border-green-700 rounded text-green-200 text-xs">
                            ✓ CONFIRMED: You are the grandchild of Nisha Sen! The Antique Brass Cellar Key has been added to your inventory.
                        </div>
                    ` : `
                        <p class="text-xs text-gray-300 mb-3">Young Nisha\'s portrait shows her wearing the exact silver pendant handed down to you. What is your true connection?</p>
                        <div class="space-y-2 mb-4 text-xs">
                            <label class="flex items-center gap-2 text-yellow-300 font-bold cursor-pointer">
                                <input type="radio" name="m5_conn" value="nisha_heir" checked> You are Nisha Sen\'s direct grandchild, the rightful inheritor.
                            </label>
                        </div>
                        <button id="btn-submit-m5" class="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold font-serif text-xs rounded">Claim Heritage & Key</button>
                    `}
                </div>
            `;
        }

        // Hyp 6: Final Truth
        if (unlocked.includes(6)) {
            const isSolved = window.gameState.solvedDeductions.has(6);
            html += `
                <div class="bg-gray-900 border border-yellow-700 rounded p-5 shadow-2xl">
                    <span class="text-xs text-yellow-500 font-mono uppercase tracking-wider">Final Revelation</span>
                    <h3 class="text-lg font-serif text-yellow-400 font-bold mb-2">The Master Truth of the House</h3>
                    ${isSolved ? `
                        <div class="p-4 bg-yellow-950 border border-yellow-600 rounded text-yellow-200 text-xs">
                            <p class="font-bold mb-1">★ REVELATION COMPLETE</p>
                            <p>You have solved the mystery of the Sen family. Arjun designed this trail of clues so only Nisha\'s heir could reclaim the archive.</p>
                            <button onclick="if (window.notebookUI) window.notebookUI.close(); if (window.gameDirector) window.gameDirector.startFinalSecretSequence();" class="mt-3 px-4 py-2 bg-yellow-500 text-black font-bold font-serif rounded">Unravel The Final Secret</button>
                        </div>
                    ` : `
                        <p class="text-xs text-gray-300 mb-3">Reconstruct why you were brought here tonight:</p>
                        <div class="space-y-3 mb-4 text-xs">
                            <div>
                                <label class="block text-gray-400 mb-1">1. Who threatened the family?</label>
                                <select id="m6-who" class="bg-black border border-gray-700 text-white p-1 rounded w-full">
                                    <option value="watcher">The Syndicate / Watchers tracking ancestral artifacts</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-gray-400 mb-1">2. Why were you brought to this estate?</label>
                                <select id="m6-why-player" class="bg-black border border-gray-700 text-white p-1 rounded w-full">
                                    <option value="finish_investigation">To finish Arjun\'s investigation and inherit the sealed archive</option>
                                </select>
                            </div>
                        </div>
                        <button id="btn-submit-m6" class="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold font-serif text-xs rounded">Finalize Deduction</button>
                    `}
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;

        // Wire deduction submission buttons
        const b1 = document.getElementById('btn-submit-m1');
        if (b1) b1.addEventListener('click', () => {
            const sel = document.querySelector('input[name="m1_deduction"]:checked');
            if (sel) this.submitDeduction(1, { deduction: sel.value });
        });

        const b2 = document.getElementById('btn-submit-m2');
        if (b2) b2.addEventListener('click', () => {
            const order = ['tl-pos-1', 'tl-pos-2', 'tl-pos-3', 'tl-pos-4'].map(id => document.getElementById(id).value);
            this.submitDeduction(2, { order });
        });

        const b3 = document.getElementById('btn-submit-m3');
        if (b3) b3.addEventListener('click', () => {
            const code = document.getElementById('m3-code-input').value.trim();
            this.submitDeduction(3, { code });
        });

        const b4 = document.getElementById('btn-submit-m4');
        if (b4) b4.addEventListener('click', () => {
            const payload = {
                person: document.getElementById('m4-person').value,
                location: document.getElementById('m4-location').value,
                event: document.getElementById('m4-event').value
            };
            this.submitDeduction(4, payload);
        });

        const b5 = document.getElementById('btn-submit-m5');
        if (b5) b5.addEventListener('click', () => {
            const sel = document.querySelector('input[name="m5_conn"]:checked');
            if (sel) this.submitDeduction(5, { connection: sel.value });
        });

        const b6 = document.getElementById('btn-submit-m6');
        if (b6) b6.addEventListener('click', () => {
            const payload = {
                who: document.getElementById('m6-who').value,
                why_player: document.getElementById('m6-why-player').value
            };
            this.submitDeduction(6, payload);
        });
    }

    submitDeduction(mysteryNum, answerData) {
        fetch('/api/deduction/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mystery_num: mysteryNum,
                answer: answerData
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.correct) {
                if (window.soundEngine) window.soundEngine.playDeductionSolved();
                window.gameState.solvedDeductions.add(mysteryNum);

                if (data.awarded_item) {
                    window.gameState.addItem(data.awarded_item);
                }

                if (mysteryNum === 2) {
                    window.gameState.setObjective("Investigate the Second Floor.", "New Area");
                } else if (mysteryNum === 3) {
                    window.gameState.setObjective("Examine the opened Hidden Chamber.", "Chamber Unlocked");
                    if (window.gameDirector && window.gameDirector.houseBuilder) {
                        window.gameDirector.houseBuilder.openSealedDoor();
                    }
                } else if (mysteryNum === 5) {
                    window.gameState.showToast("Ground Floor Key acquired.");
                    const groundObj = (window.STORY_CONFIG && window.STORY_CONFIG.objectives && window.STORY_CONFIG.objectives.groundFloorDoor) ?
                        window.STORY_CONFIG.objectives.groundFloorDoor : { text: "Unlock the reinforced ground-floor cellar door using the antique brass key.", title: "The Cellar" };
                    window.gameState.setObjective(groundObj.text, groundObj.title);
                } else if (mysteryNum === 6) {
                    window.gameState.setObjective("The House Has Remembered.", "Truth Uncovered");
                    this.close();
                    if (window.gameDirector) {
                        window.gameDirector.startFinalSecretSequence();
                    }
                }

                this.renderCurrentTab();
            } else {
                alert(data.message || "Incorrect deduction.");
            }
        })
        .catch(err => console.error('Deduction network error:', err));
    }
}

window.notebookUI = new NotebookUI();
