/**
 * Game State & Progression Manager
 * Natural, organic investigation tracking with Field Journal entries
 * and Evidence Pinboard connection logic. Zero spoiler checklists.
 */
class GameStateManager {
    constructor() {
        this.currentFloor = 'exterior';
        this.objective = 'Follow the road home.';
        this.discoveredClues = new Set();
        this.solvedDeductions = new Set();
        this.formedConnections = new Set();
        this.journalEntries = [];
        this.inventory = [
            {
                id: 'pendant',
                name: 'Antique Silver Pendant',
                desc: 'An heirloom engraved with an intricate sun and hourglass symbol. Passed down through your family.',
                icon: 'pendant'
            }
        ];

        // Explicit game state lifecycle flags
        this.playerInsideHouse = true;
        this.frontDoorLocked = true;
        this.groundFloorUnlocked = false;
        this.finalClueFound = false;
        this.finalSecretRevealed = false;
        this.endingTriggered = false;
        this.currentInspectionCallback = null;

        // Detailed clue repository
        this.clueDatabase = {
            // First Floor Clues
            clue_photo: {
                id: 'clue_photo',
                title: 'Family Portrait (2011)',
                desc: 'A framed vintage photograph of Arjun, Meera, Anya, and Rohan Sen in the living area.',
                details: 'The family sits together in formal attire. Upon close inspection, Arjun\'s hand rests on the mahogany desk, beside an antique silver pendant bearing an intricate sun and hourglass engraving.',
                journal: 'Found an old family portrait: Arjun, Meera, Anya, and Rohan Sen. Curiously, Arjun had an heirloom silver pendant with the exact same sun-hourglass symbol as mine.'
            },
            clue_diary: {
                id: 'clue_diary',
                title: 'Meera\'s Diary Entries',
                desc: 'A handwritten personal journal left on the coffee table.',
                details: '"October 19 — Arjun insists someone has been watching the road past sunset. He won\'t tell the children, but he barricaded the cellar door tonight. He says our ancestors safeguarded something they were never supposed to find."',
                journal: 'Meera Sen\'s diary notes growing terror in autumn 2011. Arjun noticed someone watching the estate gates at dusk and barricaded the cellar door.'
            },
            clue_newspaper: {
                id: 'clue_newspaper',
                title: 'The Providence Gazette',
                desc: 'A local newspaper broadsheet from late October 2011.',
                details: 'Headline: "SEN FAMILY DISAPPEARS OVERNIGHT". Food was left on the stove and coats were still hanging by the door. Police suspected a voluntary departure, yet associates mentioned nocturnal surveillance.',
                journal: 'The local newspaper reported that the Sen family abruptly vanished overnight, leaving meals on the stove and winter coats hanging in the foyer.'
            },
            clue_suitcase: {
                id: 'clue_suitcase',
                title: 'Abandoned Half-Packed Suitcase',
                desc: 'A leather suitcase resting in the study with clothing inside.',
                details: 'Packed with clothing and essentials, but abandoned without travel papers or money. The packing was interrupted abruptly by a disturbance.',
                journal: 'A suitcase in the study was half-packed with essentials and abandoned in haste, as if someone fled in panic.'
            },

            // First Floor Timeline Clues
            clue_clock: {
                id: 'clue_clock',
                title: 'Shattered Grandfather Clock',
                desc: 'An antique clock in the main hallway shattered by an impact.',
                details: 'Glass shards cover the pendulum. The violent shock arrested the mechanical gears at precisely 11:42 PM on the night of October 23, 2011.',
                journal: 'The grandfather clock in the hallway was stopped violently at 11:42 PM.'
            },
            clue_receipt: {
                id: 'clue_receipt',
                title: 'Crestview Store Receipt (10:15 PM)',
                desc: 'A store receipt dated October 23, 2011.',
                details: 'Timestamped 10:15 PM from Crestview General Goods for an emergency deadbolt and kerosene oil. Arjun was in town fortifying the house less than two hours before the clock stopped.',
                journal: 'A store receipt shows Arjun bought an emergency deadbolt in town at 10:15 PM on the final night.'
            },
            clue_diary_late: {
                id: 'clue_diary_late',
                title: 'Final Diary Note (10:45 PM)',
                desc: 'The last entry in Meera\'s diary on October 23.',
                details: '"10:45 PM — A sedan idling on the gravel road with its headlights cut. Arjun went downstairs with the lock. If they breach the gate, we take the archive documents and leave."',
                journal: 'Meera\'s final diary entry records a car idling with lights off outside the gate at 10:45 PM.'
            },
            clue_recording: {
                id: 'clue_recording',
                title: 'Dictaphone Cassette (11:15 PM)',
                desc: 'An audio recording on a tape machine in the reading room.',
                details: 'Audio transcript (11:15 PM): "They\'re at the front porch... It\'s not an ordinary trespasser. They know about the vault. If anyone finds this tape... protect Nisha\'s line."',
                journal: 'Heard Arjun\'s tape recording from 11:15 PM. A stranger arrived at the porch demanding vault records. Arjun whispered a warning to protect "Nisha\'s line".'
            },

            // Second Floor Clues
            clue_painting: {
                id: 'clue_painting',
                title: 'Symbolic Oil Painting',
                desc: 'A painting in the second-floor corridor showing four emblems in sequence.',
                details: 'The painting clearly depicts four historical emblems in order: The Golden Sun (1st), The All-Seeing Eye (2nd), The Brass Key (3rd), and The Hourglass (4th).',
                journal: 'A corridor painting depicts four emblems in sequence: Sun, Eye, Key, Hourglass.'
            },
            clue_desk_note: {
                id: 'clue_desk_note',
                title: 'Cipher Translation Memo',
                desc: 'A handwritten memo found in the archive corridor.',
                details: 'Arjun\'s handwriting: "The hydraulic lock follows the celestial sequence: Sun = 3, Eye = 7, Key = 2, Hourglass = 9."',
                journal: 'A memo translates the emblems into numbers: Sun = 3, Eye = 7, Key = 2, Hourglass = 9.'
            },
            clue_sealed_door: {
                id: 'clue_sealed_door',
                title: 'Hydraulic Sealed Chamber Door',
                desc: 'A heavy steel-reinforced door secured by a 4-digit mechanical keypad.',
                details: 'Etched into the brass dials are the emblems: Sun, Eye, Key, Hourglass.',
                journal: 'A reinforced door upstairs is locked by a 4-digit code matching the celestial emblems.'
            },

            // Hidden Room Clues
            clue_surveillance: {
                id: 'clue_surveillance',
                title: 'Night Surveillance Photograph',
                desc: 'A grainy 35mm photo taken from the upper window.',
                details: 'Timestamped OCT 23, 23:00 HRS. Shows an operative in a dark trench coat and hat stationed near the front gate.',
                journal: 'A telephoto photograph reveals an operative in a dark trench coat watching the gate at 11:00 PM.'
            },
            clue_statement: {
                id: 'clue_statement',
                title: 'Witness Statement Draft',
                desc: 'A draft report addressed to town magistrates.',
                details: 'Arjun documented repeated harassment from an organization demanding surrender of ancestral deeds and protective heirlooms.',
                journal: 'Arjun drafted a statement about harassment from an organization demanding their ancestral heirlooms.'
            },
            clue_torn_letter: {
                id: 'clue_torn_letter',
                title: 'Torn Extortion Letter',
                desc: 'A fragment of an intruder\'s letter recovered from the floor.',
                details: '"...we know Nisha fled west. Surrender the key to the archive or neither branch of your family will remain safe."',
                journal: 'A torn threat letter reveals the intruders were hunting Nisha\'s branch of the family.'
            },
            clue_map: {
                id: 'clue_map',
                title: 'Tactical Investigation Map',
                desc: 'A regional map with red pins connecting key locations.',
                details: 'Pins connect the Sen Estate, the surveillance watchpoint, and the western train station where Nisha departed.',
                journal: 'A map connects the house to a surveillance point and the railway station where Nisha left.'
            },

            // Second Floor Lineage Clues
            clue_nisha_portrait: {
                id: 'clue_nisha_portrait',
                title: 'Sepia Portrait of Young Nisha Sen (1985)',
                desc: 'A vintage studio photograph in an oval brass frame in the master bedroom.',
                details: 'Depicts young Nisha Sen before her departure in 1985. Around her neck hangs the exact antique silver pendant that I carry in my pocket today!',
                journal: 'Astonishing discovery: A portrait of young Nisha Sen shows her wearing the exact silver pendant that was given to me by my grandmother! I am Nisha\'s direct descendant!'
            },
            clue_family_record: {
                id: 'clue_family_record',
                title: 'Sen Family Genealogy Register',
                desc: 'An official family register tracing the Sen family tree.',
                details: 'Confirms Nisha Sen is Arjun\'s younger sister who left the estate to raise her own family.',
                journal: 'The family register traces Nisha Sen as Arjun\'s sister. My grandmother was Arjun\'s sister!'
            },
            clue_arjun_letter: {
                id: 'clue_arjun_letter',
                title: 'Arjun\'s Unsent Letter to Nisha',
                desc: 'A letter written by Arjun expressing remorse over their estrangement.',
                details: '"Nisha, if darkness ever descends, the subterranean vault will seal itself until someone holding your pendant returns."',
                journal: 'Arjun wrote to Nisha explaining that only someone carrying her pendant could safely reclaim the sealed vault.'
            },

            // Ground Floor Clues
            clue_player_dossier: {
                id: 'clue_player_dossier',
                title: 'Confidential Dossier: [YOUR NAME]',
                desc: 'A classified intelligence folder on the cellar archive table.',
                details: 'Stamped "CONFIDENTIAL". Contains surveillance notes on you, your university commute along Blackwood Road, and verification that you wear the silver pendant.',
                journal: 'The most shocking discovery: An intelligence file on the archive table documents ME. My daily route home along Blackwood Road, my family history, and my pendant... I was lured here tonight on purpose.'
            },
            clue_final_archive: {
                id: 'clue_final_archive',
                title: 'The Master Investigation Ledger',
                desc: 'The master ledger detailing the family\'s secret investigation.',
                details: 'Arjun hid the ancestral truth beneath the stones, knowing an heir would one day be guided back to finish what was begun.',
                journal: 'The master ledger confirms Arjun created this trail of evidence so that Nisha\'s heir could finish the investigation.'
            }
        };

        this.initUI();
    }

