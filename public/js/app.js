
async function loadPlayer() {
    const res = await fetch("/api/player");
    const player = await res.json();

    document.getElementById("fuel").textContent = player.fuel;
    document.getElementById("xp").textContent = player.xp;
    document.getElementById("credits").textContent = player.credits;
    document.getElementById("rank").textContent = player.rank;

    document.getElementById("fuel-bar").style.width =
        player.fuel + "%";

    document.getElementById("xp-bar").style.width =
        Math.min(player.xp / 30, 100) + "%";
}

loadPlayer();

// =========================
// LOAD MISSIONS
// =========================

async function loadMissions() {

    const res =
    await fetch("/api/missions");

    const missions =
    await res.json();

    const container =
    document.getElementById(
        "mission-list"
    );

    container.innerHTML = "";

    missions.forEach(mission => {

        const card =
        document.createElement("div");

        card.className =
        "mission-card";

        card.innerHTML = `
            <h3>${mission.title}</h3>
            <p>${mission.location}</p>
            <p>Reward: ${mission.reward}</p>
        `;

        container.appendChild(card);
    });
}

loadMissions();

// =========================
// THREE JS
// =========================

const scene =
new THREE.Scene();

const camera =
new THREE.PerspectiveCamera(
    75,
    window.innerWidth /
    window.innerHeight,
    0.1,
    2000
);

const renderer =
new THREE.WebGLRenderer({
    antialias:true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    window.devicePixelRatio
);

document
.getElementById("solar-system")
.appendChild(
    renderer.domElement
);

// =========================
// ORBIT CONTROLS
// =========================

const controls =
new THREE.OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.enableZoom = true;
controls.enablePan = true;

// =========================
// LIGHTS
// =========================

const ambient =
new THREE.AmbientLight(
    0xffffff,
    0.5
);

scene.add(ambient);

const sunLight =
new THREE.PointLight(
    0xffffff,
    3,
    1000
);

scene.add(sunLight);

// =========================
// STARFIELD
// =========================

const starGeometry =
new THREE.BufferGeometry();

const starVertices = [];

for(let i=0;i<10000;i++){

    starVertices.push(
        THREE.MathUtils.randFloatSpread(1000)
    );

    starVertices.push(
        THREE.MathUtils.randFloatSpread(1000)
    );

    starVertices.push(
        THREE.MathUtils.randFloatSpread(1000)
    );
}

starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
        starVertices,
        3
    )
);

const starMaterial =
new THREE.PointsMaterial({
    size:1
});

const stars =
new THREE.Points(
    starGeometry,
    starMaterial
);

scene.add(stars);

// =========================
// SUN
// =========================

const sun =
new THREE.Mesh(
    new THREE.SphereGeometry(
        4,
        64,
        64
    ),
    new THREE.MeshBasicMaterial({
        color:0xffaa00
    })
);

scene.add(sun);

// =========================
// ORBITS
// =========================

function createOrbit(radius){

    const curve =
    new THREE.EllipseCurve(
        0,
        0,
        radius,
        radius,
        0,
        2*Math.PI
    );

    const points =
    curve.getPoints(150);

    const geometry =
    new THREE.BufferGeometry()
    .setFromPoints(points);

    const material =
    new THREE.LineBasicMaterial({
        color:0x333333
    });

    const orbit =
    new THREE.LineLoop(
        geometry,
        material
    );

    orbit.rotation.x =
    Math.PI/2;

    scene.add(orbit);
}

// =========================
// PLANETS
// =========================

const planets = [];

function addPlanet(
    name,
    size,
    color,
    radius,
    speed,
    fuel,
    xp,
    threat
){

    createOrbit(radius);

    const mesh =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            size,
            32,
            32
        ),
        new THREE.MeshStandardMaterial({
            color
        })
    );

    scene.add(mesh);

    const obj = {

        mesh,
        radius,
        speed,
        angle:
        Math.random() *
        Math.PI * 2,

        data:{
            name,
            fuel,
            xp,
            threat
        }
    };

    planets.push(obj);

    return obj;
}

addPlanet(
    "Mercury",
    0.5,
    0x999999,
    8,
    0.015,
    5,
    50,
    "Low"
);

addPlanet(
    "Venus",
    0.7,
    0xffcc66,
    12,
    0.012,
    8,
    75,
    "Medium"
);

