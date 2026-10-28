/**
 * First-Person Player Controller
 * Handles WASD movement, mouse-look (PointerLock), jumping, sprinting,
 * subtle head-bobbing, collision detection, and interactable raycasting.
 */
class PlayerController {
    constructor(camera, scene, domElement) {
        this.camera = camera;
        this.scene = scene;
        this.domElement = domElement;

        // PointerLockControls instance
        this.controls = new THREE.PointerLockControls(camera, domElement);

        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = true;
        this.isSprinting = false;

        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        // Constants
        this.WALK_SPEED = 3.6;
        this.SPRINT_SPEED = 6.2;
        this.JUMP_FORCE = 6.5;
        this.GRAVITY = 18.0;
        this.PLAYER_HEIGHT = 1.7;

        // Head bobbing
        this.headBobTimer = 0;
        this.bobFrequency = 9;
        this.bobAmplitude = 0.04;

        // Footstep timing
        this.footstepTimer = 0;
        this.footstepInterval = 0.48;

        // Collision & Raycasting
        this.collisionBoxes = [];
        this.interactables = [];
        this.currentInteractable = null;
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 3.2;

        // UI references
        this.crosshair = document.getElementById('crosshair');
        this.interactPrompt = document.getElementById('interact-prompt');
        this.clickPrompt = document.getElementById('click-to-control-prompt');

        // Movement enabled flag
        this.enabled = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const onKeyDown = (event) => {
            if (!this.enabled) return;

            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.moveForward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.moveBackward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.moveLeft = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.moveRight = true;
                    break;
                case 'Space':
                    if (this.canJump) {
                        this.velocity.y += this.JUMP_FORCE;
                        this.canJump = false;
                    }
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.isSprinting = true;
                    break;
                case 'KeyE':
                    if (this.currentInteractable && typeof this.currentInteractable.onInteract === 'function') {
                        this.currentInteractable.onInteract();
                    }
                    break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.moveForward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.moveBackward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.moveLeft = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.moveRight = false;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.isSprinting = false;
                    break;
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // Click anywhere to engage PointerLock during gameplay
        document.addEventListener('click', (e) => {
            if (!this.enabled) return;
            if (this.controls.isLocked) return;

            // Don't lock if clicking on modals, inspect cards, pause menu or buttons
            if (window.notebookUI && window.notebookUI.isOpen) return;
            if (window.gameState && window.gameState.inspectModal && window.gameState.inspectModal.classList.contains('active')) return;
            const pauseMenu = document.getElementById('pause-menu');
            if (pauseMenu && pauseMenu.classList.contains('active')) return;
            if (e.target.closest('button, .hud-btn, .inv-slot, #notebook-modal, #inspect-modal, #pause-menu, select, input')) return;

            this.controls.lock();
        });

        // PointerLock state changes
        document.addEventListener('pointerlockchange', () => {
            if (this.clickPrompt) {
                if (document.pointerLockElement === document.body) {
                    this.clickPrompt.classList.add('hidden');
                } else if (this.enabled) {
                    const isModalOpen = (window.notebookUI && window.notebookUI.isOpen) ||
                        (window.gameState && window.gameState.inspectModal && window.gameState.inspectModal.classList.contains('active')) ||
                        (document.getElementById('pause-menu') && document.getElementById('pause-menu').classList.contains('active'));
                    if (!isModalOpen) {
                        this.clickPrompt.classList.remove('hidden');
                    }
                }
            }
        });
    }

    addCollisionBox(box) {
        this.collisionBoxes.push(box);
    }

    removeCollisionBox(box) {
        const index = this.collisionBoxes.indexOf(box);
        if (index !== -1) {
            this.collisionBoxes.splice(index, 1);
        }
    }

    registerInteractable(mesh, title, onInteract) {
        mesh.userData.interactable = true;
        mesh.userData.title = title;
        mesh.userData.onInteract = onInteract;
        this.interactables.push(mesh);
    }

    checkCollision(newPosition) {
        const playerRadius = 0.35; // Tuned for smooth navigation through doors and around furniture
        const playerMinY = newPosition.y - this.PLAYER_HEIGHT;
        const playerMaxY = newPosition.y + 0.1;

        for (let i = 0; i < this.collisionBoxes.length; i++) {
            const box = this.collisionBoxes[i];
            // Check Y overlap
            if (playerMaxY >= box.min.y && playerMinY <= box.max.y) {
                // Check circle-AABB in XZ
                const closestX = Math.max(box.min.x, Math.min(newPosition.x, box.max.x));
                const closestZ = Math.max(box.min.z, Math.min(newPosition.z, box.max.z));
                const distX = newPosition.x - closestX;
                const distZ = newPosition.z - closestZ;
                const distSq = distX * distX + distZ * distZ;

                if (distSq < playerRadius * playerRadius) {
                    return true;
                }
            }
        }
        return false;
    }

    update(delta) {
        if (!this.enabled) {
            this.updateInteractionRaycast();
            return;
        }

        const currentSpeed = this.isSprinting ? this.SPRINT_SPEED : this.WALK_SPEED;

        // Damping
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= this.GRAVITY * delta;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        if (this.moveForward || this.moveBackward) {
            this.velocity.z -= this.direction.z * currentSpeed * 10.0 * delta;
        }
        if (this.moveLeft || this.moveRight) {
            this.velocity.x -= this.direction.x * currentSpeed * 10.0 * delta;
        }

        // Potential new X and Z movements
        const prevPos = this.controls.getObject().position.clone();

        // Move right/left
        this.controls.moveRight(-this.velocity.x * delta);
        if (this.checkCollision(this.controls.getObject().position)) {
            this.controls.getObject().position.x = prevPos.x;
            this.controls.getObject().position.z = prevPos.z;
            this.velocity.x = 0;
        }

        const midPos = this.controls.getObject().position.clone();
        // Move forward/back
        this.controls.moveForward(-this.velocity.z * delta);
        if (this.checkCollision(this.controls.getObject().position)) {
            this.controls.getObject().position.x = midPos.x;
            this.controls.getObject().position.z = midPos.z;
            this.velocity.z = 0;
        }

        // Vertical movement / Floor detection
        this.controls.getObject().position.y += this.velocity.y * delta;

        // Ground floor minimum or stair adjustment
        let targetFloorY = 1.7; // default floor height
        const currentPos = this.controls.getObject().position;

        // Floor height logic based on stairs or current zone
        if (window.gameHouse && window.gameHouse.getFloorHeightAt) {
            targetFloorY = window.gameHouse.getFloorHeightAt(currentPos.x, currentPos.z);
        }

        const distAboveFloor = currentPos.y - targetFloorY;
        // Step-snapping: if standing/grounded and within 0.55m of descending slope/step, smoothly snap to floor
        if (distAboveFloor <= 0 || (this.canJump && distAboveFloor < 0.55 && this.velocity.y <= 0)) {
            this.velocity.y = 0;
            this.controls.getObject().position.y = targetFloorY;
            this.canJump = true;
        }

        // Head bobbing & footsteps
        const horizontalSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
        if (horizontalSpeed > 0.3 && this.canJump) {
            this.headBobTimer += delta * (this.isSprinting ? this.bobFrequency * 1.4 : this.bobFrequency);
            const bobOffset = Math.sin(this.headBobTimer) * this.bobAmplitude;
            this.camera.position.y = targetFloorY + bobOffset;

            // Footsteps
            this.footstepTimer += delta * (this.isSprinting ? 1.4 : 1.0);
            if (this.footstepTimer >= this.footstepInterval) {
                this.footstepTimer = 0;
                let surface = 'wood';
                if (currentPos.z > 15) surface = 'gravel';
                else if (targetFloorY < 0) surface = 'stone';
                if (window.soundEngine) window.soundEngine.playFootstep(surface);
            }
        } else {
            this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetFloorY, delta * 8);
        }

        this.updateInteractionRaycast();
    }

    updateInteractionRaycast() {
        // Cast ray from center of screen
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactables, true);

        if (intersects.length > 0) {
            let hit = intersects[0].object;
            // Traverse up to find object with userData.interactable
            while (hit && !hit.userData.interactable && hit.parent && hit.parent !== this.scene) {
                hit = hit.parent;
            }

            if (hit && hit.userData.interactable) {
                this.currentInteractable = hit.userData;
                if (this.crosshair) this.crosshair.classList.add('interactable');
                if (this.interactPrompt) {
                    this.interactPrompt.textContent = `[E] Examine ${hit.userData.title || 'Object'}`;
                    this.interactPrompt.classList.add('visible');
                }
                return;
            }
        }

        // Nothing interactable under crosshair
        this.currentInteractable = null;
        if (this.crosshair) this.crosshair.classList.remove('interactable');
        if (this.interactPrompt) this.interactPrompt.classList.remove('visible');
    }
}

window.PlayerController = PlayerController;