    initUI() {
        this.objectiveBox = document.getElementById('objective-box');
        this.objectiveTitle = document.getElementById('objective-title');
        this.objectiveText = document.getElementById('objective-text');
        this.inventoryBar = document.getElementById('inventory-bar');
        this.inspectModal = document.getElementById('inspect-modal');
        this.inspectTitle = document.getElementById('inspect-title');
        this.inspectDesc = document.getElementById('inspect-desc');
        this.inspectImg = document.getElementById('inspect-img');
        this.inspectClose = document.getElementById('inspect-close');

        if (this.inspectClose) {
            this.inspectClose.addEventListener('click', () => {
                this.closeInspection();
            });
        }

        this.updateInventoryUI();
        this.setObjective('Follow the road home.', 'Evening');
    }

    setObjective(text, title = 'Current Objective') {
        this.objective = text;
        if (this.objectiveText) this.objectiveText.textContent = text;
        if (this.objectiveTitle) this.objectiveTitle.textContent = title;
    }

    discoverClue(clueId) {
        if (this.discoveredClues.has(clueId)) return;
        this.discoveredClues.add(clueId);

        const clue = this.clueDatabase[clueId];
        if (clue) {
            if (window.soundEngine) window.soundEngine.playClueDiscovered();
            this.showToast(`Noted: ${clue.title}`);

            // Add to field journal
            if (clue.journal) {
                this.journalEntries.push({
                    id: clueId,
                    title: clue.title,
                    text: clue.journal,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }

            // Sync with local backend
            fetch('/api/clue/discover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clue_id: clueId,
                    clue_title: clue.title,
                    floor: this.currentFloor,
                    mystery_num: 1
                })
            }).catch(err => console.warn('Offline clue sync:', err));

            // Refresh notebook UI if open
            if (window.notebookUI && window.notebookUI.isOpen) {
                window.notebookUI.renderCurrentTab();
            }
        }
    }

    openInspection(clueId, onCompleteCallback = null) {
        const clue = this.clueDatabase[clueId];
        if (!clue) return;

        this.currentInspectionCallback = onCompleteCallback;
        if (window.soundEngine) window.soundEngine.playPaper();

        this.inspectTitle.textContent = clue.title;
        this.inspectDesc.textContent = clue.details || clue.desc;

        // Custom action button for Final Clue on Ground Floor
        let finalActionBtn = document.getElementById('inspect-final-action-btn');
        if (clueId === 'clue_player_dossier') {
            if (!finalActionBtn) {
                finalActionBtn = document.createElement('button');
                finalActionBtn.id = 'inspect-final-action-btn';
                finalActionBtn.className = 'w-full mt-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-serif font-bold text-xs uppercase tracking-widest rounded shadow-lg';
                finalActionBtn.textContent = 'Unravel The Final Secret';
                finalActionBtn.addEventListener('click', () => {
                    this.closeInspection();
                });
                this.inspectDesc.parentElement.appendChild(finalActionBtn);
            }
            finalActionBtn.style.display = 'block';
        } else if (finalActionBtn) {
            finalActionBtn.style.display = 'none';
        }

        if (window.textureGen) {
            let canvasTex = null;
            if (clueId === 'clue_photo') canvasTex = window.textureGen.getFamilyPhoto();
            else if (clueId === 'clue_clock') canvasTex = window.textureGen.getClockFace();
            else if (clueId === 'clue_newspaper') canvasTex = window.textureGen.getNewspaper();
            else if (clueId === 'clue_receipt') canvasTex = window.textureGen.getStoreReceipt();
            else if (clueId === 'clue_diary' || clueId === 'clue_diary_late') canvasTex = window.textureGen.getDiaryPage();
            else if (clueId === 'clue_painting') canvasTex = window.textureGen.getCarvedSymbol();
            else if (clueId === 'clue_desk_note') canvasTex = window.textureGen.getCipherMemo();
            else if (clueId === 'clue_surveillance') canvasTex = window.textureGen.getSurveillancePhoto();
            else if (clueId === 'clue_map') canvasTex = window.textureGen.getTownMap();
            else if (clueId === 'clue_torn_letter') canvasTex = window.textureGen.getTornLetter();
            else if (clueId === 'clue_statement') canvasTex = window.textureGen.getWitnessStatement();
            else if (clueId === 'clue_nisha_portrait') canvasTex = window.textureGen.getNishaPhoto();
            else if (clueId === 'clue_family_record') canvasTex = window.textureGen.getGenealogyRegister();
            else if (clueId === 'clue_arjun_letter') canvasTex = window.textureGen.getArjunLetter();
            else if (clueId === 'clue_player_dossier' || clueId === 'clue_final_archive') canvasTex = window.textureGen.getPlayerDossier();

            if (canvasTex && canvasTex.image) {
                this.inspectImg.src = canvasTex.image.toDataURL();
                this.inspectImg.style.display = 'block';
            } else {
                this.inspectImg.style.display = 'none';
            }
        }

        this.inspectModal.classList.add('active');
        if (window.playerController && window.playerController.controls) {
            window.playerController.controls.unlock();
        }
    }

    closeInspection() {
        this.inspectModal.classList.remove('active');
        if (window.soundEngine) window.soundEngine.resume();
        if (window.playerController && window.playerController.controls && window.gameDirector && window.gameDirector.phase === 'gameplay') {
            window.playerController.controls.lock();
        }

        if (this.currentInspectionCallback) {
            const cb = this.currentInspectionCallback;
            this.currentInspectionCallback = null;
            cb();
        }
    }

    addItem(item) {
        if (this.inventory.some(i => i.id === item.id)) return;
        this.inventory.push(item);
        this.updateInventoryUI();
        this.showToast(`Item Acquired: ${item.name}`);

        fetch('/api/inventory/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                item_id: item.id,
                item_name: item.name,
                item_desc: item.desc
            })
        }).catch(err => console.warn('Offline inv sync:', err));
    }

    hasItem(itemId) {
        return this.inventory.some(i => i.id === itemId);
    }

    updateInventoryUI() {
        if (!this.inventoryBar) return;
        this.inventoryBar.innerHTML = '';

        this.inventory.forEach(item => {
            const slot = document.createElement('div');
            slot.className = `inv-slot ${item.id === 'pendant' ? 'pendant-slot' : ''}`;
            slot.title = `${item.name}\n${item.desc}`;

            const iconSpan = document.createElement('span');
            iconSpan.style.fontSize = '22px';
            if (item.id === 'pendant') iconSpan.textContent = ' medallion ';
            else if (item.id.includes('key')) iconSpan.textContent = ' key ';
            else iconSpan.textContent = ' note ';

            slot.appendChild(iconSpan);
            slot.addEventListener('click', () => {
                this.showToast(`${item.name}: ${item.desc}`);
            });

            this.inventoryBar.appendChild(slot);
        });
    }

    // Try connecting two pieces of evidence on the pinboard
    tryConnectEvidence(clueA, clueB) {
        const pairKey = [clueA, clueB].sort().join('+');

        // Check valid logical connections
        let formed = false;
        let hypothesis = null;
        let unlockedDeduction = null;

        // 1. Photo + Diary/Newspaper/Suitcase -> Missing Family hypothesis (Hypothesis A)
        if (
            (clueA === 'clue_photo' || clueB === 'clue_photo') &&
            (['clue_diary', 'clue_diary_late', 'clue_newspaper', 'clue_suitcase'].includes(clueA) || ['clue_diary', 'clue_diary_late', 'clue_newspaper', 'clue_suitcase'].includes(clueB))
        ) {
            formed = true;
            hypothesis = "The family did not leave voluntarily. They prepared to flee in panic under imminent threat.";
            unlockedDeduction = 'missing_family';
        }
        // 2. Timeline clues -> Timeline Hypothesis (Hypothesis B)
        else if (
            ['clue_clock', 'clue_receipt', 'clue_diary', 'clue_diary_late', 'clue_recording'].includes(clueA) &&
            ['clue_clock', 'clue_receipt', 'clue_diary', 'clue_diary_late', 'clue_recording'].includes(clueB)
        ) {
            formed = true;
            hypothesis = "The final night has an exact chronological timeline that can be reconstructed.";
            unlockedDeduction = 'broken_timeline';
        }
        // 3. Painting + Memo/Door -> Hydraulic Code
        else if (
            (clueA === 'clue_painting' || clueB === 'clue_painting') &&
            (['clue_desk_note', 'clue_sealed_door'].includes(clueA) || ['clue_desk_note', 'clue_sealed_door'].includes(clueB))
        ) {
            formed = true;
            hypothesis = "The hydraulic lock follows the emblems from the corridor painting translated into digits.";
            unlockedDeduction = 'sealed_room';
        }
        // 4. Surveillance photo + Map/Statement/Letter -> Surveillance Matrix
        else if (
            (clueA === 'clue_surveillance' || clueB === 'clue_surveillance') &&
            (['clue_map', 'clue_statement', 'clue_torn_letter'].includes(clueA) || ['clue_map', 'clue_statement', 'clue_torn_letter'].includes(clueB))
        ) {
            formed = true;
            hypothesis = "A syndicate operative was surveilling the house to steal ancestral archive secrets.";
            unlockedDeduction = 'last_night';
        }
        // 5. Nisha portrait + Ledger/Letter -> Lineage & Key
        else if (
            (clueA === 'clue_nisha_portrait' || clueB === 'clue_nisha_portrait') &&
            (['clue_family_record', 'clue_arjun_letter'].includes(clueA) || ['clue_family_record', 'clue_arjun_letter'].includes(clueB))
        ) {
            formed = true;
            hypothesis = "My heirloom pendant came from Nisha Sen. I am the rightful heir to the estate!";
            unlockedDeduction = 'pendant_lineage';
        }
        // 6. Dossier + Ledger -> Master Truth
        else if (
            (clueA === 'clue_player_dossier' || clueB === 'clue_player_dossier') &&
            (clueA === 'clue_final_archive' || clueB === 'clue_final_archive')
        ) {
            formed = true;
            hypothesis = "I was summoned here tonight to finish Arjun's investigation and inherit the vault.";
            unlockedDeduction = 'final_truth';
        }

        if (formed) {
            this.formedConnections.add(pairKey);
            if (unlockedDeduction) {
                this.formedConnections.add(unlockedDeduction);
            }
            if (window.soundEngine) window.soundEngine.playDeductionSolved();
            this.showToast(`Hypothesis Formed: ${hypothesis}`);

            // Update tab button visibility
            const dedBtn = document.getElementById('tab-btn-deductions');
            const countSpan = document.getElementById('unlocked-deductions-count');
            if (dedBtn) {
                dedBtn.style.display = 'inline-block';
                const unlocked = this.getUnlockedDeductionsList().length;
                if (countSpan) countSpan.textContent = unlocked;
            }

            return { success: true, hypothesis, unlockedDeduction };
        } else {
            return {
                success: false,
                message: "No immediate correlation between these two pieces of evidence yet. Keep investigating."
            };
        }
    }

    getUnlockedDeductionsList() {
        const list = [];
        if (this.formedConnections.has('missing_family')) list.push(1);
        if (this.formedConnections.has('broken_timeline')) list.push(2);
        if (this.formedConnections.has('sealed_room')) list.push(3);
        if (this.formedConnections.has('last_night')) list.push(4);
        if (this.formedConnections.has('pendant_lineage')) list.push(5);
        if (this.formedConnections.has('final_truth')) list.push(6);
        return list;
    }

    showToast(message) {
        let toast = document.getElementById('game-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'game-toast';
            toast.style.position = 'absolute';
            toast.style.bottom = '90px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.background = 'rgba(12, 14, 18, 0.95)';
            toast.style.border = '1px solid #d4af37';
            toast.style.color = '#f3f4f6';
            toast.style.padding = '10px 22px';
            toast.style.borderRadius = '4px';
            toast.style.fontFamily = 'Cinzel, serif';
            toast.style.fontSize = '13px';
            toast.style.letterSpacing = '0.08em';
            toast.style.zIndex = '150';
            toast.style.boxShadow = '0 6px 20px rgba(0,0,0,0.8)';
            toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';

        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(10px)';
        }, 3600);
    }
}

window.gameState = new GameStateManager();
