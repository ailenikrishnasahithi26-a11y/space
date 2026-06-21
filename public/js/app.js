// ============ Audio System ============
class AudioManager {
    constructor() {
        this.bgMusic = document.getElementById('bgMusic');
        this.isMuted = false;
        this.volume = 0.3;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        try {
            this.bgMusic.volume = this.volume;
            this.isInitialized = true;
            console.log('🎵 Audio system initialized');
        } catch (error) {
            console.warn('Audio not available:', error);
        }
    }

    playBackgroundMusic() {
        if (this.isMuted || !this.isInitialized) return;
        try {
            this.bgMusic.currentTime = 0;
            this.bgMusic.play().catch(e => console.warn('Music playback failed:', e));
        } catch (error) {
            console.warn('Music playback error:', error);
        }
    }

    stopBackgroundMusic() {
        try {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        } catch (error) {
            console.warn('Stop music error:', error);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.bgMusic.pause();
        } else {
            this.bgMusic.play().catch(e => console.warn('Play failed:', e));
        }
        return this.isMuted;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.bgMusic.volume = this.volume;
    }
}

const audioManager = new AudioManager();

// ============ DOM Elements ============
const fuelDisplay = document.getElementById('fuel');
const fuelBar = document.getElementById('fuel-bar');
const xpDisplay = document.getElementById('xp');
const xpBar = document.getElementById('xp-bar');
const creditsDisplay = document.getElementById('credits');
const rankDisplay = document.getElementById('rank');
const planetNameDisplay = document.getElementById('planet-name');
const planetDescription = document.getElementById('planet-description');
const fuelCostDisplay = document.getElementById('fuel-cost');
const xpRewardDisplay = document.getElementById('xp-reward');
const threatLevelDisplay = document.getElementById('threat-level');
const missionList = document.getElementById('mission-list');
const travelBtn = document.getElementById('travel-btn');
const refuelBtn = document.getElementById('refuel-btn');
const musicToggle = document.getElementById('musicToggle');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const planetPreview = document.querySelector('.planet-preview');

// Exploration elements
const explorationView = document.getElementById('exploration-view');
const explorationContainer = document.getElementById('exploration-container');
const explorationTitle = document.getElementById('exploration-title');
const exitExploration = document.getElementById('exit-exploration');

// ============ State ============
let playerData = null;
let missionsData = [];
let selectedPlanet = null;
let scene, camera, renderer, controls;
let planets = [];
let starField;
let sunMesh;
let animationId;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let isFirstClick = true;
let isExplorationMode = false;
let explorationScene, explorationCamera, explorationRenderer, explorationControls;
let explorationPlanetGroup = null;
let explorationAnimationId = null;
let missionInProgress = false;
let currentMissionPlanet = null;

// ============ Planet Data ============
const PLANET_DETAILS = {
    'Mercury': {
        description: 'Closest planet to the Sun. Extremely hot during day, freezing at night.',
        baseColor: [170, 170, 180],
        specular: 0.1,
        roughness: 0.9,
        size: 0.5,
        orbitRadius: 8,
        speed: 0.015,
        funFact: 'A year on Mercury is just 88 Earth days!',
        atmosphere: 'None',
        temperature: '430°C to -180°C',
        diameter: '4,879 km',
        missionText: '🌡️ Scan the surface temperatures of Mercury!',
        type: 'mercury'
    },
    'Venus': {
        description: 'The hottest planet in the Solar System. Covered in thick toxic clouds.',
        baseColor: [220, 190, 150],
        specular: 0.3,
        roughness: 0.6,
        size: 0.7,
        orbitRadius: 12,
        speed: 0.012,
        funFact: 'Venus rotates backwards compared to most planets!',
        atmosphere: 'Thick CO₂',
        temperature: '475°C',
        diameter: '12,104 km',
        missionText: '🌋 Analyze the volcanic activity on Venus!',
        type: 'venus'
    },
    'Earth': {
        description: 'Our home planet. The only known planet with liquid water on its surface.',
        baseColor: [50, 120, 200],
        specular: 0.5,
        roughness: 0.3,
        size: 0.8,
        orbitRadius: 16,
        speed: 0.01,
        funFact: 'Earth is the only planet not named after a Greek or Roman god!',
        atmosphere: 'Nitrogen-Oxygen',
        temperature: '15°C',
        diameter: '12,742 km',
        missionText: '🌊 Study Earth\'s oceans and atmosphere!',
        type: 'earth'
    },
    'Mars': {
        description: 'The Red Planet. Has the tallest mountain in the Solar System - Olympus Mons.',
        baseColor: [200, 80, 30],
        specular: 0.2,
        roughness: 0.8,
        size: 0.6,
        orbitRadius: 20,
        speed: 0.009,
        funFact: 'Mars has the largest volcano in the solar system!',
        atmosphere: 'Thin CO₂',
        temperature: '-65°C',
        diameter: '6,779 km',
        missionText: '🔴 Search for signs of water on Mars!',
        type: 'mars'
    },
    'Jupiter': {
        description: 'The largest planet. The Great Red Spot is a storm larger than Earth.',
        baseColor: [210, 170, 110],
        specular: 0.4,
        roughness: 0.5,
        size: 1.8,
        orbitRadius: 28,
        speed: 0.006,
        funFact: 'Jupiter has at least 95 known moons!',
        atmosphere: 'Hydrogen-Helium',
        temperature: '-110°C',
        diameter: '139,820 km',
        missionText: '🌀 Study the Great Red Spot storm!',
        type: 'jupiter'
    },
    'Saturn': {
        description: 'Famous for its spectacular ring system made of ice and rock.',
        baseColor: [210, 190, 150],
        specular: 0.3,
        roughness: 0.6,
        size: 1.5,
        orbitRadius: 36,
        speed: 0.005,
        funFact: 'Saturn is so light it would float in water!',
        atmosphere: 'Hydrogen-Helium',
        temperature: '-140°C',
        diameter: '116,460 km',
        missionText: '💫 Analyze Saturn\'s beautiful ring system!',
        type: 'saturn'
    },
    'Uranus': {
        description: 'An ice giant that rotates on its side. Has a blue-green color.',
        baseColor: [130, 210, 230],
        specular: 0.3,
        roughness: 0.4,
        size: 1.2,
        orbitRadius: 44,
        speed: 0.004,
        funFact: 'Uranus orbits the Sun on its side!',
        atmosphere: 'Hydrogen-Helium',
        temperature: '-195°C',
        diameter: '50,724 km',
        missionText: '❄️ Study Uranus\' unique tilted rotation!',
        type: 'uranus'
    },
    'Neptune': {
        description: 'The windiest planet. Winds can reach 2,100 km/h! Deep blue world.',
        baseColor: [50, 100, 210],
        specular: 0.2,
        roughness: 0.4,
        size: 1.2,
        orbitRadius: 52,
        speed: 0.003,
        funFact: 'Neptune was the first planet found using math!',
        atmosphere: 'Hydrogen-Helium',
        temperature: '-200°C',
        diameter: '49,244 km',
        missionText: '🌪️ Measure the fastest winds in the solar system!',
        type: 'neptune'
    }
};

