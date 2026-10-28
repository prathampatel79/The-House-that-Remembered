/**
 * House Builder & Level Architecture
 * Constructs the 3-floor estate, exterior dusk path, atmospheric lighting,
 * collision bounds, and interactable investigation objects.
 */
class HouseBuilder {
    constructor(scene, playerController) {
        this.scene = scene;
        this.pc = playerController;
        this.tg = window.textureGen;

        // Interactive object references
        this.groundDoorMesh = null;
        this.sealedDoorMesh = null;
        this.sealedDoorBox = null;
        this.sealedDoorOpen = false;
        this.exteriorDoorMesh = null;

        this.buildAll();
    }

    buildAll() {
        this.createMaterials();
        this.buildExterior();
        this.buildFirstFloor();
        this.buildSecondFloor();
        this.buildGroundFloor();
        this.setupLighting();
    }

    createMaterials() {
        this.matWoodFloor = new THREE.MeshStandardMaterial({
            map: this.tg.getWoodFloor(),
            roughness: 0.8,
            metalness: 0.1
        });

        this.matWallpaper = new THREE.MeshStandardMaterial({
            map: this.tg.getWallpaper(),
            roughness: 0.85
        });

        this.matPlaster = new THREE.MeshStandardMaterial({
            map: this.tg.getPlaster(),
            roughness: 0.9
        });

        this.matStoneCellar = new THREE.MeshStandardMaterial({
            map: this.tg.getStoneCellar(),
            roughness: 0.95,
            metalness: 0.05
        });

        this.matDarkWood = new THREE.MeshStandardMaterial({
            color: 0x221812,
            roughness: 0.7
        });

        this.matBrass = new THREE.MeshStandardMaterial({
            color: 0xc8963e,
            roughness: 0.4,
            metalness: 0.8
        });

        this.matGlass = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.35,
            roughness: 0.1,
            transmission: 0.9
        });
    }

    // Helper for walls with collision
    addWall(x, y, z, width, height, depth, material = this.matWallpaper) {
        const geom = new THREE.BoxGeometry(width, height, depth);
        const mesh = new THREE.Mesh(geom, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        // Add collision box
        const box = new THREE.Box3().setFromObject(mesh);
        this.pc.addCollisionBox(box);
        return mesh;
    }

    // Helper for floors
    addFloor(x, y, z, width, depth, material = this.matWoodFloor) {
        const geom = new THREE.PlaneGeometry(width, depth);
        const mesh = new THREE.Mesh(geom, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, y, z);
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        return mesh;
    }

    // Helper for ceilings
    addCeiling(x, y, z, width, depth) {
        const geom = new THREE.PlaneGeometry(width, depth);
        const mesh = new THREE.Mesh(geom, this.matPlaster);
        mesh.rotation.x = Math.PI / 2;
        mesh.position.set(x, y, z);
        this.scene.add(mesh);
        return mesh;
    }

    /* -------------------------------------------------------------
     * 1. EXTERIOR DUSK PATH & HOUSE FACADE
     * ------------------------------------------------------------- */
    buildExterior() {
        // Road surface
        const roadGeom = new THREE.PlaneGeometry(12, 40);
        const roadMat = new THREE.MeshStandardMaterial({
            map: this.tg.getExteriorRoad(),
            roughness: 0.95
        });
        const roadMesh = new THREE.Mesh(roadGeom, roadMat);
        roadMesh.rotation.x = -Math.PI / 2;
        roadMesh.position.set(0, 0, 32);
        this.scene.add(roadMesh);

        // Dark road verges / grass
        const vergeGeom = new THREE.PlaneGeometry(50, 40);
        const vergeMat = new THREE.MeshStandardMaterial({ color: 0x090b0d, roughness: 1.0 });
        const vergeMesh = new THREE.Mesh(vergeGeom, vergeMat);
        vergeMesh.rotation.x = -Math.PI / 2;
        vergeMesh.position.set(0, -0.05, 32);
        this.scene.add(vergeMesh);

        // Road fences
        this.addWall(-6, 0.8, 32, 0.3, 1.6, 38, this.matDarkWood);
        this.addWall(6, 0.8, 32, 0.3, 1.6, 38, this.matDarkWood);

        // Roadside Evening Trees (Trunks & Dark Autumn Foliage)
        [-8.5, 8.5].forEach(tx => {
            [38, 30, 22].forEach(tz => {
                // Trunk
                const trunkGeom = new THREE.CylinderGeometry(0.3, 0.45, 4.5, 8);
                const trunk = new THREE.Mesh(trunkGeom, this.matDarkWood);
                trunk.position.set(tx, 2.2, tz);
                this.scene.add(trunk);
                this.pc.addCollisionBox(new THREE.Box3().setFromObject(trunk));

                // Foliage canopy
                const foliageGeom = new THREE.DodecahedronGeometry(2.2, 1);
                const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1c221b, roughness: 0.95 });
                const foliage = new THREE.Mesh(foliageGeom, foliageMat);
                foliage.position.set(tx, 5.0, tz);
                this.scene.add(foliage);
            });
        });

        // Vintage Street Lampposts (Evening Glow)
        [-5.2, 5.2].forEach((lx, idx) => {
            const postGeom = new THREE.CylinderGeometry(0.08, 0.12, 4.2, 8);
            const post = new THREE.Mesh(postGeom, this.matDarkWood);
            post.position.set(lx, 2.1, 28 - idx * 10);
            this.scene.add(post);

            const lampGeom = new THREE.SphereGeometry(0.25, 8, 8);
            const lampMat = new THREE.MeshBasicMaterial({ color: 0xffd180 });
            const lampMesh = new THREE.Mesh(lampGeom, lampMat);
            lampMesh.position.set(lx, 4.2, 28 - idx * 10);
            this.scene.add(lampMesh);

            const streetLight = new THREE.PointLight(0xffaa44, 1.2, 14, 2);
            streetLight.position.set(lx, 4.1, 28 - idx * 10);
            this.scene.add(streetLight);
        });

        // Exterior Wrought Iron Gate (Z = 16)
        const gatePostL = this.addWall(-2.2, 1.2, 16, 0.4, 2.4, 0.4, this.matStoneCellar);
        const gatePostR = this.addWall(2.2, 1.2, 16, 0.4, 2.4, 0.4, this.matStoneCellar);

        // Left and right fence towards house
        this.addWall(-8, 1.0, 16, 11.6, 2.0, 0.3, this.matDarkWood);
        this.addWall(8, 1.0, 16, 11.6, 2.0, 0.3, this.matDarkWood);

        // Interactive Gate: ajar
        const gateGeom = new THREE.BoxGeometry(1.8, 2.0, 0.1);
        const gateMat = new THREE.MeshStandardMaterial({ color: 0x1f2329, metalness: 0.7, roughness: 0.5 });
        const gateMesh = new THREE.Mesh(gateGeom, gateMat);
        gateMesh.position.set(-1.0, 1.0, 15.6);
        gateMesh.rotation.y = 0.5; // open
        this.scene.add(gateMesh);

        this.pc.registerInteractable(gateMesh, "Creaky Wrought-Iron Gate", () => {
            if (window.soundEngine) window.soundEngine.playCreak(0.4);
            window.gameState.showToast("The gate is slightly ajar. You heard a muffled thud from inside.");
            window.gameState.setObjective("Approach the entrance of the abandoned house.", "Curiosity");
        });

        // House Exterior Front Porch (Z = 8 to 16)
        const porchFloor = this.addFloor(0, 0.05, 12, 10, 8, this.matStoneCellar);

        // Front Entrance Door & Wall (Z = 8)
        this.addWall(-5.5, 2.0, 8, 7, 4.0, 0.4, this.matWallpaper);
        this.addWall(5.5, 2.0, 8, 7, 4.0, 0.4, this.matWallpaper);
        this.addWall(0, 3.2, 8, 4, 1.6, 0.4, this.matWallpaper);

        // Carved symbol right beside the entrance door
        const symbolGeom = new THREE.PlaneGeometry(0.8, 0.8);
        const symbolMat = new THREE.MeshBasicMaterial({ map: this.tg.getCarvedSymbol() });
        const symbolMesh = new THREE.Mesh(symbolGeom, symbolMat);
        symbolMesh.position.set(1.5, 1.7, 8.22);
        this.scene.add(symbolMesh);

        this.pc.registerInteractable(symbolMesh, "Carved Wall Symbol", () => {
            if (window.soundEngine) window.soundEngine.playClueDiscovered();
            window.gameState.openInspection('clue_photo'); // Shows inspect view with pendant matching
            window.gameState.showToast("The carved symbol matches your heirloom silver pendant exactly!");
            window.gameState.setObjective("Enter through the front door.", "The Match");
        });

        // Interactive Front Door
        const doorGeom = new THREE.BoxGeometry(2.4, 2.8, 0.2);
        this.exteriorDoorMesh = new THREE.Mesh(doorGeom, this.matDarkWood);
        this.exteriorDoorMesh.position.set(0, 1.4, 8);
        this.scene.add(this.exteriorDoorMesh);

        // Permanent solid collision box locking the entrance shut from all sides
        this.frontDoorCollisionBox = new THREE.Box3(
            new THREE.Vector3(-1.3, 0, 7.7),
            new THREE.Vector3(1.3, 3.5, 8.3)
        );
        this.pc.addCollisionBox(this.frontDoorCollisionBox);

        this.pc.registerInteractable(this.exteriorDoorMesh, "Heavy Front Door", () => {
            if (window.gameDirector && window.gameDirector.phase === 'opening_road') {
                window.gameDirector.triggerDoorSlamSequence();
            } else if (window.gameDirector && window.gameDirector.phase === 'morning_after') {
                const morningMsg = (window.STORY_CONFIG && window.STORY_CONFIG.doors && window.STORY_CONFIG.doors.frontDoorMorning) ||
                    "The front door is sealed shut. The house has surrendered its memories.";
                window.gameState.showToast(morningMsg);
            } else {
                if (window.soundEngine) window.soundEngine.playLatchClick();
                const isLateInvestigation = (window.gameState && window.gameState.solvedDeductions && window.gameState.solvedDeductions.size >= 2);
                let lockMsg = (window.STORY_CONFIG && window.STORY_CONFIG.doors && window.STORY_CONFIG.doors.frontDoorEarly) || "It's locked.";
                if (isLateInvestigation && window.STORY_CONFIG && window.STORY_CONFIG.doors && window.STORY_CONFIG.doors.frontDoorLate) {
                    lockMsg = window.STORY_CONFIG.doors.frontDoorLate;
                }
                window.gameState.showToast(lockMsg);
            }
        });
    }

    /* -------------------------------------------------------------
     * 2. FIRST FLOOR INTERIOR
     * ------------------------------------------------------------- */
    buildFirstFloor() {
        const floorY = 0;
        const ceilingY = 3.8;

        // Main floor
        this.addFloor(0, floorY, -4, 20, 24, this.matWoodFloor);

        // Ceilings (Leaving open stairwell opening at X: [-5.6, -2.0], Z: [-16, -10.8])
        // East ceiling: X: [-2, 10], Z: [-16, 8]
        this.addCeiling(4, ceilingY, -4, 12, 24);
        // West front/middle ceiling: X: [-10, -2], Z: [-10.8, 8]
        this.addCeiling(-6, ceilingY, -1.4, 8, 18.8);
        // West far-west ceiling behind library: X: [-10, -5.6], Z: [-16, -10.8]
        this.addCeiling(-7.8, ceilingY, -13.4, 4.4, 5.2);

        // Outer boundaries (Z = 8 to -16, X = -10 to 10)
        this.addWall(-10, 1.9, -4, 0.4, 3.8, 24); // West wall
        this.addWall(10, 1.9, -4, 0.4, 3.8, 24);  // East wall
        this.addWall(0, 1.9, -16, 20, 3.8, 0.4);  // North rear wall

        // Interior Hallway Dividing Walls (Hallway X: -2 to 2, Z: 8 to -12)
        // West Hallway Wall (with doorways to Bedroom & Library)
        this.addWall(-2, 1.9, 6, 0.3, 3.8, 4);
        this.addWall(-2, 1.9, -1, 0.3, 3.8, 6);
        this.addWall(-2, 1.9, -9, 0.3, 3.8, 6);

        // East Hallway Wall (with doorways to Study & Living Room)
        this.addWall(2, 1.9, 6, 0.3, 3.8, 4);
        this.addWall(2, 1.9, -1, 0.3, 3.8, 6);
        this.addWall(2, 1.9, -9, 0.3, 3.8, 6);

        // Room Partitions
        this.addWall(-6, 1.9, -4, 8, 3.8, 0.3); // Divides Bedroom & Library
        this.addWall(6, 1.9, -4, 8, 3.8, 0.3);  // Divides Study & Living Room

        // ----------------- STARTING BEDROOM (X: -8 to -2, Z: 4 to -4) -----------------
        // Bed
        this.createBed(-6, 0, 1);
        // Bedside table & table lamp
        this.createTableWithLamp(-3.5, 0, 3);
        // Wardrobe
        this.addWall(-8.5, 1.3, -2, 1.2, 2.6, 2.2, this.matDarkWood);

        // ----------------- CENTRAL HALLWAY (Mystery 2 Clue: Broken Clock) -----------------
        this.createGrandfatherClock(1.7, 0, -3);

        // ----------------- STUDY ROOM (X: 2 to 8, Z: 4 to -4) -----------------
        // Desk with Store Receipt
        this.createDesk(5.5, 0, 1);
        // Packed Suitcase on floor (Mystery 1 Clue 4)
        this.createSuitcase(4.0, 0, 2.5);

        // ----------------- LIVING ROOM (X: 2 to 8, Z: -4 to -12) -----------------
        // Fireplace
        this.createFireplace(9.5, 0, -8);
        // Coffee table with Diary and Newspaper
        this.createLivingRoomCoffeeTable(5.5, 0, -8);
        // Framed Family Portrait on north wall of living room
        this.createFamilyPortrait(5.5, 2.2, -4.18);

        // ----------------- LIBRARY / READING ROOM (X: -8 to -2, Z: -4 to -12) -----------------
        // Bookshelves
        this.createBookshelf(-9.5, 0, -8);
        // Small table with Tape Recorder (Mystery 2 Clue 8)
        this.createTapeRecorderTable(-5.5, 0, -8);

        // ----------------- STAIRCASE UP TO SECOND FLOOR (X: -5.4 to -2.2, Z: -10.8 to -15.8) -----------------
        this.createStaircase(-3.8, 0, -10.8, 4.2);

        // ----------------- GROUND FLOOR CELLAR DOOR (Locked) (X: 2 to 6, Z: -15.8) -----------------
        this.createGroundFloorDoor(4.0, 0, -15.8);
    }

    /* -------------------------------------------------------------
     * 3. SECOND FLOOR INTERIOR (Y = 4.2 to 7.8)
     * ------------------------------------------------------------- */
    buildSecondFloor() {
        const floorY = 4.2;
        const ceilingY = 7.8;

        // Second floor floors (leaving open stairwell hole at X: [-5.6, -2.0], Z: [-15.0, -10.8])
        // East floor: X: [-2, 10], Z: [-16, 8]
        this.addFloor(4, floorY, -4, 12, 24, this.matWoodFloor);
        // West front/middle floor: X: [-10, -2], Z: [-10.8, 8]
        this.addFloor(-6, floorY, -1.4, 8, 18.8, this.matWoodFloor);
        // West far-west floor: X: [-10, -5.6], Z: [-16, -10.8]
        this.addFloor(-7.8, floorY, -13.4, 4.4, 5.2, this.matWoodFloor);
        // Top staircase landing floor at second floor level: X: [-5.6, -1.8], Z: [-16, -15.0]
        this.addFloor(-3.7, floorY, -15.5, 3.8, 1.0, this.matWoodFloor);

        // Entire second floor ceiling (full coverage above second floor at Y = 7.8)
        this.addCeiling(0, ceilingY, -4, 20, 24);

        // Exterior boundaries
        this.addWall(-10, 6.0, -4, 0.4, 3.6, 24);
        this.addWall(10, 6.0, -4, 0.4, 3.6, 24);
        this.addWall(0, 6.0, 8, 20, 3.6, 0.4);
        this.addWall(0, 6.0, -16, 20, 3.6, 0.4);

        // Corridor walls with doorways at Z = 2.0 (width 2.4, Y: 4.2 to 7.8)
        // West corridor wall (doorway to Master Bedroom at Z = 2.0)
        this.addWall(-2, 6.0, 5.6, 0.3, 3.6, 4.8);
        this.addWall(-2, 6.0, -3.6, 0.3, 3.6, 8.8);
        this.addWall(-2, 7.5, 2.0, 0.3, 0.6, 2.4);

        // East corridor wall (doorway to Sealed Room at Z = 2.0)
        this.addWall(2, 6.0, 5.6, 0.3, 3.6, 4.8);
        this.addWall(2, 6.0, -3.6, 0.3, 3.6, 8.8);
        this.addWall(2, 7.5, 2.0, 0.3, 0.6, 2.4);

        // Master Bedroom (X: -8 to -2, Z: 6 to -2, Y: 4.2)
        this.createMasterBedroom(-5.5, floorY, 2);

        // Sealed Room / Mystery 3 Keypad Door (X: 2 to 8, Z: 6 to -2, Y: 4.2)
        this.createSealedRoom(5.5, floorY, 2);

        // Archive Hallway with Painting (Mystery 3 Clue) & Nisha Portrait (Mystery 5 Clue)
        this.createSecondFloorArchiveDecor(floorY);
    }

    /* -------------------------------------------------------------
     * 4. GROUND FLOOR / SUBTERRANEAN ARCHIVE (Y = -4.5 to -1.0)
     * ------------------------------------------------------------- */
    buildGroundFloor() {
        const floorY = -4.5;
        const ceilingY = -0.5;

        // Heavy stone floor and vaulted ceiling
        this.addFloor(4, floorY, -12, 12, 14, this.matStoneCellar);
        this.addCeiling(4, ceilingY, -12, 12, 14);

        // Stone boundary walls
        this.addWall(-2, -2.5, -12, 0.5, 4.0, 14, this.matStoneCellar);
        this.addWall(10, -2.5, -12, 0.5, 4.0, 14, this.matStoneCellar);
        this.addWall(4, -2.5, -5, 12, 4.0, 0.5, this.matStoneCellar);
        this.addWall(4, -2.5, -19, 12, 4.0, 0.5, this.matStoneCellar);

        // Central Stone Archive Table with Player Dossier (Mystery 6)
        this.createArchiveTable(4, floorY, -12);

        // Investigation Wall with red string pinboard
        this.createInvestigationWall(4, floorY + 2.0, -18.7);
    }

    /* -------------------------------------------------------------
     * 5. PROP FACTORY HELPERS & INTERACTABLES
     * ------------------------------------------------------------- */
    createBed(x, y, z) {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 3.2), this.matDarkWood);
        frame.position.set(x, y + 0.25, z);
        this.scene.add(frame);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(frame));

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 3.0), new THREE.MeshStandardMaterial({ color: 0x47494f, roughness: 0.9 }));
        mattress.position.set(x, y + 0.65, z);
        this.scene.add(mattress);
    }

    createTableWithLamp(x, y, z) {
        const table = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 1.0), this.matDarkWood);
        table.position.set(x, y + 0.45, z);
        this.scene.add(table);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(table));

        // Vintage Table Lamp
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.5, 8), this.matBrass);
        base.position.set(x, y + 1.15, z);
        this.scene.add(base);

        const shade = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.35, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xc49b4d, roughness: 0.6 }));
        shade.position.set(x, y + 1.45, z);
        this.scene.add(shade);

        // Warm localized point light
        const light = new THREE.PointLight(0xffb84d, 1.2, 8, 2);
        light.position.set(x, y + 1.4, z);
        this.scene.add(light);
    }

    createGrandfatherClock(x, y, z) {
        // Wooden casing
        const clockCase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.6, 0.7), this.matDarkWood);
        clockCase.position.set(x, y + 1.3, z);
        this.scene.add(clockCase);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(clockCase));

        // Face
        const faceGeom = new THREE.PlaneGeometry(0.6, 0.6);
        const faceMat = new THREE.MeshBasicMaterial({ map: this.tg.getClockFace() });
        const faceMesh = new THREE.Mesh(faceGeom, faceMat);
        faceMesh.position.set(x - 0.41, y + 2.0, z);
        faceMesh.rotation.y = -Math.PI / 2;
        this.scene.add(faceMesh);

        this.pc.registerInteractable(clockCase, "Broken Grandfather Clock", () => {
            window.gameState.discoverClue('clue_clock');
            window.gameState.openInspection('clue_clock');
            if (window.soundEngine) window.soundEngine.playClockTick();
        });
    }

    createDesk(x, y, z) {
        const desk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.4), this.matDarkWood);
        desk.position.set(x, y + 0.45, z);
        this.scene.add(desk);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(desk));

        // Receipt on desk (Mystery 2 Clue)
        const receiptGeom = new THREE.PlaneGeometry(0.35, 0.5);
        const receiptMat = new THREE.MeshBasicMaterial({ map: this.tg.getStoreReceipt() });
        const receiptMesh = new THREE.Mesh(receiptGeom, receiptMat);
        receiptMesh.position.set(x, y + 0.92, z);
        receiptMesh.rotation.x = -Math.PI / 2;
        this.scene.add(receiptMesh);

        this.pc.registerInteractable(receiptMesh, "Crestview Store Receipt", () => {
            window.gameState.discoverClue('clue_receipt');
            window.gameState.openInspection('clue_receipt');
        });
    }

    createSuitcase(x, y, z) {
        const suitcase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.6), new THREE.MeshStandardMaterial({ color: 0x4a2a18, roughness: 0.7 }));
        suitcase.position.set(x, y + 0.22, z);
        suitcase.rotation.y = 0.35;
        this.scene.add(suitcase);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(suitcase));

        this.pc.registerInteractable(suitcase, "Half-Packed Suitcase", () => {
            window.gameState.discoverClue('clue_suitcase');
            window.gameState.openInspection('clue_suitcase');
        });
    }

    createFireplace(x, y, z) {
        const mantle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 2.4), this.matStoneCellar);
        mantle.position.set(x, y + 0.9, z);
        this.scene.add(mantle);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(mantle));

        // Embers glow
        const fireLight = new THREE.PointLight(0xff5511, 0.8, 6, 2);
        fireLight.position.set(x - 0.3, y + 0.4, z);
        this.scene.add(fireLight);
    }

    createLivingRoomCoffeeTable(x, y, z) {
        const table = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 1.2), this.matDarkWood);
        table.position.set(x, y + 0.3, z);
        this.scene.add(table);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(table));

        // Family Diary (Mystery 1 Clue 2)
        const diaryGeom = new THREE.BoxGeometry(0.4, 0.06, 0.5);
        const diaryMesh = new THREE.Mesh(diaryGeom, new THREE.MeshStandardMaterial({ color: 0x5a1818, roughness: 0.8 }));
        diaryMesh.position.set(x - 0.4, y + 0.63, z);
        this.scene.add(diaryMesh);

        this.pc.registerInteractable(diaryMesh, "Family Diary (Meera Sen)", () => {
            window.gameState.discoverClue('clue_diary');
            window.gameState.discoverClue('clue_diary_late');
            window.gameState.openInspection('clue_diary');
        });

        // The Providence Gazette Newspaper (Mystery 1 Clue 3)
        const newsGeom = new THREE.PlaneGeometry(0.5, 0.4);
        const newsMat = new THREE.MeshBasicMaterial({ map: this.tg.getNewspaper() });
        const newsMesh = new THREE.Mesh(newsGeom, newsMat);
        newsMesh.position.set(x + 0.4, y + 0.62, z);
        newsMesh.rotation.x = -Math.PI / 2;
        this.scene.add(newsMesh);

        this.pc.registerInteractable(newsMesh, "Providence Gazette Newspaper", () => {
            window.gameState.discoverClue('clue_newspaper');
            window.gameState.openInspection('clue_newspaper');
        });
    }

    createFamilyPortrait(x, y, z) {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.08), this.matBrass);
        frame.position.set(x, y, z);
        this.scene.add(frame);

        const photoGeom = new THREE.PlaneGeometry(1.4, 1.0);
        const photoMat = new THREE.MeshBasicMaterial({ map: this.tg.getFamilyPhoto() });
        const photoMesh = new THREE.Mesh(photoGeom, photoMat);
        photoMesh.position.set(x, y, z - 0.05);
        photoMesh.rotation.y = Math.PI;
        this.scene.add(photoMesh);

        this.pc.registerInteractable(photoMesh, "Framed Family Portrait (2011)", () => {
            window.gameState.discoverClue('clue_photo');
            window.gameState.openInspection('clue_photo');
        });
    }

    createBookshelf(x, y, z) {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.2, 2.6), this.matDarkWood);
        shelf.position.set(x, y + 1.6, z);
        this.scene.add(shelf);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(shelf));
    }

    createTapeRecorderTable(x, y, z) {
        const table = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.0), this.matDarkWood);
        table.position.set(x, y + 0.4, z);
        this.scene.add(table);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(table));

        // Dictaphone player
        const tapeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.3), new THREE.MeshStandardMaterial({ color: 0x22262d, metalness: 0.6 }));
        tapeMesh.position.set(x, y + 0.85, z);
        this.scene.add(tapeMesh);

        this.pc.registerInteractable(tapeMesh, "Dictaphone Audio Cassette (11:15 PM)", () => {
            window.gameState.discoverClue('clue_recording');
            window.gameState.showToast("Playing cassette audio recording...");
            if (window.soundEngine) {
                window.soundEngine.playTapeRecording(() => {
                    window.gameState.openInspection('clue_recording');
                });
            }
        });
    }

    createStaircase(x, y, z, height) {
        // x = -3.8, y = 0, z = -10.8, height = 4.2
        const steps = 16;
        const totalDepth = 4.2; // Runs from z = -10.8 to z = -15.0
        const stepH = height / steps;
        const stepD = totalDepth / steps;
        const stepW = 2.6; // X from -5.1 to -2.5

        // Visual wooden steps (NO individual collision boxes - continuous floor ramp handles height!)
        for (let i = 0; i < steps; i++) {
            const stepGeom = new THREE.BoxGeometry(stepW, stepH, stepD + 0.03);
            const step = new THREE.Mesh(stepGeom, this.matWoodFloor);
            const stepZ = z - (i + 0.5) * stepD;
            const stepY = y + (i + 0.5) * stepH;
            step.position.set(x, stepY, stepZ);
            step.receiveShadow = true;
            this.scene.add(step);
        }

        // Top landing at second floor level (Z: [-15.8, -15.0], X: [-5.4, -2.0])
        const landingGeom = new THREE.BoxGeometry(3.6, 0.4, 0.9);
        const landingMesh = new THREE.Mesh(landingGeom, this.matWoodFloor);
        landingMesh.position.set(-3.7, height - 0.2, -15.45);
        this.scene.add(landingMesh);

        // West side enclosing wall along the staircase (X = -5.3, Z = -10.8 to -15.8)
        this.addWall(-5.3, 2.1, -13.4, 0.3, 4.2, 5.2, this.matWallpaper);
        this.addWall(-5.3, 6.0, -13.4, 0.3, 3.6, 5.2, this.matWallpaper);

        // East side wooden balustrade / handrail along staircase (First floor: X = -2.5, Z = -10.8 to -15.0)
        const railMat = this.matDarkWood;
        const lowerRailing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 4.2), railMat);
        lowerRailing.position.set(-2.5, 2.6, -12.9);
        lowerRailing.rotation.x = -Math.atan2(height, totalDepth);
        this.scene.add(lowerRailing);

        // East handrail collision box on first floor so player stays on the staircase
        const lowerRailBox = new THREE.Box3(
            new THREE.Vector3(-2.6, 0, -15.0),
            new THREE.Vector3(-2.3, 4.5, -10.8)
        );
        this.pc.addCollisionBox(lowerRailBox);

        // Second floor safety guardrails around the open stairwell hole
        // Guardrail along East edge of hole at second floor (X = -2.5, Z: [-15.0, -10.8], Y: 4.2 to 5.2)
        const upperRailEast = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 4.2), railMat);
        upperRailEast.position.set(-2.5, 4.7, -12.9);
        this.scene.add(upperRailEast);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(upperRailEast));

        // Guardrail along South edge of hole at second floor (Z = -10.8, X: [-5.3, -2.5], Y: 4.2 to 5.2)
        const upperRailSouth = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.0, 0.12), railMat);
        upperRailSouth.position.set(-3.9, 4.7, -10.8);
        this.scene.add(upperRailSouth);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(upperRailSouth));
    }

    createGroundFloorDoor(x, y, z) {
        // Heavy reinforced cellar door at X = 4.0, Y = 0, Z = -15.8
        const doorGeom = new THREE.BoxGeometry(2.4, 3.2, 0.2);
        this.groundDoorMesh = new THREE.Mesh(doorGeom, new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.8, metalness: 0.3 }));
        this.groundDoorMesh.position.set(x, y + 1.6, z);
        this.scene.add(this.groundDoorMesh);

        // Solid collision box blocking access until unlocked
        this.cellarDoorBox = new THREE.Box3(
            new THREE.Vector3(x - 1.3, 0, z - 0.25),
            new THREE.Vector3(x + 1.3, 3.4, z + 0.25)
        );
        this.pc.addCollisionBox(this.cellarDoorBox);

        // Stone cellar staircase descending behind the door from Z = -15.8 (Y = 0) down to Z = -12.0 (Y = -4.5)
        const cellarSteps = 16;
        const cellarHeight = 4.5;
        const cellarDepth = 3.8;
        const cStepH = cellarHeight / cellarSteps;
        const cStepD = cellarDepth / cellarSteps;
        const cStepW = 2.4;

        for (let i = 0; i < cellarSteps; i++) {
            const stepGeom = new THREE.BoxGeometry(cStepW, cStepH, cStepD + 0.03);
            const stepMesh = new THREE.Mesh(stepGeom, this.matStoneCellar);
            // Steps descend from z = -15.8 forward to z = -12.0
            const stepZ = -15.8 + (i + 0.5) * cStepD;
            const stepY = 0 - (i + 0.5) * cStepH;
            stepMesh.position.set(x, stepY, stepZ);
            this.scene.add(stepMesh);
        }

        // Side stone corridor walls enclosing the cellar descent (X = 2.7 and X = 5.3)
        this.addWall(2.7, -2.25, -13.9, 0.3, 4.6, 4.0, this.matStoneCellar);
        this.addWall(5.3, -2.25, -13.9, 0.3, 4.6, 4.0, this.matStoneCellar);

        this.pc.registerInteractable(this.groundDoorMesh, "Reinforced Cellar Door", () => {
            if (window.gameState.hasItem('ground_floor_key') || (window.gameState && window.gameState.groundFloorUnlocked)) {
                if (!window.gameState.groundFloorUnlocked) {
                    if (window.soundEngine) window.soundEngine.playDoorOpen();
                    // Swing door open cleanly
                    this.groundDoorMesh.rotation.y = -Math.PI / 2;
                    this.groundDoorMesh.position.set(x - 1.1, y + 1.6, z + 1.0);
                    // Remove collision obstacle dynamically
                    this.pc.removeCollisionBox(this.cellarDoorBox);

                    window.gameState.groundFloorUnlocked = true;
                    window.gameState.currentFloor = 'ground_floor';

                    const unlockedMsg = (window.STORY_CONFIG && window.STORY_CONFIG.doors && window.STORY_CONFIG.doors.cellarUnlocked) ||
                        "The antique brass key turns smoothly. The cellar door swings open.";
                    window.gameState.showToast(unlockedMsg);

                    if (window.STORY_CONFIG && window.STORY_CONFIG.objectives && window.STORY_CONFIG.objectives.descendArchive) {
                        window.gameState.setObjective(
                            window.STORY_CONFIG.objectives.descendArchive.text,
                            window.STORY_CONFIG.objectives.descendArchive.title
                        );
                    }
                } else {
                    window.gameState.showToast("The cellar door is unlocked. Stone stairs lead down into the vault.");
                }
            } else {
                if (window.soundEngine) window.soundEngine.playLatchClick();
                const lockMsg = (window.STORY_CONFIG && window.STORY_CONFIG.doors && window.STORY_CONFIG.doors.cellarLocked) ||
                    "Locked with heavy antique brass fittings. The keyhole bears an ornate sun and pendant seal.";
                window.gameState.showToast(lockMsg);
            }
        });
    }

    openSealedDoor() {
        if (this.sealedDoorOpen) return;
        this.sealedDoorOpen = true;
        if (this.sealedDoorBox) {
            this.pc.removeCollisionBox(this.sealedDoorBox);
        }
        if (this.sealedDoorMesh) {
            // Swing door open cleanly against inner wall
            this.sealedDoorMesh.rotation.y = -Math.PI / 2;
            this.sealedDoorMesh.position.set(2.0, this.sealedDoorMesh.position.y, 0.9);
        }
        if (window.soundEngine) window.soundEngine.playDoorOpen();
    }

    createMasterBedroom(x, y, z) {
        // Bed
        this.createBed(x - 2, y, z);

        // Desk with Nisha Portrait (Mystery 5 Clue) & Arjun's Unsent Letter (at X = -4.0, Z = 2.0)
        const desk = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 1.2), this.matDarkWood);
        desk.position.set(x + 1.5, y + 0.45, z);
        this.scene.add(desk);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(desk));

        // 1. Portrait of young Nisha (Detailed Sepia Artwork) - Center of desk
        const nishaFrame = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.05), this.matBrass);
        nishaFrame.position.set(x + 1.5, y + 1.2, z);
        nishaFrame.rotation.y = -Math.PI / 4;
        this.scene.add(nishaFrame);

        const nishaPhotoMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.48, 0.68),
            new THREE.MeshBasicMaterial({ map: this.tg.getNishaPhoto() })
        );
        nishaPhotoMesh.position.set(x + 1.48, y + 1.2, z + 0.02);
        nishaPhotoMesh.rotation.y = -Math.PI / 4;
        this.scene.add(nishaPhotoMesh);

        this.pc.registerInteractable(nishaFrame, "Sepia Portrait of Young Nisha Sen (1985)", () => {
            window.gameState.discoverClue('clue_nisha_portrait');
            window.gameState.discoverClue('clue_family_record');
            window.gameState.discoverClue('clue_arjun_letter');
            window.gameState.openInspection('clue_nisha_portrait');
        });

        // 2. Sen Family Genealogy Register - Left side of desk
        const genealogyMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.04, 0.35),
            new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.8 })
        );
        genealogyMesh.position.set(x + 0.95, y + 0.92, z);
        this.scene.add(genealogyMesh);

        this.pc.registerInteractable(genealogyMesh, "Sen Family Genealogy Register", () => {
            window.gameState.discoverClue('clue_family_record');
            window.gameState.openInspection('clue_family_record');
        });

        // 3. Arjun's Unsent Letter to Nisha - Right side of desk
        const letterMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.32, 0.42),
            new THREE.MeshBasicMaterial({ map: this.tg.getArjunLetter() })
        );
        letterMesh.position.set(x + 2.05, y + 0.91, z);
        letterMesh.rotation.x = -Math.PI / 2;
        letterMesh.rotation.z = 0.2;
        this.scene.add(letterMesh);

        this.pc.registerInteractable(letterMesh, "Arjun's Unsent Letter to Nisha", () => {
            window.gameState.discoverClue('clue_arjun_letter');
            window.gameState.openInspection('clue_arjun_letter');
        });
    }

    createSealedRoom(x, y, z) {
        // Sealed Door with 4-Digit Hydraulic Tumbler (Mystery 3) at X = 2.0, Z = z (2.0)
        const doorGeom = new THREE.BoxGeometry(0.25, 3.2, 2.2);
        this.sealedDoorMesh = new THREE.Mesh(doorGeom, new THREE.MeshStandardMaterial({ color: 0x242830, metalness: 0.6, roughness: 0.4 }));
        this.sealedDoorMesh.position.set(2.0, y + 1.6, z);
        this.scene.add(this.sealedDoorMesh);

        this.sealedDoorBox = new THREE.Box3(
            new THREE.Vector3(1.8, y, z - 1.2),
            new THREE.Vector3(2.2, y + 3.4, z + 1.2)
        );
        this.pc.addCollisionBox(this.sealedDoorBox);

        this.pc.registerInteractable(this.sealedDoorMesh, "Hydraulic Sealed Chamber Door", () => {
            if (window.gameState.solvedDeductions.has(3)) {
                this.openSealedDoor();
                window.gameState.showToast("The hydraulic seals are disengaged. The chamber is open.");
            } else {
                window.gameState.discoverClue('clue_sealed_door');
                window.notebookUI.open();
                window.notebookUI.switchTab('deductions');
            }
        });

        // If already solved, open immediately
        if (window.gameState && window.gameState.solvedDeductions && window.gameState.solvedDeductions.has(3)) {
            this.openSealedDoor();
        }

        // Inside the Hidden Chamber: Investigation Evidence
        // 1. Tactical Investigation Map on North Wall (Mystery 4 Clue)
        const mapGeom = new THREE.PlaneGeometry(1.6, 1.4);
        const mapMat = new THREE.MeshBasicMaterial({ map: this.tg.getTownMap() });
        const mapMesh = new THREE.Mesh(mapGeom, mapMat);
        mapMesh.position.set(5.5, y + 2.0, z - 2.8);
        this.scene.add(mapMesh);

        this.pc.registerInteractable(mapMesh, "Tactical Investigation Map", () => {
            window.gameState.discoverClue('clue_map');
            window.gameState.discoverClue('clue_surveillance');
            window.gameState.discoverClue('clue_statement');
            window.gameState.discoverClue('clue_torn_letter');
            window.gameState.openInspection('clue_map');
        });

        // 2. 35mm Night Surveillance Photograph pinned on wall beside map
        const photoGeom = new THREE.PlaneGeometry(0.9, 0.7);
        const photoMat = new THREE.MeshBasicMaterial({ map: this.tg.getSurveillancePhoto() });
        const photoMesh = new THREE.Mesh(photoGeom, photoMat);
        photoMesh.position.set(3.8, y + 2.0, z - 2.8);
        this.scene.add(photoMesh);

        this.pc.registerInteractable(photoMesh, "35mm Night Surveillance Photograph", () => {
            window.gameState.discoverClue('clue_surveillance');
            window.gameState.openInspection('clue_surveillance');
        });

        // Investigation desk in hidden room
        const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 1.2), this.matDarkWood);
        desk.position.set(5.5, y + 0.45, z + 0.5);
        this.scene.add(desk);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(desk));

        // Moody tungsten desk lamp
        const deskLamp = new THREE.PointLight(0xffeedd, 0.9, 8, 2);
        deskLamp.position.set(5.5, y + 1.4, z + 0.5);
        this.scene.add(deskLamp);

        // 3. Torn Extortion Letter on left of desk
        const tornGeom = new THREE.PlaneGeometry(0.35, 0.35);
        const tornMat = new THREE.MeshBasicMaterial({ map: this.tg.getTornLetter() });
        const tornMesh = new THREE.Mesh(tornGeom, tornMat);
        tornMesh.position.set(4.9, y + 0.91, z + 0.5);
        tornMesh.rotation.x = -Math.PI / 2;
        tornMesh.rotation.z = -0.15;
        this.scene.add(tornMesh);

        this.pc.registerInteractable(tornMesh, "Torn Extortion Letter", () => {
            window.gameState.discoverClue('clue_torn_letter');
            window.gameState.openInspection('clue_torn_letter');
        });

        // 4. Witness Statement Draft on right of desk
        const stmtGeom = new THREE.PlaneGeometry(0.35, 0.45);
        const stmtMat = new THREE.MeshBasicMaterial({ map: this.tg.getWitnessStatement() });
        const stmtMesh = new THREE.Mesh(stmtGeom, stmtMat);
        stmtMesh.position.set(6.1, y + 0.91, z + 0.5);
        stmtMesh.rotation.x = -Math.PI / 2;
        stmtMesh.rotation.z = 0.1;
        this.scene.add(stmtMesh);

        this.pc.registerInteractable(stmtMesh, "Witness Statement Draft", () => {
            window.gameState.discoverClue('clue_statement');
            window.gameState.openInspection('clue_statement');
        });
    }

    createSecondFloorArchiveDecor(floorY) {
        // 1. Symbolic Oil Painting on west wall at X = -1.84, Z = -2.0 (Mystery 3 Clue)
        const paintGeom = new THREE.PlaneGeometry(2.0, 1.2);
        const paintMat = new THREE.MeshBasicMaterial({ map: this.tg.getCarvedSymbol() });
        const paintMesh = new THREE.Mesh(paintGeom, paintMat);
        paintMesh.position.set(-1.84, floorY + 2.0, -2);
        paintMesh.rotation.y = Math.PI / 2;
        this.scene.add(paintMesh);

        this.pc.registerInteractable(paintMesh, "Symbolic Oil Painting (Sun -> Eye -> Key -> Hourglass)", () => {
            window.gameState.discoverClue('clue_painting');
            window.gameState.discoverClue('clue_desk_note');
            window.gameState.openInspection('clue_painting');
        });

        // 2. Cipher Translation Memo on stand in archive corridor (Mystery 3 Clue)
        const memoStand = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.85, 0.6), this.matDarkWood);
        memoStand.position.set(-1.6, floorY + 0.42, -0.4);
        this.scene.add(memoStand);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(memoStand));

        const memoGeom = new THREE.PlaneGeometry(0.35, 0.45);
        const memoMat = new THREE.MeshBasicMaterial({ map: this.tg.getCipherMemo() });
        const memoMesh = new THREE.Mesh(memoGeom, memoMat);
        memoMesh.position.set(-1.6, floorY + 0.87, -0.4);
        memoMesh.rotation.x = -Math.PI / 2;
        memoMesh.rotation.z = Math.PI / 2;
        this.scene.add(memoMesh);

        this.pc.registerInteractable(memoMesh, "Cipher Translation Memo (Arjun's Notes)", () => {
            window.gameState.discoverClue('clue_desk_note');
            window.gameState.openInspection('clue_desk_note');
        });
    }

    createArchiveTable(x, y, z) {
        // Central Stone Archive Table in Subterranean Vault (x = 4, y = -4.5, z = -12)
        const table = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 1.8), this.matStoneCellar);
        table.position.set(x, y + 0.45, z);
        this.scene.add(table);
        this.pc.addCollisionBox(new THREE.Box3().setFromObject(table));

        // The Master Lineage Testament & Bloodline Chronicle (The Final Clue of the Game!)
        const chronicleGeom = new THREE.BoxGeometry(0.7, 0.08, 0.55);
        const chronicleMat = new THREE.MeshStandardMaterial({ color: 0x4a1818, roughness: 0.6 });
        const chronicleMesh = new THREE.Mesh(chronicleGeom, chronicleMat);
        chronicleMesh.position.set(x, y + 0.94, z);
        this.scene.add(chronicleMesh);

        // Ornate brass medallion seal on chronicle matching player's pendant
        const sealGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16);
        const sealMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
        const sealMesh = new THREE.Mesh(sealGeom, sealMat);
        sealMesh.position.set(x, y + 0.99, z);
        this.scene.add(sealMesh);

        // Register interactable for the Master Testament
        this.pc.registerInteractable(chronicleMesh, "The Sen Lineage Testament (Final Clue)", () => {
            window.gameState.discoverClue('clue_player_dossier');
            window.gameState.discoverClue('clue_final_archive');
            window.gameState.finalClueFound = true;

            // Open full document inspection with custom revelation trigger
            window.gameState.openInspection('clue_player_dossier', () => {
                if (window.gameDirector) {
                    window.gameDirector.startFinalSecretSequence();
                }
            });
        });
    }

    createInvestigationWall(x, y, z) {
        const board = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.4, 0.1), new THREE.MeshStandardMaterial({ color: 0x33261c, roughness: 0.9 }));
        board.position.set(x, y, z);
        this.scene.add(board);
    }

    /* -------------------------------------------------------------
     * 6. LIGHTING & ENVIRONMENT
     * ------------------------------------------------------------- */
    setupLighting() {
        // Evening Ambient Light (ensures road, trees, house, and rooms are comfortably visible)
        this.ambientLight = new THREE.AmbientLight(0x283244, 0.75);
        this.scene.add(this.ambientLight);

        // Low-angle setting sun / evening dusk light
        this.duskSun = new THREE.DirectionalLight(0xf6ad55, 1.25);
        this.duskSun.position.set(-25, 16, 40);
        this.duskSun.castShadow = true;
        this.duskSun.shadow.mapSize.width = 1024;
        this.duskSun.shadow.mapSize.height = 1024;
        this.scene.add(this.duskSun);

        // Soft sky twilight fill from zenith
        this.hemiLight = new THREE.HemisphereLight(0x4a5568, 0x1a202c, 0.6);
        this.scene.add(this.hemiLight);

        // First floor tungsten bulb (Hallway)
        this.hallBulb = new THREE.PointLight(0xffb84d, 1.2, 12, 2);
        this.hallBulb.position.set(0, 3.4, -3);
        this.scene.add(this.hallBulb);

        // Living room warm bulb
        this.livingBulb = new THREE.PointLight(0xffa033, 1.1, 10, 2);
        this.livingBulb.position.set(5.5, 3.4, -8);
        this.scene.add(this.livingBulb);

        // Second floor corridor bulb
        this.secondBulb = new THREE.PointLight(0xffc266, 1.1, 10, 2);
        this.secondBulb.position.set(0, 7.4, 0);
        this.scene.add(this.secondBulb);

        // Ground floor single hanging wire bulb
        this.cellarBulb = new THREE.PointLight(0xffaa33, 1.4, 14, 2);
        this.cellarBulb.position.set(4, -1.2, -12);
        this.scene.add(this.cellarBulb);
    }

    // Transform environment into a peaceful, sunlit morning outside the house
    transitionToMorningEnvironment() {
        // Soft morning sky and gentle clear atmosphere
        this.scene.background = new THREE.Color(0xb6d6e3);
        this.scene.fog = new THREE.FogExp2(0xcfe2eb, 0.012);

        // Soften indoor tungsten lamps
        if (this.hallBulb) this.hallBulb.intensity = 0.15;
        if (this.livingBulb) this.livingBulb.intensity = 0.15;
        if (this.secondBulb) this.secondBulb.intensity = 0.15;
        if (this.cellarBulb) this.cellarBulb.intensity = 0.15;

        // Morning sunlight (warm bright dawn light from the East)
        if (this.duskSun) {
            this.duskSun.color.setHex(0xfff6dd);
            this.duskSun.intensity = 1.6;
            this.duskSun.position.set(30, 22, 28);
        }

        if (this.ambientLight) {
            this.ambientLight.color.setHex(0xc2d4e5);
            this.ambientLight.intensity = 0.95;
        }

        if (this.hemiLight) {
            this.hemiLight.color.setHex(0xe0f2fe);
            this.hemiLight.groundColor.setHex(0x5a6955);
            this.hemiLight.intensity = 0.85;
        }

        // Close and secure front entrance firmly
        if (this.exteriorDoorMesh) {
            this.exteriorDoorMesh.position.set(0, 1.4, 8);
            this.exteriorDoorMesh.rotation.set(0, 0, 0);
        }
    }

    // Continuous floor height calculator for stairs, levels, and slopes
    getFloorHeightAt(x, z) {
        // 1. Cellar stone stairs and subterranean vault
        if (x >= 2.4 && x <= 5.6 && z <= -11.8 && z >= -16.2 && window.gameState && window.gameState.groundFloorUnlocked) {
            // Slope descending from z = -15.8 (eye height 1.7) forward to z = -12.0 (eye height -2.8)
            const t = Math.max(0, Math.min(1, (z + 15.8) / 3.8));
            return THREE.MathUtils.lerp(1.7, -2.8, t);
        }

        // Subterranean archive stone floor
        if (x >= -2 && x <= 10 && z <= -5 && z >= -19 && window.gameState && window.gameState.currentFloor === 'ground_floor') {
            return -2.8; // Cellar floor at -4.5 + eye height 1.7 = -2.8
        }

        // 2. Main staircase between First Floor (1.7) and Second Floor (5.9)
        // Ramp runs from Z = -10.8 to Z = -15.0, X: [-5.6, -2.2]
        if (x >= -5.6 && x <= -2.2 && z <= -10.8 && z >= -15.0) {
            const t = Math.max(0, Math.min(1, (-10.8 - z) / (15.0 - 10.8)));
            return 1.7 + t * 4.2; // 1.7 at bottom (z = -10.8), 5.9 at top step (z = -15.0)
        }

        // 3. Top landing of main staircase (Z: [-16.2, -15.0], X: [-5.6, -1.8])
        if (x >= -5.6 && x <= -1.8 && z < -15.0 && z >= -16.2) {
            return 5.9; // Seamless landing height
        }

        // 4. Second Floor level
        // Player is only considered upstairs if their vertical elevation is physically above 3.6m
        const isUpstairs = (window.playerController && window.playerController.camera && window.playerController.camera.position.y > 3.6);

        if (isUpstairs && z >= -16 && z <= 8 && x >= -10 && x <= 10) {
            // Make sure player is not inside the open stairwell hole
            if (!(x >= -5.6 && x <= -2.2 && z <= -10.8 && z >= -15.0)) {
                if (window.gameState) window.gameState.currentFloor = 'second_floor';
                return 5.9; // 4.2 floor + 1.7 eye height
            }
        }

        // 5. Default First Floor & Exterior
        if (window.gameState && window.gameState.currentFloor === 'second_floor') {
            window.gameState.currentFloor = 'first_floor';
        }
        return 1.7;
    }
}

window.HouseBuilder = HouseBuilder;