addPlanet(
    "Earth",
    0.8,
    0x3399ff,
    16,
    0.01,
    0,
    100,
    "Safe"
);

addPlanet(
    "Mars",
    0.6,
    0xff3300,
    20,
    0.009,
    10,
    150,
    "Medium"
);

addPlanet(
    "Jupiter",
    1.8,
    0xd9a066,
    28,
    0.006,
    20,
    250,
    "High"
);

const saturn =
addPlanet(
    "Saturn",
    1.5,
    0xe6c16b,
    36,
    0.005,
    30,
    400,
    "High"
);

addPlanet(
    "Uranus",
    1.2,
    0x66ffff,
    44,
    0.004,
    45,
    600,
    "Extreme"
);

addPlanet(
    "Neptune",
    1.2,
    0x3366cc,
    52,
    0.003,
    50,
    700,
    "Extreme"
);

// =========================
// SATURN RINGS
// =========================

const ringGeometry =
new THREE.RingGeometry(
    2,
    3,
    64
);

const ringMaterial =
new THREE.MeshBasicMaterial({
    color:0xd4af37,
    side:THREE.DoubleSide
});

const ring =
new THREE.Mesh(
    ringGeometry,
    ringMaterial
);

ring.rotation.x = Math.PI / 2.5;
ring.rotation.z = 0.4;

saturn.mesh.add(ring);

// =========================
// CAMERA
// =========================

camera.position.set(
    0,
    40,
    85
);

// =========================
// PLANET CLICK
// =========================

const raycaster =
new THREE.Raycaster();

const mouse =
new THREE.Vector2();

let selectedPlanet = null;

window.addEventListener(
    "click",
    event => {

        mouse.x =
        (event.clientX /
        window.innerWidth)*2-1;

        mouse.y =
        -(event.clientY /
        window.innerHeight)*2+1;

        raycaster.setFromCamera(
            mouse,
            camera
        );

        const hits =
        raycaster.intersectObjects(
            planets.map(
                p => p.mesh
            )
        );

        if(hits.length){

            selectedPlanet =
            planets.find(
                p =>
                p.mesh ===
                hits[0].object
            );

            const data =
            selectedPlanet.data;

            document
            .getElementById(
                "planet-name"
            )
            .textContent =
            data.name;

            document
            .getElementById(
                "planet-description"
            )
            .textContent =
            `${data.name} selected`;

            document
            .getElementById(
                "fuel-cost"
            )
            .textContent =
            data.fuel;

            document
            .getElementById(
                "xp-reward"
            )
            .textContent =
            data.xp;

            document
            .getElementById(
                "threat-level"
            )
            .textContent =
            data.threat;
        }
    }
);

// =========================
// TRAVEL
// =========================

document
.getElementById(
    "travel-btn"
)
.addEventListener(
    "click",
    async () => {

        if(!selectedPlanet){

            alert(
                "Select a planet"
            );

            return;
        }

        const res =
        await fetch(
            "/api/travel",
            {
                method:"POST",
                headers:{
                    "Content-Type":
                    "application/json"
                },
                body:JSON.stringify({
                    planetName:
                    selectedPlanet
                    .data
                    .name
                })
            }
        );

        const result =
        await res.json();

        alert(
            result.message ||
            "Travel Complete"
        );

        loadPlayer();
    }
);

// =========================
// REFUEL
// =========================

document
.getElementById(
    "refuel-btn"
)
.addEventListener(
    "click",
    async () => {

        await fetch(
            "/api/refuel",
            {
                method:"POST"
            }
        );

        loadPlayer();
    }
);

// =========================
// ANIMATION
// =========================

function animate(){

    requestAnimationFrame(
        animate
    );

    controls.update();

    sun.rotation.y +=
    0.003;

    planets.forEach(
        planet => {

            planet.angle +=
            planet.speed;

            planet.mesh.position.x =
            Math.cos(
                planet.angle
            ) *
            planet.radius;

            planet.mesh.position.z =
            Math.sin(
                planet.angle
            ) *
            planet.radius;

            planet.mesh.rotation.y +=
            0.01;
        }
    );

    renderer.render(
        scene,
        camera
    );
}

animate();

// =========================
// RESIZE
// =========================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
        window.innerWidth /
        window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);

