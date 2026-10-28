// Headless sanity test for the game's mathematical and story configurations
const fs = require('fs');
const vm = require('vm');

const context = {
    window: {},
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: (id) => clearTimeout(id),
    document: {
        addEventListener: () => {},
        getElementById: () => null,
        createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} } }),
        body: { appendChild: () => {} }
    },
    THREE: {
        MathUtils: {
            lerp: (x, y, t) => x + (y - x) * t
        },
        Vector3: class { constructor(x, y, z) { this.x = x; this.y = y; this.z = z; } },
        Box3: class {
            constructor(min, max) { this.min = min; this.max = max; }
            setFromObject(mesh) { return this; }
        },
        Color: class { constructor() {} setHex() {} },
        FogExp2: class { constructor() {} },
        Scene: class { add() {} },
        AmbientLight: class { constructor() {} },
        DirectionalLight: class { constructor() { this.position = { set: () => {} }; this.shadow = { mapSize: {} }; this.color = { setHex: () => {} }; } },
        HemisphereLight: class { constructor() { this.color = { setHex: () => {} }; this.groundColor = { setHex: () => {} }; } },
        PointLight: class { constructor() { this.position = { set: () => {} }; } }
    }
};
context.window = context;
vm.createContext(context);

// 1. Test story_config.js
const storyCode = fs.readFileSync('static/js/story_config.js', 'utf8');
vm.runInContext(storyCode, context);

if (!context.STORY_CONFIG) throw new Error("STORY_CONFIG not exported!");
if (!Array.isArray(context.STORY_CONFIG.finalSecretParagraphs)) throw new Error("finalSecretParagraphs missing!");
if (context.STORY_CONFIG.finalSecretParagraphs.length < 5) throw new Error("finalSecretParagraphs incomplete!");
if (!Array.isArray(context.STORY_CONFIG.morningSequence)) throw new Error("morningSequence missing!");
if (!context.STORY_CONFIG.doors.frontDoorEarly) throw new Error("frontDoorEarly missing!");
if (!context.STORY_CONFIG.doors.frontDoorLate) throw new Error("frontDoorLate missing!");
console.log("PASS: STORY_CONFIG validated successfully. " + context.STORY_CONFIG.finalSecretParagraphs.length + " final secret paragraphs.");

// 2. Test getFloorHeightAt simulation from house_builder.js
const hbCode = fs.readFileSync('static/js/house_builder.js', 'utf8');

context.THREE.Mesh = class {
    constructor() {
        this.position = { set: () => {}, x: 0, y: 0, z: 0 };
        this.rotation = { set: () => {}, x: 0, y: 0, z: 0 };
    }
};

context.THREE = new Proxy(context.THREE, {
    get: (target, prop) => prop in target ? target[prop] : class {}
});

// Mock pc and tg
context.mockPc = { addCollisionBox: () => {}, removeCollisionBox: () => {}, registerInteractable: () => {} };
context.mockTg = new Proxy({}, {
    get: () => () => ({})
});
context.window.textureGen = context.mockTg;

vm.runInContext(hbCode, context);
const builder = new context.HouseBuilder(new context.THREE.Scene(), context.mockPc);
builder.tg = context.mockTg;

// Test 1: First floor default
const hGround = builder.getFloorHeightAt(0, 0);
if (Math.abs(hGround - 1.7) > 0.01) throw new Error(`Expected first floor height 1.7, got ${hGround}`);

// Test 2: Approaching staircase bottom
const hBottom = builder.getFloorHeightAt(-3.8, -10.5);
if (Math.abs(hBottom - 1.7) > 0.01) throw new Error(`Expected bottom approach 1.7, got ${hBottom}`);

// Test 3: Walking UP main stairs
const hStep0 = builder.getFloorHeightAt(-3.8, -10.8);
const hStepMid = builder.getFloorHeightAt(-3.8, -12.9);
const hStepTop = builder.getFloorHeightAt(-3.8, -15.0);
const hLanding = builder.getFloorHeightAt(-3.8, -15.5);

console.log(`Main Stairs Ascent: z=-10.8 -> ${hStep0.toFixed(2)}m, z=-12.9 -> ${hStepMid.toFixed(2)}m, z=-15.0 -> ${hStepTop.toFixed(2)}m, landing z=-15.5 -> ${hLanding.toFixed(2)}m`);

if (hStep0 < 1.69 || hStep0 > 1.75) throw new Error(`Step bottom error: ${hStep0}`);
if (Math.abs(hStepMid - 3.8) > 0.15) throw new Error(`Step mid error: ${hStepMid}`);
if (Math.abs(hStepTop - 5.9) > 0.01) throw new Error(`Step top error: ${hStepTop}`);
if (Math.abs(hLanding - 5.9) > 0.01) throw new Error(`Landing error: ${hLanding}`);