// ============ UNIQUE 3D MODEL GENERATION ============

function createUniquePlanetModel(details, isExploration = false) {
    const group = new THREE.Group();
    const type = details.type || 'rocky';
    const color = details.baseColor;
    const colorHex = new THREE.Color(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
    
    // Scale for exploration view
    const scale = isExploration ? 1 : 1;
    
    switch(type) {
        // ===== MERCURY - Cratered surface with bump map =====
        case 'mercury': {
            const geometry = new THREE.SphereGeometry(3 * scale, 64, 64);
            // Create cratered texture
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#aaaaaa';
            ctx.fillRect(0, 0, 512, 256);
            // Add craters
            for (let i = 0; i < 200; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 256;
                const radius = 2 + Math.random() * 25;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(100, 100, 110, ${0.2 + Math.random() * 0.4})`;
                ctx.fill();
                ctx.strokeStyle = `rgba(180, 180, 190, ${0.1 + Math.random() * 0.2})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            const texture = new THREE.CanvasTexture(canvas);
            
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.9,
                metalness: 0.1,
                color: colorHex,
                emissive: colorHex,
                emissiveIntensity: 0.02
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            break;
        }
        
        // ===== VENUS - Cloudy with swirling atmosphere =====
        case 'venus': {
            // Planet body
            const geometry = new THREE.SphereGeometry(3 * scale, 64, 64);
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#d4b88a';
            ctx.fillRect(0, 0, 512, 256);
            // Cloud bands
            for (let i = 0; i < 50; i++) {
                const y = Math.random() * 256;
                const bandHeight = 3 + Math.random() * 15;
                ctx.fillStyle = `rgba(200, 170, 140, ${0.2 + Math.random() * 0.4})`;
                ctx.fillRect(0, y, 512, bandHeight);
            }
            const texture = new THREE.CanvasTexture(canvas);
            
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.6,
                metalness: 0.1,
                color: colorHex,
                emissive: colorHex,
                emissiveIntensity: 0.05
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            
            // Atmosphere layer (translucent)
            const atmosGeometry = new THREE.SphereGeometry(3.15 * scale, 48, 48);
            const atmosMaterial = new THREE.MeshBasicMaterial({
                color: 0xffcc88,
                transparent: true,
                opacity: 0.15
            });
            const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
            group.add(atmosphere);
            break;
        }
        
        // ===== EARTH - With continents, clouds, and atmosphere =====
        case 'earth': {
            // Earth body
            const geometry = new THREE.SphereGeometry(3 * scale, 64, 64);
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            // Ocean
            ctx.fillStyle = '#1a4a8a';
            ctx.fillRect(0, 0, 1024, 512);
            
            // Continents
            const continents = [
                {x: 240, y: 90, w: 150, h: 110, c: [60, 170, 50]},
                {x: 200, y: 130, w: 100, h: 70, c: [50, 160, 40]},
                {x: 300, y: 280, w: 80, h: 180, c: [50, 180, 50]},
                {x: 280, y: 320, w: 56, h: 110, c: [40, 170, 40]},
                {x: 510, y: 100, w: 90, h: 64, c: [80, 180, 60]},
                {x: 530, y: 200, w: 84, h: 150, c: [90, 190, 50]},
                {x: 510, y: 240, w: 60, h: 100, c: [80, 180, 40]},
                {x: 630, y: 80, w: 200, h: 140, c: [70, 170, 50]},
                {x: 670, y: 120, w: 140, h: 100, c: [60, 160, 40]},
                {x: 770, y: 400, w: 80, h: 60, c: [140, 170, 50]},
                {x: 80, y: 460, w: 840, h: 50, c: [220, 230, 240]},
                {x: 390, y: 50, w: 64, h: 56, c: [180, 210, 180]},
            ];
            
            continents.forEach(cont => {
                const c = cont.c;
                ctx.fillStyle = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
                ctx.beginPath();
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const rx = cont.w/2 * (0.6 + Math.random() * 0.4);
                    const ry = cont.h/2 * (0.6 + Math.random() * 0.4);
                    const x = cont.x + cont.w/2 + Math.cos(angle) * rx;
                    const y = cont.y + cont.h/2 + Math.sin(angle) * ry;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
            });
            
            // Clouds
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * 1024;
                const y = Math.random() * 512;
                const radius = 20 + Math.random() * 80;
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${0.05 + Math.random() * 0.15})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Ice caps
            const northGrad = ctx.createLinearGradient(0, 0, 0, 80);
            northGrad.addColorStop(0, 'rgba(230, 240, 250, 0.7)');
            northGrad.addColorStop(1, 'rgba(230, 240, 250, 0)');
            ctx.fillStyle = northGrad;
            ctx.fillRect(0, 0, 1024, 80);
            
            const southGrad = ctx.createLinearGradient(0, 432, 0, 512);
            southGrad.addColorStop(0, 'rgba(230, 240, 250, 0)');
            southGrad.addColorStop(1, 'rgba(230, 240, 250, 0.7)');
            ctx.fillStyle = southGrad;
            ctx.fillRect(0, 432, 1024, 80);
            
            const texture = new THREE.CanvasTexture(canvas);
            
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.3,
                metalness: 0.1,
                color: 0x4488ff,
                emissive: 0x224488,
                emissiveIntensity: 0.02
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            
            // Clouds layer (separate rotating layer)
            const cloudCanvas = document.createElement('canvas');
            cloudCanvas.width = 512;
            cloudCanvas.height = 256;
            const cCtx = cloudCanvas.getContext('2d');
            cCtx.fillStyle = 'rgba(0,0,0,0)';
            cCtx.fillRect(0, 0, 512, 256);
            for (let i = 0; i < 200; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 256;
                const radius = 5 + Math.random() * 40;
                const gradient = cCtx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${0.1 + Math.random() * 0.3})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
                cCtx.fillStyle = gradient;
                cCtx.beginPath();
                cCtx.arc(x, y, radius, 0, Math.PI * 2);
                cCtx.fill();
            }
            const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
            
            const cloudGeometry = new THREE.SphereGeometry(3.05 * scale, 48, 48);
            const cloudMaterial = new THREE.MeshBasicMaterial({
                map: cloudTexture,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            });
            const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
            clouds.userData.isCloud = true;
            group.add(clouds);
            
            // Atmosphere glow
            const atmosGeometry = new THREE.SphereGeometry(3.2 * scale, 48, 48);
            const atmosMaterial = new THREE.MeshBasicMaterial({
                color: 0x4488ff,
                transparent: true,
                opacity: 0.08,
                side: THREE.BackSide
            });
            const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
            group.add(atmosphere);
            break;
        }
        
        // ===== MARS - Red with polar caps and volcano =====
        case 'mars': {
            const geometry = new THREE.SphereGeometry(3 * scale, 64, 64);
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#c1440e';
            ctx.fillRect(0, 0, 512, 256);
            // Surface variations
            for (let i = 0; i < 200; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 256;
                const radius = 5 + Math.random() * 40;
                ctx.fillStyle = `rgba(150, 50, 20, ${0.1 + Math.random() * 0.3})`;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            // Polar ice caps
            const northGrad = ctx.createLinearGradient(0, 0, 0, 50);
            northGrad.addColorStop(0, 'rgba(220, 220, 230, 0.7)');
            northGrad.addColorStop(1, 'rgba(220, 220, 230, 0)');
            ctx.fillStyle = northGrad;
            ctx.fillRect(0, 0, 512, 50);
            
            const southGrad = ctx.createLinearGradient(0, 206, 0, 256);
            southGrad.addColorStop(0, 'rgba(220, 220, 230, 0)');
            southGrad.addColorStop(1, 'rgba(220, 220, 230, 0.7)');
            ctx.fillStyle = southGrad;
            ctx.fillRect(0, 206, 512, 50);
            
            // Olympus Mons (large volcano)
            const volcGrad = ctx.createRadialGradient(350, 120, 0, 350, 120, 30);
            volcGrad.addColorStop(0, 'rgba(200, 100, 50, 0.5)');
            volcGrad.addColorStop(1, 'rgba(200, 100, 50, 0)');
            ctx.fillStyle = volcGrad;
            ctx.beginPath();
            ctx.ellipse(350, 120, 30, 20, 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            const texture = new THREE.CanvasTexture(canvas);
            
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.8,
                metalness: 0.1,
                color: colorHex,
                emissive: colorHex,
                emissiveIntensity: 0.03
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            break;
        }
        
        // ===== JUPITER - Gas giant with bands and Great Red Spot =====
        case 'jupiter': {
            const geometry = new THREE.SphereGeometry(3 * scale, 64, 64);
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#d4a06a';
            ctx.fillRect(0, 0, 512, 256);
            
            const bandColors = [
                [220, 180, 120],
                [190, 150, 90],
                [240, 200, 140],
                [170, 130, 80],
                [210, 170, 110]
            ];
            // Bands
            for (let i = 0; i < 60; i++) {
                const y = Math.random() * 256;
                const bandHeight = 2 + Math.random() * 15;
                const color = bandColors[Math.floor(Math.random() * bandColors.length)];
                ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${0.3 + Math.random() * 0.5})`;
                ctx.fillRect(0, y, 512, bandHeight);
            }
            // Great Red Spot
            const spotGrad = ctx.createRadialGradient(200, 130, 0, 200, 130, 50);
            spotGrad.addColorStop(0, 'rgba(200, 60, 40, 0.9)');
            spotGrad.addColorStop(0.5, 'rgba(180, 50, 35, 0.6)');
            spotGrad.addColorStop(1, 'rgba(160, 80, 60, 0)');
            ctx.fillStyle = spotGrad;
            ctx.beginPath();
            ctx.ellipse(200, 130, 50, 35, 0.1, 0, Math.PI * 2);
            ctx.fill();
            
            const texture = new THREE.CanvasTexture(canvas);
            
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.5,
                metalness: 0.1,
                color: colorHex,
                emissive: colorHex,
                emissiveIntensity: 0.02
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            break;
        }
        
        // ===== SATURN - With rings! =====
        case 'saturn': {
            const geometry = new THREE.SphereGeometry(3 * scale, 64, 64);
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#d4c08a';
            ctx.fillRect(0, 0, 512, 256);
            // Subtle bands
            for (let i = 0; i < 40; i++) {
                const y = Math.random() * 256;
                const bandHeight = 3 + Math.random() * 12;
                ctx.fillStyle = `rgba(200, 180, 150, ${0.1 + Math.random() * 0.3})`;
                ctx.fillRect(0, y, 512, bandHeight);
            }
            const texture = new THREE.CanvasTexture(canvas);
            
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.6,
                metalness: 0.1,
                color: colorHex,
                emissive: colorHex,
                emissiveIntensity: 0.02
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            
            // Rings!
            const ringGeo = new THREE.RingGeometry(3.8 * scale, 6.5 * scale, 64);
            // Fix UVs for ring
            const pos = ringGeo.attributes.position;
            const v3 = new THREE.Vector3();
            for (let i = 0; i < pos.count; i++) {
                v3.fromBufferAttribute(pos, i);
                const len = v3.length();
                ringGeo.attributes.uv.setXY(i, (len - 3.8) / (6.5 - 3.8), 0.5);
            }
            
            const ringCanvas = document.createElement('canvas');
            ringCanvas.width = 512;
            ringCanvas.height = 64;
            const rCtx = ringCanvas.getContext('2d');
            const grad = rCtx.createLinearGradient(0, 0, 512, 0);
            grad.addColorStop(0, 'rgba(180, 160, 130, 0)');
            grad.addColorStop(0.1, 'rgba(210, 190, 160, 0.8)');
            grad.addColorStop(0.2, 'rgba(180, 160, 130, 0.3)');
            grad.addColorStop(0.3, 'rgba(220, 200, 170, 0.9)');
            grad.addColorStop(0.4, 'rgba(190, 170, 140, 0.4)');
            grad.addColorStop(0.5, 'rgba(230, 210, 180, 0.8)');
            grad.addColorStop(0.6, 'rgba(180, 160, 130, 0.3)');
            grad.addColorStop(0.7, 'rgba(210, 190, 160, 0.7)');
            grad.addColorStop(0.8, 'rgba(190, 170, 140, 0.4)');
            grad.addColorStop(0.9, 'rgba(220, 200, 170, 0.6)');
            grad.addColorStop(1, 'rgba(180, 160, 130, 0)');
            rCtx.fillStyle = grad;
            rCtx.fillRect(0, 0, 512, 64);
            // Ring particles
            for (let i = 0; i < 2000; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 64;
                const size = 0.5 + Math.random() * 2;
                const brightness = 100 + Math.random() * 155;
                rCtx.fillStyle = `rgba(${brightness}, ${brightness-20}, ${brightness-40}, ${0.1 + Math.random() * 0.6})`;
                rCtx.fillRect(x, y, size, size);
            }
            const ringTexture = new THREE.CanvasTexture(ringCanvas);
            
            const ringMat = new THREE.MeshBasicMaterial({
                map: ringTexture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2.3;
            ring.rotation.z = 0.3;
            group.add(ring);
            break;
        }
        
        // ===== URANUS - Smooth blue-green with tilt =====
        case 'uranus': {
            const geometry = new THREE.SphereGeometry(3 * scale, 64, 64);
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#7ec8e3';
            ctx.fillRect(0, 0, 512, 256);
            // Subtle bands
            for (let i = 0; i < 30; i++) {
                const y = Math.random() * 256;
                const bandHeight = 5 + Math.random() * 15;
                ctx.fillStyle = `rgba(150, 210, 230, ${0.05 + Math.random() * 0.15})`;
                ctx.fillRect(0, y, 512, bandHeight);
            }
            const texture = new THREE.CanvasTexture(canvas);
            
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.4,
                metalness: 0.1,
                color: colorHex,
                emissive: colorHex,
                emissiveIntensity: 0.03
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            // Tilt Uranus on its side
            mesh.rotation.z = 1.71; // ~98 degrees
            group.add(mesh);
            
            // Thin ring (Uranus has rings too!)
            const ringGeo = new THREE.RingGeometry(3.5 * scale, 4.2 * scale, 48);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x88ccdd,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.3
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.z = 1.71;
            group.add(ring);
            break;
        }
        
        // ===== NEPTUNE - Deep blue with dark spot =====
        case 'neptune': {
            const geometry = new THREE.SphereGeometry(3 * scale, 64, 64);
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#3a6ec8';
            ctx.fillRect(0, 0, 512, 256);
            // Bands
            for (let i = 0; i < 35; i++) {
                const y = Math.random() * 256;
                const bandHeight = 4 + Math.random() * 15;
                ctx.fillStyle = `rgba(60, 120, 210, ${0.1 + Math.random() * 0.25})`;
                ctx.fillRect(0, y, 512, bandHeight);
            }
            // Great Dark Spot
            const darkGrad = ctx.createRadialGradient(320, 140, 0, 320, 140, 35);
            darkGrad.addColorStop(0, 'rgba(20, 40, 120, 0.5)');
            darkGrad.addColorStop(0.5, 'rgba(30, 60, 140, 0.3)');
            darkGrad.addColorStop(1, 'rgba(40, 80, 160, 0)');
            ctx.fillStyle = darkGrad;
            ctx.beginPath();
            ctx.ellipse(320, 140, 35, 25, 0.2, 0, Math.PI * 2);
            ctx.fill();
            // Bright clouds
            for (let i = 0; i < 40; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 256;
                const radius = 5 + Math.random() * 25;
                ctx.fillStyle = `rgba(150, 200, 255, ${0.02 + Math.random() * 0.05})`;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            const texture = new THREE.CanvasTexture(canvas);
            
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.4,
                metalness: 0.1,
                color: colorHex,
                emissive: colorHex,
                emissiveIntensity: 0.03
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            break;
        }
    }
    
    return group;
}

// ============ API Functions ============

async function loadPlayer() {
    try {
        const res = await fetch("/api/player");
        if (!res.ok) throw new Error('Failed to fetch player');
        playerData = await res.json();

        document.getElementById("fuel").textContent = playerData.fuel + " / 100";
        document.getElementById("xp").textContent = playerData.xp;
        document.getElementById("credits").textContent = playerData.credits;
        document.getElementById("rank").textContent = playerData.rank;

        document.getElementById("fuel-bar").style.width = playerData.fuel + "%";
        document.getElementById("xp-bar").style.width = Math.min((playerData.xp / 3000) * 100, 100) + "%";
        
        const fuelBar = document.getElementById("fuel-bar");
        if (playerData.fuel > 50) {
            fuelBar.style.background = 'linear-gradient(90deg, #00ffff, #00ff99)';
        } else if (playerData.fuel > 25) {
            fuelBar.style.background = 'linear-gradient(90deg, #ffaa00, #ff6600)';
        } else {
            fuelBar.style.background = 'linear-gradient(90deg, #ff4444, #cc0000)';
        }

        if (selectedPlanet) {
            updateTravelButton();
        }
    } catch (error) {
        console.error('Failed to load player:', error);
        showNotification('❌ Failed to connect to server', 'error');
    }
}

async function loadMissions() {
    try {
        const res = await fetch("/api/missions");
        if (!res.ok) throw new Error('Failed to fetch missions');
        missionsData = await res.json();

        const container = document.getElementById("mission-list");
        container.innerHTML = "";

        missionsData.forEach(mission => {
            const card = document.createElement("div");
            card.className = `mission-card ${mission.completed ? 'completed' : mission.unlocked ? 'available' : 'locked'}`;

            if (mission.completed) {
                card.innerHTML = `
                    <h3>✅ ${mission.title}</h3>
                    <p>📍 ${mission.location}</p>
                    <p>💰 ${mission.reward} Credits</p>
                    <p style="color: #00ff88;">✓ Completed</p>
                    <button onclick="viewPlanetFromMission('${mission.location}')" class="mission-btn" style="margin-top: 5px; background: #4488ff;">
                        🔍 View Planet
                    </button>
                `;
            } else if (mission.unlocked) {
                card.innerHTML = `
                    <h3>🚀 ${mission.title}</h3>
                    <p>📍 ${mission.location}</p>
                    <p>💰 ${mission.reward} Credits</p>
                    <button onclick="startMissionGame(${mission.id}, '${mission.location}')" class="mission-btn">
                        🎮 Start Mission
                    </button>
                `;
            } else {
                card.innerHTML = `
                    <h3>🔒 ${mission.title}</h3>
                    <p>📍 ${mission.location}</p>
                    <p style="color: #666;">Locked - Complete previous mission</p>
                `;
            }

            container.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to load missions:', error);
    }
}

async function completeMission(missionId) {
    try {
        const res = await fetch("/api/complete-mission", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ missionId })
        });

        const result = await res.json();

        if (result.success) {
            showNotification(`✅ Mission Complete! +${missionsData.find(m => m.id === missionId)?.reward} XP`, 'success');
            loadPlayer();
            loadMissions();
            
            const completedMission = missionsData.find(m => m.id === missionId);
            if (completedMission) {
                setTimeout(() => {
                    viewPlanetFromMission(completedMission.location);
                }, 1000);
            }
        } else {
            showNotification(`❌ ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Failed to complete mission:', error);
        showNotification('❌ Failed to complete mission', 'error');
    }
}

async function travelToPlanet() {
    if (!selectedPlanet) {
        showNotification('⚠️ Please select a planet first!', 'error');
        return;
    }

    const planetName = selectedPlanet.data.name;
    
    try {
        const res = await fetch("/api/travel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planetName })
        });

        const result = await res.json();

        if (result.success) {
            showNotification(`🚀 Traveled to ${planetName}! +${selectedPlanet.data.xp} XP`, 'success');
            loadPlayer();
            
            planets.forEach(p => {
                if (p.data.name === playerData?.currentLocation) {
                    p.mesh.material.emissive = new THREE.Color(0x00ffff);
                    p.mesh.material.emissiveIntensity = 0.3;
                } else {
                    p.mesh.material.emissive = new THREE.Color(0x000000);
                    p.mesh.material.emissiveIntensity = 0;
                }
            });
            
            if (selectedPlanet) {
                updatePlanetInfo(selectedPlanet);
            }
            
            openExploration(planetName, 'travel');
        } else {
            showNotification(`❌ ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Failed to travel:', error);
        showNotification('❌ Travel failed. Check server connection.', 'error');
    }
}

async function refuel() {
    try {
        const res = await fetch("/api/refuel", { method: "POST" });
        const result = await res.json();

        if (result.success) {
            showNotification('⛽ Fuel refilled to 100%!', 'success');
            loadPlayer();
        }
    } catch (error) {
        console.error('Failed to refuel:', error);
        showNotification('❌ Refuel failed.', 'error');
    }
}

// ============ Mission Game Functions ============

async function startMissionGame(missionId, planetName) {
    if (missionInProgress) {
        showNotification('⚠️ A mission is already in progress!', 'error');
        return;
    }
    
    missionInProgress = true;
    currentMissionPlanet = planetName;
    
    showNotification(`🎮 Starting mission on ${planetName}!`, 'success');
    openExploration(planetName, 'mission');
    
    const details = PLANET_DETAILS[planetName] || {};
    const missionObjective = document.createElement('div');
    missionObjective.id = 'mission-objective';
    missionObjective.style.cssText = `
        position: absolute;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.9);
        backdrop-filter: blur(15px);
        padding: 20px 30px;
        border-radius: 15px;
        border: 2px solid #ffd93d;
        color: white;
        font-family: 'Poppins', sans-serif;
        text-align: center;
        z-index: 1002;
        animation: fadeIn 0.5s ease;
        max-width: 500px;
    `;
    missionObjective.innerHTML = `
        <h3 style="color: #ffd93d;">🎯 Mission Objective</h3>
        <p style="margin: 10px 0;">${details.missionText || `Explore and study ${planetName}!`}</p>
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
            <button onclick="completeMissionGame()" style="padding: 10px 30px; background: #00ff88; color: black; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">
                ✅ Complete Mission
            </button>
            <button onclick="cancelMissionGame()" style="padding: 10px 30px; background: rgba(255,68,68,0.3); color: white; border: 1px solid #ff4444; border-radius: 10px; cursor: pointer;">
                ❌ Cancel
            </button>
        </div>
    `;
    explorationView.appendChild(missionObjective);
}

async function completeMissionGame() {
    if (!missionInProgress) return;
    
    const mission = missionsData.find(m => m.location === currentMissionPlanet && !m.completed && m.unlocked);
    
    if (mission) {
        await completeMission(mission.id);
        missionInProgress = false;
        currentMissionPlanet = null;
        
        const objective = document.getElementById('mission-objective');
        if (objective) objective.remove();
        
        showNotification(`🎉 Mission on ${mission.location} completed!`, 'success');
    } else {
        showNotification('⚠️ No active mission found for this planet.', 'error');
    }
}

function cancelMissionGame() {
    missionInProgress = false;
    currentMissionPlanet = null;
    
    const objective = document.getElementById('mission-objective');
    if (objective) objective.remove();
    
    closeExploration();
    showNotification('❌ Mission cancelled', 'info');
}

function viewPlanetFromMission(planetName) {
    openExploration(planetName, 'view');
}

// ============ UI Functions ============

function updateTravelButton() {
    if (!selectedPlanet || !playerData) {
        travelBtn.disabled = true;
        travelBtn.textContent = '🚀 Travel';
        return;
    }

    const isCurrent = playerData.currentLocation === selectedPlanet.data.name;
    const canTravel = playerData.fuel >= selectedPlanet.data.fuelCost && !isCurrent;

    travelBtn.disabled = !canTravel;
    travelBtn.textContent = isCurrent ? '📍 Current Location' : '🚀 Travel';
    travelBtn.style.opacity = canTravel ? '1' : '0.5';
}

function updatePlanetInfo(planet) {
    if (!planet) {
        planetNameDisplay.textContent = 'Select Planet';
        planetDescription.textContent = 'Click any planet in the solar system.';
        fuelCostDisplay.textContent = '-';
        xpRewardDisplay.textContent = '-';
        threatLevelDisplay.textContent = '-';
        travelBtn.disabled = true;
        travelBtn.textContent = '🚀 Travel';
        planetPreview.style.background = 'radial-gradient(circle at 30% 30%, #333, #111)';
        planetPreview.style.boxShadow = 'none';
        
        const fact = document.getElementById('fun-fact');
        if (fact) fact.remove();
        return;
    }

    selectedPlanet = planet;
    const data = planet.data;
    const details = PLANET_DETAILS[data.name] || {};

    planetNameDisplay.textContent = data.name;
    planetDescription.textContent = details.description || `${data.name} - ${data.threat} threat level`;
    fuelCostDisplay.textContent = data.fuel;
    xpRewardDisplay.textContent = data.xp;
    threatLevelDisplay.textContent = data.threat;

    const factElement = document.getElementById('fun-fact') || document.createElement('p');
    factElement.id = 'fun-fact';
    factElement.style.cssText = `
        margin-top: 10px;
        font-size: 12px;
        color: #ffd93d;
        font-style: italic;
        padding: 8px;
        background: rgba(255, 215, 0, 0.1);
        border-radius: 8px;
        border-left: 3px solid #ffd93d;
    `;
    factElement.textContent = `💡 ${details.funFact || 'Explore this fascinating world!'}`;
    
    const planetStats = document.querySelector('.planet-stats');
    if (!document.getElementById('fun-fact')) {
        planetStats.after(factElement);
    }

    const base = details.baseColor || [255, 255, 255];
    const color = `rgb(${base[0]}, ${base[1]}, ${base[2]})`;
    planetPreview.style.background = `radial-gradient(circle at 30% 30%, ${color}, rgb(${base[0]-40}, ${base[1]-40}, ${base[2]-40}))`;
    planetPreview.style.boxShadow = `0 0 35px ${color}`;

    updateTravelButton();
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 12px;
        background: ${type === 'success' ? 'rgba(0, 255, 136, 0.15)' : 
                    type === 'error' ? 'rgba(255, 68, 68, 0.15)' : 
                    'rgba(100, 100, 255, 0.15)'};
        border: 1px solid ${type === 'success' ? '#00ff88' : 
                           type === 'error' ? '#ff4444' : 
                           '#4a4aff'};
        color: #e0e0ff;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        z-index: 1000;
        backdrop-filter: blur(10px);
        animation: slideDown 0.5s ease;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        font-weight: 500;
        max-width: 80%;
        text-align: center;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideUp 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ============ Fullscreen ============

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen().catch(err => {
            console.warn('Exit fullscreen error:', err);
        });
    }
}

// ============ 3D Planet Exploration ============

function openExploration(planetName, mode = 'view') {
    const details = PLANET_DETAILS[planetName] || {};
    
    const modeText = mode === 'mission' ? '🎯 Mission' : mode === 'travel' ? '🚀 Exploring' : '🔍 Viewing';
    explorationTitle.textContent = `${modeText} ${planetName}`;
    explorationView.style.display = 'block';
    isExplorationMode = true;

    if (!explorationScene) {
        initExplorationScene();
    }

    // Remove old planet model
    if (explorationPlanetGroup) {
        explorationScene.remove(explorationPlanetGroup);
        explorationPlanetGroup = null;
    }

    // Create unique planet model
    explorationPlanetGroup = createUniquePlanetModel(details, true);
    explorationScene.add(explorationPlanetGroup);

    // Info overlay
    const infoOverlay = document.createElement('div');
    infoOverlay.className = 'planet-info-overlay';
    infoOverlay.id = 'exploration-info';
    
    let missionStatus = '';
    if (mode === 'mission') {
        missionStatus = `
            <p style="color: #ffd93d; margin-top: 10px; font-weight: 600;">
                🎯 Mission in Progress!
            </p>
        `;
    }
    
    infoOverlay.innerHTML = `
        <h3>${planetName}</h3>
        <p>${details.description || 'Exploring this fascinating world'}</p>
        <div class="planet-stats-overlay">
            <div>
                <span class="stat-label">🌡️ Temperature</span>
                <span class="stat-value">${details.temperature || 'Unknown'}</span>
            </div>
            <div>
                <span class="stat-label">📏 Diameter</span>
                <span class="stat-value">${details.diameter || 'Unknown'}</span>
            </div>
            <div>
                <span class="stat-label">🌬️ Atmosphere</span>
                <span class="stat-value">${details.atmosphere || 'Unknown'}</span>
            </div>
        </div>
        <p style="margin-top: 10px; font-size: 13px; color: #ffd93d;">💡 ${details.funFact || 'Explore the wonders of space!'}</p>
        ${missionStatus}
    `;
    
    const existingInfo = document.getElementById('exploration-info');
    if (existingInfo) existingInfo.remove();
    explorationView.appendChild(infoOverlay);

    explorationCamera.position.set(0, 2, 10);
    explorationControls.target.set(0, 0, 0);
    explorationControls.update();

    document.querySelector('.left-panel').style.opacity = '0.3';
    document.querySelector('.left-panel').style.pointerEvents = 'none';
    document.querySelector('.planet-panel').style.opacity = '0.3';
    document.querySelector('.planet-panel').style.pointerEvents = 'none';
    document.querySelector('.mission-panel').style.opacity = '0.3';
    document.querySelector('.mission-panel').style.pointerEvents = 'none';
    document.querySelector('.controls').style.opacity = '0.3';
    document.querySelector('.controls').style.pointerEvents = 'none';
}

function initExplorationScene() {
    const container = explorationContainer;
    
    explorationScene = new THREE.Scene();
    explorationScene.background = new THREE.Color(0x050816);

    const aspect = container.clientWidth / container.clientHeight;
    explorationCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    explorationCamera.position.set(0, 2, 10);

    explorationRenderer = new THREE.WebGLRenderer({ antialias: true });
    explorationRenderer.setSize(container.clientWidth, container.clientHeight);
    explorationRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    explorationRenderer.shadowMap.enabled = true;
    container.appendChild(explorationRenderer.domElement);

    explorationControls = new THREE.OrbitControls(explorationCamera, explorationRenderer.domElement);
    explorationControls.enableDamping = true;
    explorationControls.dampingFactor = 0.05;
    explorationControls.minDistance = 3;
    explorationControls.maxDistance = 25;
    explorationControls.target.set(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    explorationScene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    explorationScene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    backLight.position.set(-5, -5, -7);
    explorationScene.add(backLight);

    const rimLight = new THREE.DirectionalLight(0x00ffff, 0.2);
    rimLight.position.set(0, -5, 5);
    explorationScene.add(rimLight);

    // Starfield
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 5000; i++) {
        starVertices.push(THREE.MathUtils.randFloatSpread(200));
        starVertices.push(THREE.MathUtils.randFloatSpread(200));
        starVertices.push(THREE.MathUtils.randFloatSpread(200));
    }
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ 
        size: 0.3, 
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    explorationScene.add(stars);

    animateExploration();
}

function animateExploration() {
    if (!isExplorationMode) {
        if (explorationAnimationId) {
            cancelAnimationFrame(explorationAnimationId);
            explorationAnimationId = null;
        }
        return;
    }
    
    explorationAnimationId = requestAnimationFrame(animateExploration);

    if (explorationControls) {
        explorationControls.update();
    }

    if (explorationPlanetGroup) {
        // Rotate the planet group
        explorationPlanetGroup.rotation.y += 0.003;
        
        // Rotate clouds separately for Earth
        explorationPlanetGroup.children.forEach(child => {
            if (child.userData && child.userData.isCloud) {
                child.rotation.y += 0.005;
            }
        });
    }

    if (explorationRenderer && explorationScene && explorationCamera) {
        explorationRenderer.render(explorationScene, explorationCamera);
    }
}

function closeExploration() {
    isExplorationMode = false;
    explorationView.style.display = 'none';
    
    if (missionInProgress) {
        missionInProgress = false;
        currentMissionPlanet = null;
        const objective = document.getElementById('mission-objective');
        if (objective) objective.remove();
    }
    
    document.querySelector('.left-panel').style.opacity = '1';
    document.querySelector('.left-panel').style.pointerEvents = 'auto';
    document.querySelector('.planet-panel').style.opacity = '1';
    document.querySelector('.planet-panel').style.pointerEvents = 'auto';
    document.querySelector('.mission-panel').style.opacity = '1';
    document.querySelector('.mission-panel').style.pointerEvents = 'auto';
    document.querySelector('.controls').style.opacity = '1';
    document.querySelector('.controls').style.pointerEvents = 'auto';
    
    const info = document.getElementById('exploration-info');
    if (info) info.remove();
    
    if (explorationAnimationId) {
        cancelAnimationFrame(explorationAnimationId);
        explorationAnimationId = null;
    }
}

// ============ Three.js Solar System ============

function initSolarSystem() {
    const container = document.getElementById('solar-system');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050816);

    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 2000);
    camera.position.set(0, 20, 50);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = 10;
    controls.maxDistance = 150;
    controls.target.set(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    const sunLight = new THREE.PointLight(0xffffff, 2, 500);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5);
    fillLight.position.set(-50, 50, 50);
    scene.add(fillLight);

    createStarfield();
    createSun();
    createPlanets();

    animate();

    window.addEventListener('resize', onResize);
    window.addEventListener('click', onPlanetClick);

    travelBtn.addEventListener('click', travelToPlanet);
    refuelBtn.addEventListener('click', refuel);
    musicToggle.addEventListener('click', toggleMusic);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    exitExploration.addEventListener('click', closeExploration);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isExplorationMode) {
            closeExploration();
        }
    });

    document.addEventListener('click', () => {
        if (isFirstClick) {
            isFirstClick = false;
            audioManager.init();
            audioManager.playBackgroundMusic();
            musicToggle.textContent = '🔊';
            showNotification('🎵 Background music playing', 'info');
        }
    }, { once: true });

    loadPlayer();
    loadMissions();
}

function createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];

    for (let i = 0; i < 15000; i++) {
        starVertices.push(THREE.MathUtils.randFloatSpread(1000));
        starVertices.push(THREE.MathUtils.randFloatSpread(1000));
        starVertices.push(THREE.MathUtils.randFloatSpread(1000));
    }

    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 0.5,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });

    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

function createSun() {
    const geometry = new THREE.SphereGeometry(4, 64, 64);
    const material = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    sunMesh = new THREE.Mesh(geometry, material);
    scene.add(sunMesh);

    // Sun glow
    const glowGeometry = new THREE.SphereGeometry(4.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8800,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sunMesh.add(glow);
    
    // Outer glow
    const outerGlowGeo = new THREE.SphereGeometry(5.5, 32, 32);
    const outerGlowMat = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.05
    });
    const outerGlow = new THREE.Mesh(outerGlowGeo, outerGlowMat);
    sunMesh.add(outerGlow);
}

function createOrbit(radius) {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI);
    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0x333355,
        transparent: true,
        opacity: 0.3
    });
    const orbit = new THREE.LineLoop(geometry, material);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
}

function createPlanet(name, size, color, radius, speed, fuelCost, xpReward, threat) {
    createOrbit(radius);

    const details = PLANET_DETAILS[name] || {};
    
    // Create unique planet model for solar system
    const planetGroup = createUniquePlanetModel(details, false);
    // Scale down for solar system view
    planetGroup.scale.set(size/3, size/3, size/3);

    const angle = Math.random() * Math.PI * 2;
    planetGroup.position.x = Math.cos(angle) * radius;
    planetGroup.position.z = Math.sin(angle) * radius;

    scene.add(planetGroup);

    const planetObj = {
        group: planetGroup,
        radius,
        speed,
        angle,
        data: { name, fuel: fuelCost, xp: xpReward, threat }
    };

    planets.push(planetObj);

    return planetObj;
}

function createPlanets() {
    const planetConfigs = [
        { name: 'Mercury', size: 0.5, color: 0x999999, radius: 8, speed: 0.015, fuel: 5, xp: 50, threat: 'Low' },
        { name: 'Venus', size: 0.7, color: 0xffcc66, radius: 12, speed: 0.012, fuel: 8, xp: 75, threat: 'Medium' },
        { name: 'Earth', size: 0.8, color: 0x3399ff, radius: 16, speed: 0.01, fuel: 0, xp: 100, threat: 'Safe' },
        { name: 'Mars', size: 0.6, color: 0xff3300, radius: 20, speed: 0.009, fuel: 10, xp: 150, threat: 'Medium' },
        { name: 'Jupiter', size: 1.8, color: 0xd9a066, radius: 28, speed: 0.006, fuel: 20, xp: 250, threat: 'High' },
        { name: 'Saturn', size: 1.5, color: 0xe6c16b, radius: 36, speed: 0.005, fuel: 30, xp: 400, threat: 'High' },
        { name: 'Uranus', size: 1.2, color: 0x66ffff, radius: 44, speed: 0.004, fuel: 45, xp: 600, threat: 'Extreme' },
        { name: 'Neptune', size: 1.2, color: 0x3366cc, radius: 52, speed: 0.003, fuel: 50, xp: 700, threat: 'Extreme' }
    ];

    planetConfigs.forEach(config => {
        createPlanet(
            config.name,
            config.size,
            config.color,
            config.radius,
            config.speed,
            config.fuel,
            config.xp,
            config.threat
        );
    });

    setTimeout(() => {
        if (playerData) {
            planets.forEach(p => {
                if (p.data.name === playerData.currentLocation) {
                    updatePlanetInfo(p);
                    // Highlight current planet
                    p.group.children.forEach(child => {
                        if (child.isMesh && child.material) {
                            child.material.emissive = new THREE.Color(0x00ffff);
                            child.material.emissiveIntensity = 0.3;
                        }
                    });
                }
            });
        }
    }, 500);
}

// ============ Event Handlers ============

function onPlanetClick(event) {
    if (isExplorationMode) return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Get all meshes from planet groups
    const meshes = [];
    planets.forEach(p => {
        p.group.children.forEach(child => {
            if (child.isMesh) {
                meshes.push(child);
            }
        });
    });
    
    const hits = raycaster.intersectObjects(meshes);

    if (hits.length > 0) {
        const clickedMesh = hits[0].object;
        let clickedPlanet = null;
        
        // Find which planet this mesh belongs to
        for (const p of planets) {
            if (p.group.children.includes(clickedMesh) || p.group === clickedMesh.parent) {
                clickedPlanet = p;
                break;
            }
        }
        
        if (clickedPlanet) {
            // Reset previous selection
            planets.forEach(p => {
                p.group.children.forEach(child => {
                    if (child.isMesh && child.material) {
                        if (p.data.name !== playerData?.currentLocation) {
                            child.material.emissive = new THREE.Color(0x000000);
                            child.material.emissiveIntensity = 0;
                        }
                    }
                });
            });
            
            // Highlight selected planet
            clickedPlanet.group.children.forEach(child => {
                if (child.isMesh && child.material) {
                    child.material.emissive = new THREE.Color(0x00ffff);
                    child.material.emissiveIntensity = 0.5;
                }
            });
            
            updatePlanetInfo(clickedPlanet);
            
            if (clickedPlanet.data.name !== playerData?.currentLocation) {
                openExploration(clickedPlanet.data.name, 'view');
            }
        }
    }
}

function onResize() {
    const container = document.getElementById('solar-system');
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    
    if (explorationRenderer && isExplorationMode) {
        const expContainer = explorationContainer;
        const expWidth = expContainer.clientWidth;
        const expHeight = expContainer.clientHeight;
        explorationCamera.aspect = expWidth / expHeight;
        explorationCamera.updateProjectionMatrix();
        explorationRenderer.setSize(expWidth, expHeight);
    }
}

function toggleMusic() {
    const isMuted = audioManager.toggleMute();
    musicToggle.textContent = isMuted ? '🔇' : '🔊';
    showNotification(isMuted ? '🔇 Music muted' : '🔊 Music playing', 'info');
}

// ============ Animation Loop ============

function animate() {
    animationId = requestAnimationFrame(animate);

    controls.update();

    if (sunMesh) {
        sunMesh.rotation.y += 0.003;
    }

    if (starField) {
        starField.rotation.y += 0.0002;
    }

    planets.forEach(planet => {
        planet.angle += planet.speed;
        planet.group.position.x = Math.cos(planet.angle) * planet.radius;
        planet.group.position.z = Math.sin(planet.angle) * planet.radius;
        // Rotate the planet group
        planet.group.rotation.y += 0.01;
        
        // Rotate clouds separately for Earth
        planet.group.children.forEach(child => {
            if (child.userData && child.userData.isCloud) {
                child.rotation.y += 0.015;
            }
        });
    });

    renderer.render(scene, camera);
}

// ============ Cleanup ============

function cleanup() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (explorationAnimationId) {
        cancelAnimationFrame(explorationAnimationId);
        explorationAnimationId = null;
    }
    if (renderer) {
        renderer.dispose();
    }
    if (explorationRenderer) {
        explorationRenderer.dispose();
    }
    audioManager.stopBackgroundMusic();
}

// ============ Initialize ============

const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes slideUp {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .mission-btn {
        margin-top: 10px;
        padding: 5px 15px;
        background: #00ffff;
        color: black;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
    }
    .mission-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    }
    .mission-card.completed {
        opacity: 0.6;
        border-left: 3px solid #00ff88;
    }
    .mission-card.locked {
        opacity: 0.4;
        border-left: 3px solid #666;
    }
    .mission-card.available {
        border-left: 3px solid #00ffff;
    }
    #fun-fact {
        animation: fadeIn 0.5s ease;
    }
    .planet-info-overlay {
        position: absolute;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(15px);
        padding: 20px 40px;
        border-radius: 15px;
        border: 1px solid rgba(0,255,255,0.3);
        color: white;
        font-family: 'Poppins', sans-serif;
        text-align: center;
        z-index: 1001;
        max-width: 500px;
        animation: fadeIn 0.5s ease;
    }
    .planet-info-overlay h3 {
        color: #00ffff;
        margin-bottom: 10px;
        font-size: 24px;
    }
    .planet-info-overlay p {
        opacity: 0.8;
        font-size: 14px;
        margin: 5px 0;
    }
    .planet-stats-overlay {
        display: flex;
        gap: 30px;
        justify-content: center;
        margin-top: 10px;
        flex-wrap: wrap;
    }
    .planet-stats-overlay div {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
    }
    .planet-stats-overlay .stat-label {
        font-size: 12px;
        opacity: 0.6;
    }
    .planet-stats-overlay .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: #ffd93d;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    initSolarSystem();
});

window.addEventListener('beforeunload', cleanup);