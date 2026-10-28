/**
 * Procedural Canvas Texture & Artwork Generator
 * Generates high-fidelity vintage photographs, human portraits,
 * readable handwritten documents, and environmental textures entirely in-memory.
 * Fully offline, 100% local, optimized for 8 GB RAM.
 */
class TextureGenerator {
    constructor() {
        this.cache = {};
    }

    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        return { canvas, ctx };
    }

    toTexture(canvas, repeatX = 1, repeatY = 1) {
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, repeatY);
        return texture;
    }

    /* -----------------------------------------------------------------
     * 1. DARK AGED WOOD PLANKS
     * ----------------------------------------------------------------- */
    getWoodFloor() {
        if (this.cache.wood) return this.cache.wood;
        const { canvas, ctx } = this.createCanvas(512, 512);

        ctx.fillStyle = '#1c1511';
        ctx.fillRect(0, 0, 512, 512);

        const plankHeight = 64;
        for (let y = 0; y < 512; y += plankHeight) {
            ctx.fillStyle = (y / plankHeight) % 2 === 0 ? '#221a14' : '#19130f';
            ctx.fillRect(0, y, 512, plankHeight - 2);

            // Wood grain lines
            ctx.strokeStyle = '#120d09';
            ctx.lineWidth = 1;
            for (let i = 0; i < 16; i++) {
                const py = y + Math.random() * plankHeight;
                ctx.beginPath();
                ctx.moveTo(0, py);
                ctx.bezierCurveTo(160, py + Math.random() * 8 - 4, 340, py + Math.random() * 8 - 4, 512, py);
                ctx.stroke();
            }

            // Dark seam line
            ctx.fillStyle = '#0a0705';
            ctx.fillRect(0, y + plankHeight - 2, 512, 2);

            // Old iron nails
            ctx.fillStyle = '#0d0a08';
            ctx.fillRect(28, y + 8, 4, 4);
            ctx.fillRect(484, y + 8, 4, 4);
        }

        const tex = this.toTexture(canvas, 4, 4);
        this.cache.wood = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 2. VINTAGE WALLPAPER (PEELING DAMASK)
     * ----------------------------------------------------------------- */
    getWallpaper() {
        if (this.cache.wallpaper) return this.cache.wallpaper;
        const { canvas, ctx } = this.createCanvas(512, 512);

        // Aged olive-charcoal base
        ctx.fillStyle = '#262723';
        ctx.fillRect(0, 0, 512, 512);

        // Damask fleur pattern
        ctx.fillStyle = '#1e1f1b';
        for (let x = 32; x < 512; x += 64) {
            for (let y = 32; y < 512; y += 64) {
                ctx.beginPath();
                ctx.arc(x, y, 15, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x + 32, y + 32, 9, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Grungy peeling plaster patches
        ctx.fillStyle = '#171815';
        for (let i = 0; i < 9; i++) {
            const px = Math.random() * 420;
            const py = Math.random() * 420;
            ctx.beginPath();
            ctx.ellipse(px, py, 35 + Math.random() * 40, 20 + Math.random() * 30, Math.random(), 0, Math.PI * 2);
            ctx.fill();
        }

        const tex = this.toTexture(canvas, 3, 3);
        this.cache.wallpaper = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 3. CRACKED PLASTER (CEILINGS)
     * ----------------------------------------------------------------- */
    getPlaster() {
        if (this.cache.plaster) return this.cache.plaster;
        const { canvas, ctx } = this.createCanvas(512, 512);

        ctx.fillStyle = '#212327';
        ctx.fillRect(0, 0, 512, 512);

        ctx.fillStyle = '#18191c';
        for (let i = 0; i < 600; i++) {
            ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
        }

        ctx.strokeStyle = '#0e1012';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(110, 70);
        ctx.lineTo(200, 170);
        ctx.lineTo(260, 210);
        ctx.lineTo(340, 330);
        ctx.stroke();

        const tex = this.toTexture(canvas, 3, 3);
        this.cache.plaster = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 4. STONE CELLAR (GROUND FLOOR)
     * ----------------------------------------------------------------- */
    getStoneCellar() {
        if (this.cache.stone) return this.cache.stone;
        const { canvas, ctx } = this.createCanvas(512, 512);

        ctx.fillStyle = '#14161a';
        ctx.fillRect(0, 0, 512, 512);

        const rows = 8;
        const rowH = 512 / rows;
        for (let r = 0; r < rows; r++) {
            const y = r * rowH;
            const offset = (r % 2) * 32;
            for (let x = -32; x < 512 + 64; x += 64) {
                const bx = x + offset;
                ctx.fillStyle = (r + x) % 3 === 0 ? '#1f2228' : '#191b20';
                ctx.fillRect(bx + 2, y + 2, 60, rowH - 4);
                ctx.strokeStyle = '#0b0c0f';
                ctx.strokeRect(bx + 2, y + 2, 60, rowH - 4);
            }
        }

        const tex = this.toTexture(canvas, 4, 3);
        this.cache.stone = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 5. EVENING EXTERIOR ROAD (CLEAR DUSK VISIBILITY)
     * ----------------------------------------------------------------- */
    getExteriorRoad() {
        if (this.cache.road) return this.cache.road;
        const { canvas, ctx } = this.createCanvas(512, 512);

        // Damp evening asphalt/gravel
        ctx.fillStyle = '#282b33';
        ctx.fillRect(0, 0, 512, 512);

        // Subtle gravel texture
        ctx.fillStyle = '#1e2026';
        for (let i = 0; i < 1200; i++) {
            ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
        }

        // Soft road wheel ruts
        ctx.fillStyle = 'rgba(25, 27, 34, 0.4)';
        ctx.fillRect(100, 0, 80, 512);
        ctx.fillRect(332, 0, 80, 512);

        const tex = this.toTexture(canvas, 4, 16);
        this.cache.road = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 6. CARVED WALL SYMBOL & PENDANT MEDALLION (MYSTERY 3 PAINTING)
     * ----------------------------------------------------------------- */
    getCarvedSymbol() {
        if (this.cache.symbol) return this.cache.symbol;
        const { canvas, ctx } = this.createCanvas(600, 360);

        // Rich dark oil canvas background
        ctx.fillStyle = '#14120f';
        ctx.fillRect(0, 0, 600, 360);

        // Aged canvas texture
        ctx.fillStyle = 'rgba(180, 150, 100, 0.06)';
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 600, Math.random() * 360, 20 + Math.random() * 40, 0, Math.PI * 2);
            ctx.fill();
        }

        // Ornate gilt frame border
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 6;
        ctx.strokeRect(12, 12, 576, 336);

        ctx.strokeStyle = '#997a22';
        ctx.lineWidth = 2;
        ctx.strokeRect(18, 18, 564, 324);

        // Painting title
        ctx.fillStyle = '#f3e5ab';
        ctx.font = 'bold 20px "Cinzel", serif';
        ctx.textAlign = 'center';
        ctx.fillText('THE FOUR CELESTIAL EMBLEMS', 300, 52);

        ctx.font = 'italic 12px "Cinzel", serif';
        ctx.fillStyle = '#c5a059';
        ctx.fillText('Sequence of the Ancestral Seal: Sun  ➔  Eye  ➔  Key  ➔  Hourglass', 300, 75);

        // 4 Emblem Panels
        const emblems = [
            { name: 'I. SUN', sub: 'The Radiant Light' },
            { name: 'II. EYE', sub: 'The All-Seeing' },
            { name: 'III. KEY', sub: 'The Opener' },
            { name: 'IV. HOURGLASS', sub: 'The Unyielding' }
        ];

        const xs = [85, 225, 365, 505];
        const cy = 180;

        // Draw 4 emblem frames
        for (let i = 0; i < 4; i++) {
            const x = xs[i];

            // Frame for emblem
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x - 55, cy - 65, 110, 130);

            // Subtle inner glow
            const radGrad = ctx.createRadialGradient(x, cy - 8, 5, x, cy - 8, 48);
            radGrad.addColorStop(0, 'rgba(212, 175, 55, 0.18)');
            radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = radGrad;
            ctx.fillRect(x - 54, cy - 64, 108, 128);

            // Labels
            ctx.fillStyle = '#e8d8b0';
            ctx.font = 'bold 13px "Cinzel", serif';
            ctx.textAlign = 'center';
            ctx.fillText(emblems[i].name, x, cy + 85);

            ctx.fillStyle = '#a68b54';
            ctx.font = '10px "Cinzel", serif';
            ctx.fillText(emblems[i].sub, x, cy + 100);

            // Arrows between emblems
            if (i < 3) {
                const arrowX = (x + xs[i + 1]) / 2;
                ctx.fillStyle = '#d4af37';
                ctx.font = 'bold 22px serif';
                ctx.fillText('➔', arrowX, cy);
            }
        }

        // Emblem 1: Sun (x = 85, cy = 172)
        ctx.strokeStyle = '#d4af37';
        ctx.fillStyle = '#e8c454';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(85, 172, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
            ctx.beginPath();
            ctx.moveTo(85 + Math.cos(a) * 20, 172 + Math.sin(a) * 20);
            ctx.lineTo(85 + Math.cos(a) * 36, 172 + Math.sin(a) * 36);
            ctx.stroke();
        }

        // Emblem 2: Eye (x = 225, cy = 172)
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(195, 172);
        ctx.quadraticCurveTo(225, 142, 255, 172);
        ctx.quadraticCurveTo(225, 202, 195, 172);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(225, 172, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#e8c454';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(225, 172, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#14120f';
        ctx.fill();

        // Emblem 3: Key (x = 365, cy = 172)
        ctx.lineWidth = 2.5;
        // Ring
        ctx.beginPath();
        ctx.arc(365, 150, 14, 0, Math.PI * 2);
        ctx.stroke();
        // Shaft
        ctx.beginPath();
        ctx.moveTo(365, 164);
        ctx.lineTo(365, 200);
        ctx.stroke();
        // Teeth
        ctx.beginPath();
        ctx.moveTo(365, 186); ctx.lineTo(377, 186);
        ctx.moveTo(365, 196); ctx.lineTo(380, 196);
        ctx.stroke();

        // Emblem 4: Hourglass (x = 505, cy = 172)
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        // Upper rim
        ctx.moveTo(482, 144); ctx.lineTo(528, 144);
        // Lower rim
        ctx.moveTo(482, 200); ctx.lineTo(528, 200);
        // Upper cone
        ctx.moveTo(486, 144); ctx.lineTo(505, 172); ctx.lineTo(524, 144);
        // Lower cone
        ctx.moveTo(486, 200); ctx.lineTo(505, 172); ctx.lineTo(524, 200);
        ctx.stroke();

        // Sand in bottom bulb
        ctx.fillStyle = '#e8c454';
        ctx.beginPath();
        ctx.moveTo(492, 198); ctx.lineTo(505, 180); ctx.lineTo(518, 198);
        ctx.closePath();
        ctx.fill();

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.symbol = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 6b. CIPHER TRANSLATION MEMO (ARJUN'S HANDWRITTEN CIPHER NOTES)
     * ----------------------------------------------------------------- */
    getCipherMemo() {
        if (this.cache.cipherMemo) return this.cache.cipherMemo;
        const { canvas, ctx } = this.createCanvas(600, 750);

        // Aged yellowed notepad paper
        ctx.fillStyle = '#eadebe';
        ctx.fillRect(0, 0, 600, 750);

        // Water aging
        ctx.fillStyle = 'rgba(160, 130, 80, 0.12)';
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 600, Math.random() * 750, 30 + Math.random() * 50, 0, Math.PI * 2);
            ctx.fill();
        }

        // Red margin line
        ctx.strokeStyle = 'rgba(180, 70, 70, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(70, 0); ctx.lineTo(70, 750);
        ctx.stroke();

        // Title
        ctx.fillStyle = '#221914';
        ctx.font = 'bold 22px "Cinzel", serif';
        ctx.fillText('CIPHER TRANSLATION MEMO', 95, 75);

        ctx.font = 'italic 15px "Special Elite", monospace';
        ctx.fillStyle = '#6b4f3b';
        ctx.fillText('Notes by Arjun Sen — Upper Corridor Vault Locks', 95, 105);

        // Drawn line
        ctx.strokeStyle = '#4a3828';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(95, 120); ctx.lineTo(540, 120);
        ctx.stroke();

        // Memo content
        ctx.font = '19px "Special Elite", monospace';
        ctx.fillStyle = '#1c150e';
        const notes = [
            'The hydraulic chamber door uses the ancient celestial lock.',
            'Each emblem in the corridor painting correlates to a digit:',
            '',
            '       SUN        =   3',
            '       EYE        =   7',
            '       KEY        =   2',
            '       HOURGLASS  =   9',
            '',
            'Sequence on painting: Sun ➔ Eye ➔ Key ➔ Hourglass',
            '',
            'Therefore, the disengagement keypad code is:',
            '               [  3  7  2  9  ]',
            '',
            'Keep this note concealed from the children.',
            'The hydraulic seals will open the hidden surveillance room.',
            '',
            '— A. Sen, October 2011'
        ];

        let lineY = 165;
        notes.forEach(line => {
            if (line.includes('[  3  7  2  9  ]')) {
                ctx.font = 'bold 26px monospace';
                ctx.fillStyle = '#991b1b';
                ctx.fillText(line, 95, lineY);
                ctx.font = '19px "Special Elite", monospace';
                ctx.fillStyle = '#1c150e';
            } else if (line.includes('=')) {
                ctx.font = 'bold 21px monospace';
                ctx.fillStyle = '#7c2d12';
                ctx.fillText(line, 95, lineY);
                ctx.font = '19px "Special Elite", monospace';
                ctx.fillStyle = '#1c150e';
            } else {
                ctx.fillText(line, 95, lineY);
            }
            lineY += 34;
        });

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.cipherMemo = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 6c. TORN EXTORTION LETTER (MYSTERY 4)
     * ----------------------------------------------------------------- */
    getTornLetter() {
        if (this.cache.tornLetter) return this.cache.tornLetter;
        const { canvas, ctx } = this.createCanvas(600, 600);

        ctx.fillStyle = '#11100f';
        ctx.fillRect(0, 0, 600, 600);

        // Torn parchment outline
        ctx.fillStyle = '#dfd3be';
        ctx.beginPath();
        ctx.moveTo(60, 80);
        ctx.lineTo(520, 70);
        ctx.lineTo(540, 480);
        // Jagged torn bottom edge
        for (let x = 540; x >= 60; x -= 25) {
            ctx.lineTo(x, 480 + (Math.random() * 26 - 13));
        }
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#8a7356';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = 'bold 18px "Cinzel", serif';
        ctx.fillStyle = '#991b1b';
        ctx.fillText('[ RECOVERED INTRUDER FRAGMENT ]', 95, 120);

        ctx.font = '18px "Special Elite", monospace';
        ctx.fillStyle = '#1f160e';

        const lines = [
            '"...we know Nisha fled west with the heirloom.',
            ' Surrender the key to the underground archive or',
            ' neither branch of your family will remain safe.',
            '',
            ' You cannot hide behind your reinforced doors.',
            ' We are watching the property gate day and night.',
            ' Surrender the talisman before the month ends."',
            '',
            '— The Watcher'
        ];

        let y = 170;
        lines.forEach(l => {
            ctx.fillText(l, 95, y);
            y += 32;
        });

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.tornLetter = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 6d. WITNESS STATEMENT DRAFT (MYSTERY 4)
     * ----------------------------------------------------------------- */
    getWitnessStatement() {
        if (this.cache.witnessStatement) return this.cache.witnessStatement;
        const { canvas, ctx } = this.createCanvas(600, 750);

        ctx.fillStyle = '#f0ebe1';
        ctx.fillRect(0, 0, 600, 750);

        ctx.strokeStyle = '#4a4235';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(30, 30, 540, 690);

        ctx.font = 'bold 20px "Cinzel", serif';
        ctx.fillStyle = '#1c150e';
        ctx.textAlign = 'center';
        ctx.fillText('LEGAL WITNESS STATEMENT DRAFT', 300, 70);

        ctx.font = '13px monospace';
        ctx.fillStyle = '#5c4e3c';
        ctx.fillText('FILED BY: ARJUN SEN  |  PROVIDENCE POLICE DEPT', 300, 95);

        ctx.textAlign = 'left';
        ctx.font = '16px "Special Elite", monospace';
        ctx.fillStyle = '#1c150e';

        const body = [
            'For three consecutive weeks, an unknown operative has',
            'stationed a vehicle past our boundary gate on Blackwood Road.',
            '',
            'The individual wears a dark trench coat and uses telephoto',
            'equipment to monitor all arrivals and departures.',
            '',
            'Target: Demanding surrender of ancestral documents concerning',
            'the subterranean chamber beneath the estate foundation.',
            '',
            'Intimidation extends toward my sister Nisha\'s family line.',
            'Law enforcement has failed to patrol the road.',
            '',
            'If an incursion occurs, I have fortified the cellar locks',
            'and prepared emergency measures to protect the lineage.',
            '',
            'Date: October 22, 2011  —  Arjun Sen'
        ];

        let y = 150;
        body.forEach(l => {
            ctx.fillText(l, 60, y);
            y += 32;
        });

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.witnessStatement = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 6e. SEN FAMILY GENEALOGY REGISTER (MYSTERY 5)
     * ----------------------------------------------------------------- */
    getGenealogyRegister() {
        if (this.cache.genealogyRegister) return this.cache.genealogyRegister;
        const { canvas, ctx } = this.createCanvas(600, 750);

        ctx.fillStyle = '#f2ecd9';
        ctx.fillRect(0, 0, 600, 750);

        ctx.strokeStyle = '#a68a56';
        ctx.lineWidth = 4;
        ctx.strokeRect(25, 25, 550, 700);

        ctx.font = 'bold 22px "Cinzel", serif';
        ctx.fillStyle = '#2b1d0c';
        ctx.textAlign = 'center';
        ctx.fillText('SEN FAMILY GENEALOGY REGISTER', 300, 75);

        ctx.font = 'italic 13px "Cinzel", serif';
        ctx.fillStyle = '#6b4f2c';
        ctx.fillText('Official Lineage & Succession Testament', 300, 100);

        ctx.textAlign = 'left';
        ctx.font = '16px "Special Elite", monospace';
        ctx.fillStyle = '#1c150e';

        const lines = [
            '• SEN BLOODLINE TREE:',
            '  ├─ Arjun Sen (b. 1968) — Master of Sen Estate',
            '  │   └─ m. Meera Sen (b. 1971)',
            '  │       ├─ Anya Sen (b. 2001)',
            '  │       └─ Rohan Sen (b. 2005)',
            '  │',
            '  └─ Nisha Sen (b. 1974) — Younger Sister of Arjun',
            '      └─ Emigrated West (1985) with Ancestral Silver Pendant',
            '          └─ Child of Nisha',
            '              └─ GRANDCHILD (THE INHERITOR)',
            '',
            '• SUCCESSION CLAUSE:',
            '"The silver pendant worn by Nisha Sen represents the',
            ' direct rightful inheritor of the Sen Estate archives.',
            ' If Arjun\'s branch falls silent, the estate and subterranean',
            ' vault keys belong by birthright to Nisha\'s grandchild."'
        ];

        let y = 160;
        lines.forEach(l => {
            if (l.includes('GRANDCHILD')) {
                ctx.font = 'bold 17px monospace';
                ctx.fillStyle = '#991b1b';
                ctx.fillText(l, 60, y);
                ctx.font = '16px "Special Elite", monospace';
                ctx.fillStyle = '#1c150e';
            } else {
                ctx.fillText(l, 60, y);
            }
            y += 32;
        });

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.genealogyRegister = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 6f. ARJUN\'S UNSENT LETTER TO NISHA (MYSTERY 5)
     * ----------------------------------------------------------------- */
    getArjunLetter() {
        if (this.cache.arjunLetter) return this.cache.arjunLetter;
        const { canvas, ctx } = this.createCanvas(600, 750);

        ctx.fillStyle = '#eadebe';
        ctx.fillRect(0, 0, 600, 750);

        ctx.font = 'bold 20px "Cinzel", serif';
        ctx.fillStyle = '#221914';
        ctx.fillText('UNSENT LETTER TO NISHA', 80, 75);

        ctx.font = 'italic 16px "Special Elite", monospace';
        ctx.fillStyle = '#1c150e';

        const lines = [
            'Dearest Nisha,',
            '',
            'I know decades have passed since our argument in 1985.',
            'You took the antique silver pendant and built your life far away.',
            'I stayed here to preserve the family estate.',
            '',
            'The men who watched our father have now returned.',
            'They demand the secrets sealed inside our subterranean vault.',
            'I have locked the cellar with the antique brass key.',
            '',
            'The underground vault will only reveal its truth to someone',
            'carrying your silver pendant. If you or your grandchild ever',
            'return to this house, follow the clues I have left.',
            '',
            'You are the rightful heir. Protect the memory of our family.',
            '',
            'With eternal remorse,',
            'Your brother, Arjun'
        ];

        let y = 130;
        lines.forEach(l => {
            ctx.fillText(l, 80, y);
            y += 32;
        });

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.arjunLetter = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 7. HIGH-QUALITY REALISTIC FAMILY PORTRAIT (ARJUN, MEERA, ANYA, ROHAN)
     * ----------------------------------------------------------------- */
    getFamilyPhoto() {
        if (this.cache.familyPhoto) return this.cache.familyPhoto;
        const { canvas, ctx } = this.createCanvas(800, 600);

        // 1. Rich studio portrait sepia background with vignette
        const bgGrad = ctx.createRadialGradient(400, 280, 80, 400, 300, 450);
        bgGrad.addColorStop(0, '#534335');
        bgGrad.addColorStop(0.5, '#3b2f24');
        bgGrad.addColorStop(1, '#1f1812');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 800, 600);

        // Studio drapery / vintage wallpaper subtle backdrop
        ctx.fillStyle = 'rgba(30, 22, 16, 0.4)';
        ctx.fillRect(0, 0, 220, 600);
        ctx.fillRect(580, 0, 220, 600);

        // Helper to draw realistic shaded portrait human face
        const drawFace = (x, y, w, h, gender, hairStyle, hairColor, skinTone = '#d9bfa3') => {
            ctx.save();

            // Neck
            ctx.fillStyle = '#a88c72';
            ctx.fillRect(x - w * 0.2, y + h * 0.65, w * 0.4, h * 0.4);

            // Head shape / jawline
            ctx.fillStyle = skinTone;
            ctx.beginPath();
            ctx.ellipse(x, y + h * 0.35, w * 0.42, h * 0.48, 0, 0, Math.PI * 2);
            ctx.fill();

            // Soft cheekbone / jaw shading
            ctx.fillStyle = 'rgba(110, 80, 60, 0.25)';
            ctx.beginPath();
            ctx.arc(x - w * 0.28, y + h * 0.4, w * 0.15, 0, Math.PI * 2);
            ctx.arc(x + w * 0.28, y + h * 0.4, w * 0.15, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            const eyeY = y + h * 0.32;
            const eyeDist = w * 0.18;
            [-eyeDist, eyeDist].forEach(ox => {
                // Eyeball
                ctx.fillStyle = '#ece4d8';
                ctx.beginPath();
                ctx.ellipse(x + ox, eyeY, 6, 3.5, 0, 0, Math.PI * 2);
                ctx.fill();
                // Iris
                ctx.fillStyle = '#261b12';
                ctx.beginPath();
                ctx.arc(x + ox, eyeY, 2.8, 0, Math.PI * 2);
                ctx.fill();
                // Eyelid line
                ctx.strokeStyle = '#3d2b1f';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(x + ox, eyeY - 1, 6, Math.PI, Math.PI * 2);
                ctx.stroke();
                // Eyebrow
                ctx.strokeStyle = hairColor;
                ctx.lineWidth = 2.0;
                ctx.beginPath();
                ctx.moveTo(x + ox - 8, eyeY - 7);
                ctx.lineTo(x + ox + 8, eyeY - 6);
                ctx.stroke();
            });

            // Nose
            ctx.strokeStyle = 'rgba(90, 65, 45, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, eyeY);
            ctx.lineTo(x - 2, eyeY + h * 0.16);
            ctx.lineTo(x + 3, eyeY + h * 0.16);
            ctx.stroke();

            // Mouth / Lips
            const mouthY = eyeY + h * 0.28;
            ctx.fillStyle = '#8f5c49';
            ctx.beginPath();
            ctx.ellipse(x, mouthY, 9, 3.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#4a2c20';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - 9, mouthY);
            ctx.lineTo(x + 9, mouthY);
            ctx.stroke();

            // Hair
            ctx.fillStyle = hairColor;
            if (hairStyle === 'man_part') {
                // Side-parted combed hair
                ctx.beginPath();
                ctx.arc(x, y + h * 0.15, w * 0.46, Math.PI, Math.PI * 2);
                ctx.lineTo(x + w * 0.44, y + h * 0.38);
                ctx.lineTo(x + w * 0.38, y + h * 0.48); // sideburn
                ctx.lineTo(x - w * 0.38, y + h * 0.48);
                ctx.lineTo(x - w * 0.44, y + h * 0.38);
                ctx.closePath();
                ctx.fill();
            } else if (hairStyle === 'woman_updo') {
                // Elegant soft updo with curled sides
                ctx.beginPath();
                ctx.arc(x, y + h * 0.12, w * 0.52, Math.PI * 0.9, Math.PI * 2.1);
                ctx.lineTo(x + w * 0.48, y + h * 0.55);
                ctx.lineTo(x - w * 0.48, y + h * 0.55);
                ctx.closePath();
                ctx.fill();
                // Bun on top
                ctx.beginPath();
                ctx.arc(x, y - h * 0.05, w * 0.28, 0, Math.PI * 2);
                ctx.fill();
            } else if (hairStyle === 'girl_braids') {
                // Long hair with braids
                ctx.beginPath();
                ctx.arc(x, y + h * 0.18, w * 0.46, Math.PI, Math.PI * 2);
                ctx.lineTo(x + w * 0.42, y + h * 0.8);
                ctx.lineTo(x + w * 0.28, y + h * 0.8);
                ctx.lineTo(x + w * 0.22, y + h * 0.4);
                ctx.lineTo(x - w * 0.22, y + h * 0.4);
                ctx.lineTo(x - w * 0.28, y + h * 0.8);
                ctx.lineTo(x - w * 0.42, y + h * 0.8);
                ctx.closePath();
                ctx.fill();
            } else if (hairStyle === 'boy_short') {
                ctx.beginPath();
                ctx.arc(x, y + h * 0.18, w * 0.44, Math.PI * 0.8, Math.PI * 2.2);
                ctx.lineTo(x + w * 0.4, y + h * 0.42);
                ctx.lineTo(x - w * 0.4, y + h * 0.42);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        };

        // 2. ARJUN (FATHER - Seated Left, authoritative posture)
        // Body / Suit
        ctx.fillStyle = '#1e1c18';
        ctx.beginPath();
        ctx.moveTo(180, 290);
        ctx.lineTo(360, 290);
        ctx.lineTo(380, 560);
        ctx.lineTo(160, 560);
        ctx.closePath();
        ctx.fill();

        // White formal collar & dark tie
        ctx.fillStyle = '#e8ded0';
        ctx.beginPath();
        ctx.moveTo(250, 290);
        ctx.lineTo(290, 290);
        ctx.lineTo(270, 340);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#11100e';
        ctx.fillRect(266, 305, 8, 80);

        // Arjun's Head
        drawFace(270, 160, 95, 120, 'male', 'man_part', '#241a12');

        // 3. MEERA (MOTHER - Standing gracefully beside Arjun)
        // Long dark vintage dress
        ctx.fillStyle = '#2b232c';
        ctx.beginPath();
        ctx.moveTo(370, 240);
        ctx.lineTo(520, 240);
        ctx.lineTo(540, 560);
        ctx.lineTo(350, 560);
        ctx.closePath();
        ctx.fill();

        // Lace collar
        ctx.fillStyle = '#dcd2c4';
        ctx.beginPath();
        ctx.arc(445, 248, 25, 0, Math.PI);
        ctx.fill();

        // Meera's Head
        drawFace(445, 125, 85, 110, 'female', 'woman_updo', '#1c1510');

        // Meera's hand resting tenderly on Arjun's shoulder
        ctx.fillStyle = '#d9bfa3';
        ctx.beginPath();
        ctx.ellipse(350, 295, 12, 18, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // 4. ANYA (DAUGHTER - Standing in front, aged ~10)
        ctx.fillStyle = '#42372f';
        ctx.beginPath();
        ctx.moveTo(330, 380);
        ctx.lineTo(440, 380);
        ctx.lineTo(455, 560);
        ctx.lineTo(315, 560);
        ctx.closePath();
        ctx.fill();
        // Dress collar
        ctx.fillStyle = '#ece4d6';
        ctx.beginPath();
        ctx.arc(385, 385, 18, 0, Math.PI);
        ctx.fill();
        drawFace(385, 290, 68, 85, 'female', 'girl_braids', '#221810');

        // 5. ROHAN (SON - Standing front right, aged ~7)
        ctx.fillStyle = '#2a2824';
        ctx.beginPath();
        ctx.moveTo(470, 410);
        ctx.lineTo(560, 410);
        ctx.lineTo(570, 560);
        ctx.lineTo(455, 560);
        ctx.closePath();
        ctx.fill();
        // Boy's collar
        ctx.fillStyle = '#e8dec8';
        ctx.fillRect(505, 410, 20, 25);
        drawFace(515, 320, 64, 80, 'male', 'boy_short', '#2b1c14');

        // 6. MAHOGANY TABLE IN FOREGROUND (Arjun's hand & The Silver Pendant)
        ctx.fillStyle = '#22150e';
        ctx.fillRect(100, 440, 250, 160);
        ctx.fillStyle = '#2f1e14';
        ctx.fillRect(100, 440, 250, 8);

        // Arjun's rested hand with fingers
        ctx.fillStyle = '#d9bfa3';
        ctx.beginPath();
        ctx.ellipse(250, 442, 22, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let f = 0; f < 4; f++) {
            ctx.beginPath();
            ctx.ellipse(235 + f * 9, 440, 4, 10, 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // THE SILVER PENDANT (resting subtly on table near Arjun's hand)
        ctx.save();
        ctx.translate(290, 446);
        // Chain
        ctx.strokeStyle = '#c0c0c0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -10, 16, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();

        // Silver medallion
        ctx.fillStyle = '#d4d4d8';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#71717a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Sun & Hourglass engraving inside medallion
        ctx.fillStyle = '#a1a1aa';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-7, -7); ctx.lineTo(7, -7); ctx.lineTo(0, 0); ctx.closePath();
        ctx.moveTo(-7, 7); ctx.lineTo(7, 7); ctx.lineTo(0, 0); ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // 7. Sepia Photographic Aging Overlay & Vignette
        ctx.fillStyle = 'rgba(215, 185, 140, 0.12)';
        ctx.fillRect(0, 0, 800, 600);

        // Scratches and vintage dust
        ctx.strokeStyle = 'rgba(240, 230, 210, 0.25)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(80, 40); ctx.lineTo(120, 180);
        ctx.moveTo(680, 200); ctx.lineTo(710, 420);
        ctx.stroke();

        // Gilded photo border & caption
        ctx.strokeStyle = '#3d3023';
        ctx.lineWidth = 16;
        ctx.strokeRect(8, 8, 784, 584);

        ctx.font = 'italic 20px "Cinzel", serif';
        ctx.fillStyle = '#e4d3ba';
        ctx.textAlign = 'center';
        ctx.fillText('The Sen Family — Summer 2011', 400, 565);

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.familyPhoto = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 8. VINTAGE PORTRAIT OF YOUNG NISHA SEN (1985)
     * ----------------------------------------------------------------- */
    getNishaPhoto() {
        if (this.cache.nishaPhoto) return this.cache.nishaPhoto;
        const { canvas, ctx } = this.createCanvas(500, 650);

        // Warm sepia oval studio backdrop
        ctx.fillStyle = '#231b14';
        ctx.fillRect(0, 0, 500, 650);

        // Oval mask gradient
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(250, 310, 200, 270, 0, 0, Math.PI * 2);
        ctx.clip();

        const grad = ctx.createRadialGradient(250, 280, 50, 250, 310, 260);
        grad.addColorStop(0, '#634e3e');
        grad.addColorStop(0.7, '#3d2e22');
        grad.addColorStop(1, '#1e1610');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 500, 650);

        // Dress / shoulders
        ctx.fillStyle = '#2c252b';
        ctx.beginPath();
        ctx.moveTo(140, 450);
        ctx.bezierCurveTo(200, 420, 300, 420, 360, 450);
        ctx.lineTo(400, 650);
        ctx.lineTo(100, 650);
        ctx.closePath();
        ctx.fill();

        // Elegant collar
        ctx.fillStyle = '#ded5c7';
        ctx.beginPath();
        ctx.ellipse(250, 430, 40, 15, 0, 0, Math.PI);
        ctx.fill();

        // Neck
        ctx.fillStyle = '#c5a98e';
        ctx.fillRect(230, 330, 40, 90);

        // Young Nisha's Head
        ctx.fillStyle = '#debfa4';
        ctx.beginPath();
        ctx.ellipse(250, 250, 65, 80, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (gentle almond eyes)
        [-24, 24].forEach(ox => {
            ctx.fillStyle = '#f4eee4';
            ctx.beginPath();
            ctx.ellipse(250 + ox, 240, 8, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#281a10';
            ctx.beginPath();
            ctx.arc(250 + ox, 240, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#382315';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(250 + ox, 238, 8, Math.PI, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(250 + ox - 10, 230);
            ctx.lineTo(250 + ox + 10, 229);
            ctx.stroke();
        });

        // Nose
        ctx.strokeStyle = 'rgba(100, 70, 50, 0.7)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(250, 240);
        ctx.lineTo(248, 268);
        ctx.lineTo(254, 268);
        ctx.stroke();

        // Gentle warm smile
        ctx.fillStyle = '#a66453';
        ctx.beginPath();
        ctx.ellipse(250, 292, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5a2f20';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(250, 290, 14, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // 1980s soft wavy dark hair
        ctx.fillStyle = '#1c140e';
        ctx.beginPath();
        ctx.arc(250, 230, 80, Math.PI * 0.8, Math.PI * 2.2);
        ctx.bezierCurveTo(345, 280, 345, 390, 310, 420);
        ctx.lineTo(290, 410);
        ctx.bezierCurveTo(310, 340, 310, 260, 250, 240);
        ctx.bezierCurveTo(190, 260, 190, 340, 210, 410);
        ctx.lineTo(190, 420);
        ctx.bezierCurveTo(155, 390, 155, 280, 250, 230);
        ctx.closePath();
        ctx.fill();

        // THE SILVER PENDANT WEARING AROUND NISHA'S NECK
        ctx.strokeStyle = '#d4d4d8';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(230, 360);
        ctx.quadraticCurveTo(250, 435, 270, 360);
        ctx.stroke();

        // Pendant medallion resting on chest
        ctx.fillStyle = '#e4e4e7';
        ctx.beginPath();
        ctx.arc(250, 418, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Symbol engraved in pendant
        ctx.fillStyle = '#71717a';
        ctx.beginPath();
        ctx.arc(250, 418, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(244, 412); ctx.lineTo(256, 412); ctx.lineTo(250, 418); ctx.closePath();
        ctx.moveTo(244, 424); ctx.lineTo(256, 424); ctx.lineTo(250, 418); ctx.closePath();
        ctx.stroke();

        ctx.restore();

        // Oval brass frame ring
        ctx.strokeStyle = '#b8923a';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.ellipse(250, 310, 200, 270, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Caption at bottom
        ctx.font = 'italic 16px "Cinzel", serif';
        ctx.fillStyle = '#dcd0bc';
        ctx.textAlign = 'center';
        ctx.fillText('Nisha Sen — Before Departure, 1985', 250, 620);

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.nishaPhoto = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 9. BROKEN GRANDFATHER CLOCK FACE (11:42 PM)
     * ----------------------------------------------------------------- */
    getClockFace() {
        if (this.cache.clockFace) return this.cache.clockFace;
        const { canvas, ctx } = this.createCanvas(512, 512);

        // Aged enamel dial
        const grad = ctx.createRadialGradient(256, 256, 60, 256, 256, 240);
        grad.addColorStop(0, '#f5efe0');
        grad.addColorStop(0.85, '#d4c4a5');
        grad.addColorStop(1, '#8e7f62');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(256, 256, 240, 0, Math.PI * 2);
        ctx.fill();

        // Outer minute ring
        ctx.strokeStyle = '#2b2318';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(256, 256, 225, 0, Math.PI * 2);
        ctx.stroke();

        // Roman Numerals
        ctx.font = 'bold 36px "Cinzel", serif';
        ctx.fillStyle = '#1c160f';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
        numerals.forEach((num, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x = 256 + Math.cos(angle) * 175;
            const y = 256 + Math.sin(angle) * 175;
            ctx.fillText(num, x, y);
        });

        // Hands stopped at 11:42 PM!
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#120d09';
        ctx.lineCap = 'round';

        // Hour hand pointing near 12/11
        const hourAngle = (-30 - 90 + (42/60)*30) * (Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(256, 256);
        ctx.lineTo(256 + Math.cos(hourAngle) * 95, 256 + Math.sin(hourAngle) * 95);
        ctx.stroke();

        // Minute hand pointing at 42 mins
        ctx.lineWidth = 5;
        const minAngle = (42 * 6 - 90) * (Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(256, 256);
        ctx.lineTo(256 + Math.cos(minAngle) * 155, 256 + Math.sin(minAngle) * 155);
        ctx.stroke();

        // Center brass cap
        ctx.fillStyle = '#b8860b';
        ctx.beginPath();
        ctx.arc(256, 256, 12, 0, Math.PI * 2);
        ctx.fill();

        // Shattered glass impact fracture originating at 11:42
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(40, 30, 20, 0.75)';
        ctx.beginPath();
        ctx.moveTo(256, 256);
        ctx.lineTo(155, 105);
        ctx.lineTo(95, 75);
        ctx.moveTo(155, 105);
        ctx.lineTo(195, 55);
        ctx.moveTo(155, 105);
        ctx.lineTo(125, 170);
        ctx.stroke();

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.clockFace = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 10. AUTHENTIC AGED DIARY PARCHMENT WITH READABLE CURSIVE
     * ----------------------------------------------------------------- */
    getDiaryPage() {
        if (this.cache.diary) return this.cache.diary;
        const { canvas, ctx } = this.createCanvas(600, 750);

        // Aged yellowed deckled parchment
        ctx.fillStyle = '#eadebe';
        ctx.fillRect(0, 0, 600, 750);

        // Water stains and aging spots
        ctx.fillStyle = 'rgba(160, 130, 80, 0.15)';
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 600, Math.random() * 750, 30 + Math.random() * 60, 0, Math.PI * 2);
            ctx.fill();
        }

        // Faint margin lines
        ctx.strokeStyle = 'rgba(180, 70, 70, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(70, 0); ctx.lineTo(70, 750);
        ctx.stroke();

        // Realistic fountain pen ink cursive
        ctx.fillStyle = '#221914';
        ctx.font = 'bold 22px "Cinzel", serif';
        ctx.fillText('October 19, 2011 — Midnight', 90, 70);

        ctx.font = '18px "Special Elite", cursive, serif';
        const lines = [
            'Arjun returned from town with an iron bolt for the cellar.',
            'He refuses to terrify the children, but I see his hands trembling',
            'when he gazes toward the dark treeline past the road.',
            '',
            '"Someone is watching the gates," he whispered to me.',
            '"They know about the vault under the foundations.',
            'They demand our grandmother\'s talismans."',
            '',
            'I prayed that Nisha\'s departure twenty years ago would',
            'have broken this curse. But Arjun kept the matching pendant,',
            'and now they have traced the bloodline back to this house.',
            '',
            'If they breach the doors, God protect our souls.'
        ];

        lines.forEach((l, idx) => {
            ctx.fillText(l, 90, 130 + idx * 38);
        });

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.diary = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 11. HISTORICAL NEWSPAPER BROADSHEET
     * ----------------------------------------------------------------- */
    getNewspaper() {
        if (this.cache.newspaper) return this.cache.newspaper;
        const { canvas, ctx } = this.createCanvas(600, 650);

        ctx.fillStyle = '#e2dac6';
        ctx.fillRect(0, 0, 600, 650);

        // Masthead
        ctx.fillStyle = '#17181c';
        ctx.font = 'bold 36px "Cinzel", serif';
        ctx.textAlign = 'center';
        ctx.fillText('THE PROVIDENCE GAZETTE', 300, 50);

        ctx.font = '12px serif';
        ctx.fillText('ESTABLISHED 1884  •  FRIDAY, OCTOBER 28, 2011  •  VOL. CXIV NO. 294', 300, 72);

        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(35, 82); ctx.lineTo(565, 82);
        ctx.stroke();

        // Main Headline
        ctx.font = 'bold 26px "Cinzel", serif';
        ctx.fillText('SEN FAMILY DISAPPEARS OVERNIGHT', 300, 120);

        ctx.font = 'italic 16px "Special Elite", serif';
        ctx.fillText('Historic Estate Found Unlatched — No Signs of Burglary', 300, 148);

        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(35, 160); ctx.lineTo(565, 160);
        ctx.stroke();

        // Columns
        ctx.textAlign = 'left';
        ctx.font = '13px "Special Elite", serif';
        const col1 = [
            'BLACKWOOD ROAD — Authorities',
            'were alerted after milkmen found',
            'the wrought-iron gates standing',
            'open. Respected local archivist',
            'Arjun Sen, his wife Meera, and',
            'their two school-aged children',
            'have vanished without trace.',
            '',
            'Curiously, winter coats hung in',
            'the hall, meals sat untouched on',
            'the stove, and half-packed luggage',
            'lay abandoned in the master study.'
        ];
        col1.forEach((l, i) => ctx.fillText(l, 40, 190 + i * 24));

        const col2 = [
            'Police Chief Vance noted that no',
            'doors were forced and all cash',
            'drawers were undisturbed, initially',
            'pointing toward a voluntary flight.',
            '',
            'However, family associates insist',
            'Arjun had expressed mounting terror',
            'over nocturnal surveillance.',
            '',
            '"He warned me someone was',
            'tracking an heirloom," a colleague',
            'confided under condition of anonymity.'
        ];
        col2.forEach((l, i) => ctx.fillText(l, 310, 190 + i * 24));

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.newspaper = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 12. TOWN STORE RECEIPT (10:15 PM)
     * ----------------------------------------------------------------- */
    getStoreReceipt() {
        if (this.cache.receipt) return this.cache.receipt;
        const { canvas, ctx } = this.createCanvas(360, 520);

        ctx.fillStyle = '#f8f6ec';
        ctx.fillRect(0, 0, 360, 520);

        ctx.fillStyle = '#1c1b18';
        ctx.font = 'bold 16px "Special Elite", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CRESTVIEW GENERAL GOODS', 180, 45);
        ctx.fillText('24-HOUR EMERGENCY SUPPLY', 180, 68);
        ctx.fillText('-----------------------------------', 180, 88);

        ctx.textAlign = 'left';
        ctx.font = '14px "Special Elite", monospace';
        ctx.fillText('DATE: OCT 23, 2011', 35, 120);
        ctx.fillText('TIME: 10:15 PM', 35, 145);
        ctx.fillText('CASHIER: D. VANCE (#04)', 35, 170);
        ctx.fillText('-----------------------------------', 35, 195);

        ctx.fillText('1x Reinforced Deadbolt      $18.50', 35, 230);
        ctx.fillText('2x Kerosene Fuel (2L)       $14.00', 35, 260);
        ctx.fillText('1x Emergency Lantern Wicks   $ 4.50', 35, 290);
        ctx.fillText('-----------------------------------', 35, 320);
        ctx.fillText('TOTAL DUE:                  $37.00', 35, 355);
        ctx.fillText('CASH TENDERED:              $50.00', 35, 385);
        ctx.fillText('CHANGE:                     $13.00', 35, 415);

        ctx.font = 'italic 13px "Special Elite", monospace';
        ctx.fillText('CLERK NOTE: Customer in extreme hurry.', 35, 470);

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.receipt = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 13. REALISTIC SURVEILLANCE NIGHT PHOTOGRAPH (FIGURE BY GATE)
     * ----------------------------------------------------------------- */
    getSurveillancePhoto() {
        if (this.cache.surveillancePhoto) return this.cache.surveillancePhoto;
        const { canvas, ctx } = this.createCanvas(600, 450);

        // Dark grainy monochrome night background
        ctx.fillStyle = '#111317';
        ctx.fillRect(0, 0, 600, 450);

        // Film grain noise
        for (let i = 0; i < 6000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#242a34' : '#0a0c0e';
            ctx.fillRect(Math.random() * 600, Math.random() * 450, 2, 2);
        }

        // Distant streetlamp glow casting soft cone of light
        const lampGrad = ctx.createRadialGradient(380, 80, 20, 380, 260, 220);
        lampGrad.addColorStop(0, 'rgba(230, 220, 190, 0.45)');
        lampGrad.addColorStop(0.5, 'rgba(150, 140, 120, 0.18)');
        lampGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = lampGrad;
        ctx.beginPath();
        ctx.arc(380, 260, 220, 0, Math.PI * 2);
        ctx.fill();

        // Wrought-iron gate bars in foreground (slightly blurred telephoto depth of field)
        ctx.fillStyle = 'rgba(15, 17, 22, 0.85)';
        for (let gx = 40; gx < 280; gx += 35) {
            ctx.fillRect(gx, 100, 8, 350);
            // Spear top
            ctx.beginPath();
            ctx.moveTo(gx - 4, 100); ctx.lineTo(gx + 12, 100); ctx.lineTo(gx + 4, 80);
            ctx.closePath();
            ctx.fill();
        }

        // Surveillance target: Hooded operative in dark trench coat across the road
        ctx.fillStyle = '#06070a';
        // Head / brimmed fedora or deep hood
        ctx.beginPath();
        ctx.arc(380, 180, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(380, 175, 32, 8, 0, 0, Math.PI * 2); // hat brim
        ctx.fill();
        // Body / trench coat
        ctx.beginPath();
        ctx.moveTo(350, 205);
        ctx.lineTo(410, 205);
        ctx.lineTo(430, 380);
        ctx.lineTo(330, 380);
        ctx.closePath();
        ctx.fill();

        // Hands in coat pockets
        ctx.fillRect(340, 260, 14, 50);
        ctx.fillRect(406, 260, 14, 50);

        // Telephoto crosshair watermark
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(300, 225); ctx.lineTo(460, 225);
        ctx.moveTo(380, 150); ctx.lineTo(380, 310);
        ctx.stroke();

        // Red digital surveillance timestamp
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = '#dc2626';
        ctx.fillText('CAM-02  •  OCT 23, 2011  23:00:14 HRS', 120, 420);

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.surveillancePhoto = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 14. TACTICAL INVESTIGATION MAP
     * ----------------------------------------------------------------- */
    getTownMap() {
        if (this.cache.townMap) return this.cache.townMap;
        const { canvas, ctx } = this.createCanvas(600, 600);

        ctx.fillStyle = '#dad1ba';
        ctx.fillRect(0, 0, 600, 600);

        // Map grids
        ctx.strokeStyle = '#a89c82';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 60; i < 600; i += 60) {
            ctx.moveTo(i, 30); ctx.lineTo(i, 570);
            ctx.moveTo(30, i); ctx.lineTo(570, i);
        }
        ctx.stroke();

        // Blackwood river
        ctx.strokeStyle = '#627c95';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(30, 480);
        ctx.bezierCurveTo(240, 420, 340, 240, 570, 90);
        ctx.stroke();

        // Red pin connections
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(160, 190); // Sen House
        ctx.lineTo(400, 360); // Surveillance Post
        ctx.lineTo(470, 220); // Western Rail Junction
        ctx.stroke();
        ctx.setLineDash([]);

        // Red pins & labels
        const pins = [
            { x: 160, y: 190, name: 'SEN ESTATE (Blackwood Rd)' },
            { x: 400, y: 360, name: 'SURVEILLANCE WATCHPOINT' },
            { x: 470, y: 220, name: 'NISHA DEPARTURE STATION' }
        ];

        pins.forEach(p => {
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#7f1d1d';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.font = 'bold 13px "Special Elite", cursive';
            ctx.fillStyle = '#1c150e';
            ctx.fillText(p.name, p.x - 30, p.y - 16);
        });

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.townMap = tex;
        return tex;
    }

    /* -----------------------------------------------------------------
     * 15. CONFIDENTIAL PLAYER DOSSIER (GROUND FLOOR)
     * ----------------------------------------------------------------- */
    getPlayerDossier() {
        if (this.cache.dossier) return this.cache.dossier;
        const { canvas, ctx } = this.createCanvas(600, 600);

        // Manila folder
        ctx.fillStyle = '#cca977';
        ctx.fillRect(0, 0, 600, 600);

        // Top tab
        ctx.fillStyle = '#bfa068';
        ctx.fillRect(360, 0, 200, 45);

        // Red stamped "CONFIDENTIAL"
        ctx.save();
        ctx.translate(300, 140);
        ctx.rotate(-0.16);
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 5;
        ctx.strokeRect(-180, -40, 360, 80);
        ctx.font = 'bold 36px "Cinzel", serif';
        ctx.fillStyle = '#b91c1c';
        ctx.textAlign = 'center';
        ctx.fillText('CONFIDENTIAL', 0, 14);
        ctx.restore();

        // Typed dossier text
        ctx.font = 'bold 20px "Special Elite", monospace';
        ctx.fillStyle = '#221a10';
        ctx.textAlign = 'left';
        ctx.fillText('CASE FILE: THE INHERITOR', 50, 240);
        ctx.fillText('BLOODLINE: NISHA SEN -> GRANDCHILD', 50, 275);
        ctx.fillText('TARGET HEIRLOOM: ANCESTRAL SUN PENDANT', 50, 310);
        ctx.fillText('OBJECTIVE: COMPLETE THE INVESTIGATION', 50, 345);

        ctx.font = 'italic 16px "Special Elite", monospace';
        ctx.fillText('"When the appointed evening falls, they will walk the road.', 50, 420);
        ctx.fillText(' The talisman will resonate with the gate.', 50, 450);
        ctx.fillText(' Only Nisha\'s blood can reclaim what was hidden."', 50, 480);

        const tex = this.toTexture(canvas, 1, 1);
        this.cache.dossier = tex;
        return tex;
    }
}

window.textureGen = new TextureGenerator();