// Test 4: Walking DOWN main stairs
context.window.gameState = { currentFloor: 'second_floor' };
context.window.playerController = { camera: { position: { y: 5.9 } } };
const hDownLanding = builder.getFloorHeightAt(-3.8, -15.4);
const hDownStep1 = builder.getFloorHeightAt(-3.8, -14.8);
const hDownStepMid = builder.getFloorHeightAt(-3.8, -12.9);

// When player reaches bottom exit, their camera position has descended with the ramp
context.window.playerController.camera.position.y = 1.7;
const hDownStepExit = builder.getFloorHeightAt(-3.8, -10.7);

console.log(`Main Stairs Descent: landing z=-15.4 -> ${hDownLanding.toFixed(2)}m, top step z=-14.8 -> ${hDownStep1.toFixed(2)}m, mid z=-12.9 -> ${hDownStepMid.toFixed(2)}m, exit z=-10.7 -> ${hDownStepExit.toFixed(2)}m`);

if (Math.abs(hDownLanding - 5.9) > 0.01) throw new Error(`Descent landing error: ${hDownLanding}`);
if (hDownStep1 >= 5.9 || hDownStep1 < 5.6) throw new Error(`Descent step 1 error: ${hDownStep1}`);
if (Math.abs(hDownStepMid - 3.8) > 0.15) throw new Error(`Descent mid error: ${hDownStepMid}`);
if (Math.abs(hDownStepExit - 1.7) > 0.01) throw new Error(`Descent exit error: ${hDownStepExit}`);

// Test 5: Cellar stairs
context.window.gameState = { groundFloorUnlocked: true, currentFloor: 'ground_floor' };
const hCellarTop = builder.getFloorHeightAt(4.0, -15.8);
const hCellarMid = builder.getFloorHeightAt(4.0, -13.9);
const hCellarBottom = builder.getFloorHeightAt(4.0, -12.0);
const hVaultFloor = builder.getFloorHeightAt(4.0, -8.0);

console.log(`Cellar Stairs: top z=-15.8 -> ${hCellarTop.toFixed(2)}m, mid z=-13.9 -> ${hCellarMid.toFixed(2)}m, bottom z=-12.0 -> ${hCellarBottom.toFixed(2)}m, vault floor -> ${hVaultFloor.toFixed(2)}m`);

if (Math.abs(hCellarTop - 1.7) > 0.01) throw new Error(`Cellar top error: ${hCellarTop}`);
if (Math.abs(hCellarMid - (-0.55)) > 0.15) throw new Error(`Cellar mid error: ${hCellarMid}`);
if (Math.abs(hCellarBottom - (-2.8)) > 0.01) throw new Error(`Cellar bottom error: ${hCellarBottom}`);
if (Math.abs(hVaultFloor - (-2.8)) > 0.01) throw new Error(`Vault floor error: ${hVaultFloor}`);

console.log("ALL MATHEMATICAL AND GEOMETRIC INVARIANTS PASS PERFECTLY!");

// 3. Test game_state.js Evidence Board Connection Logic
const gsCode = fs.readFileSync('static/js/game_state.js', 'utf8');
vm.runInContext(gsCode, context);
const gs = context.window.gameState;

// Test connection 1: Missing Family (Hypothesis A)
const c1 = gs.tryConnectEvidence('clue_photo', 'clue_diary');
if (!c1.success || c1.unlockedDeduction !== 'missing_family') throw new Error("Connection 1 failed");

// Test connection 2: Broken Timeline (Hypothesis B)
const c2 = gs.tryConnectEvidence('clue_receipt', 'clue_clock');
if (!c2.success || c2.unlockedDeduction !== 'broken_timeline') throw new Error("Connection 2 failed");

// Test connection 3: Sealed Room Code (Hypothesis C)
const c3 = gs.tryConnectEvidence('clue_painting', 'clue_desk_note');
if (!c3.success || c3.unlockedDeduction !== 'sealed_room') throw new Error("Connection 3 failed");

// Test connection 4: Last Night Surveillance (Hypothesis D)
const c4 = gs.tryConnectEvidence('clue_surveillance', 'clue_map');
if (!c4.success || c4.unlockedDeduction !== 'last_night') throw new Error("Connection 4 failed");

// Test connection 5: Pendant & Lineage (Hypothesis E)
const c5 = gs.tryConnectEvidence('clue_nisha_portrait', 'clue_family_record');
if (!c5.success || c5.unlockedDeduction !== 'pendant_lineage') throw new Error("Connection 5 failed");

// Test connection 6: Final Truth (Final Revelation)
const c6 = gs.tryConnectEvidence('clue_player_dossier', 'clue_final_archive');
if (!c6.success || c6.unlockedDeduction !== 'final_truth') throw new Error("Connection 6 failed");

const unlockedDeds = gs.getUnlockedDeductionsList();
if (unlockedDeds.length !== 6 || !unlockedDeds.every((v, i) => v === i + 1)) {
    throw new Error("Unlocked deductions mismatch: " + JSON.stringify(unlockedDeds));
}
console.log("PASS: ALL 6 EVIDENCE BOARD CONNECTIONS & HYPOTHESES VERIFIED PERFECTLY!");
