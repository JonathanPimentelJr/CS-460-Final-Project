/*


// Get the canvas element
const canvas = document.getElementById('renderCanvas');

// Generate the Babylon.js 3D engine
const engine = new BABYLON.Engine(canvas, true);

// Create the scene
const createScene = async () => {
  const scene = new BABYLON.Scene(engine);

  // Wait for Ammo.js to be ready
  await Ammo();

  // Enable physics
  scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.AmmoJSPlugin());

  // Create a basic camera and light
  const camera = new BABYLON.FreeCamera(
    "camera",
    new BABYLON.Vector3(0, 1.6, -5), // Position at player's eye level
    scene
  );
  camera.setTarget(new BABYLON.Vector3(0, 1.6, 0)); // Look towards the court
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

  // Load the court model using SceneLoader.Append
  BABYLON.SceneLoader.Append(
    "assets/",
    "court.glb",
    scene,
    function (scene) {
      // Court model loaded successfully

      // Option 1: Assign physics impostor to the court floor mesh
      const floorMesh = scene.meshes.find(mesh => mesh.name === "Floor" || mesh.name.toLowerCase().includes("floor"));
      if (floorMesh) {
        floorMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
          floorMesh,
          BABYLON.PhysicsImpostor.BoxImpostor,
          { mass: 0, restitution: 0.5, friction: 0.5 },
          scene
        );
      } else {
        console.warn("Floor mesh not found in the court model. Creating an invisible ground plane.");

        // Option 2: Create an invisible ground plane
        const ground = BABYLON.MeshBuilder.CreateGround(
          "ground",
          { width: 30, height: 15 },
          scene
        );
        ground.position.y = 0; // Adjust based on the court's Y position
        ground.isVisible = true;
        

        ground.physicsImpostor = new BABYLON.PhysicsImpostor(
          ground,
          BABYLON.PhysicsImpostor.BoxImpostor,
          { mass: 0, restitution: 0.5, friction: 0.5 },
          scene
        );
      }


      const hoopMesh = scene.meshes.find(mesh => mesh.name.toLowerCase().includes("hoop"));
      if (hoopMesh) {
        const hoopMaterial = new BABYLON.StandardMaterial("hoopMaterial", scene);
        hoopMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        hoopMesh.material = hoopMaterial;
      }
    },
    null,
    function (scene, message) {
      console.error("Error loading court model:", message);
    }
  );

  // Load the basketball model
  BABYLON.SceneLoader.ImportMesh(
    "",
    "assets/",
    "basketball.glb",
    scene,
    function (meshes) {
      const basketball = meshes[0];
      basketball.name = 'basketball';
      basketball.scaling.scaleInPlace(0.24); // Adjust the scale if necessary
      basketball.position = new BABYLON.Vector3(0, 5, 0);

      basketball.physicsImpostor = new BABYLON.PhysicsImpostor(
        basketball,
        BABYLON.PhysicsImpostor.SphereImpostor,
        { mass: 0.624, restitution: 0.6, friction: 0.5 },
        scene
      );
    }
  );

  // Load the cheering sound (adjust settings as needed)
  const cheerSound = new BABYLON.Sound(
    "cheer",
    "assets/sounds/crowd.mp3",
    scene,
    null,
    { loop: false, autoplay: false }
  );

  // Return the created scene
  return scene;
};

// Call the createScene function
const scenePromise = createScene();

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(() => {
  scenePromise.then(scene => {
    scene.render();
  });
});

// Resize the engine when the window is resized
window.addEventListener('resize', function () {
  engine.resize();
});

*/

// Get the canvas element
const canvas = document.getElementById('renderCanvas');

// Generate the Babylon.js 3D engine
const engine = new BABYLON.Engine(canvas, true);

// Create the scene
const createScene = async () => {
  const scene = new BABYLON.Scene(engine);

  await Ammo();

  scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.AmmoJSPlugin());

  const camera = new BABYLON.FreeCamera(
    "camera",
    new BABYLON.Vector3(0, 1.8, -5),
    scene
  );
  camera.setTarget(new BABYLON.Vector3(0, 3, 5));
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

  const stadiumLight = new BABYLON.PointLight("stadiumLight", new BABYLON.Vector3(0, 10, 0), scene);
  stadiumLight.intensity = 0.8;

  const shadowGenerator = new BABYLON.ShadowGenerator(1024, stadiumLight);
  shadowGenerator.useBlurExponentialShadowMap = true;

  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 30, height: 15 }, scene);
  ground.position.y = 0;
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(
  ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction: 0.5 }, scene
  );

  const courtMaterial = new BABYLON.StandardMaterial("courtMaterial", scene);
  courtMaterial.diffuseTexture = new BABYLON.Texture("assets/Court/textures/court.png", scene);
  ground.material = courtMaterial;

  const createCrowd = (position, texturePath) => {
    const crowdPlane = BABYLON.MeshBuilder.CreatePlane("crowdPlane", { width: 10, height: 5 }, scene);
    crowdPlane.position = position;

    const crowdMaterial = new BABYLON.StandardMaterial("crowdMaterial", scene);
    crowdMaterial.diffuseTexture = new BABYLON.Texture(texturePath, scene);
    crowdMaterial.diffuseTexture.hasAlpha = true;
    crowdPlane.material = crowdMaterial;

    return crowdPlane;
  };
  // left crowd
  createCrowd(new BABYLON.Vector3(0, 2.5, 8), "assets/Court/textures/crowd.png");
  createCrowd(new BABYLON.Vector3(10, 2.5, 8), "assets/Court/textures/crowd.png");
  createCrowd(new BABYLON.Vector3(-10, 2.5, 8), "assets/Court/textures/crowd.png");
 
  // behind hoop
  const crowd = createCrowd(new BABYLON.Vector3(15.5, 2.5, 0.25), "assets/Court/textures/crowd.png");
  crowd.scaling.x = 1.5;
  crowd.rotation.y = Math.PI / 2;

  const crowd1 = createCrowd(new BABYLON.Vector3(-15.5, 2.5, -0.25), "assets/Court/textures/crowd.png");
  crowd1.scaling.x = 1.5;
  crowd1.rotation.y = -Math.PI / 2;

  // right side of the court
  const crowd2 = createCrowd(new BABYLON.Vector3(0, 2.5, -8), "assets/Court/textures/crowd.png");
  crowd2.rotation.y = Math.PI;

  const crowd3 = createCrowd(new BABYLON.Vector3(10, 2.5, -8), "assets/Court/textures/crowd.png");
  crowd3.rotation.y = Math.PI;

  const crowd4 = createCrowd(new BABYLON.Vector3(-10, 2.5, -8), "assets/Court/textures/crowd.png");
  crowd4.rotation.y = Math.PI;



  







  BABYLON.SceneLoader.ImportMesh(
    '',
    'assets/basketball.glb',
    scene,
    function (meshes) {
      const basketball = meshes[0];
      basketball.name = 'basketball';
      basketball.scaling.scaleInPlace(0.24);
      basketball.position = new BABYLON.Vector3(0, 1.6, -1);

      basketball.physicsImpostor = new BABYLON.PhysicsImpostor(
        basketball,
        BABYLON.PhysicsImpostor.SphereImposter,
        { mass: 0.624, restitution: 0.6, friction: 0.5 },
        scene
      );
    }
  );

 
  BABYLON.SceneLoader.ImportMesh(
    '',
    'assets/',
    'hoop.glb',
    scene,
    function (meshes) {
      const hoopTransform = new BABYLON.TransformNode("hoopTransform", scene);

      const hoop = meshes[0];
      hoop.name = 'hoop';
      hoop.parent = hoopTransform;

      hoop.scaling.scaleInPlace(.02);
      hoop.position = new BABYLON.Vector3(0, 3.9, 12.5);
      hoopTransform.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);

      hoop.physicsImpostor = new BABYLON.PhysicsImpostor(
        hoop,
        BABYLON.PhysicsImpostor.MeshImpostor,
        { mass: 0, restitution: 0.5, friction: 0.5 },
        scene
      );
    }
  );

  BABYLON.SceneLoader.ImportMesh(
    '',
    'assets/',
    'hoop.glb',
    scene,
    function (meshes) {
      const hoopTransform = new BABYLON.TransformNode("hoopTransform", scene);

      const hoop = meshes[0];
      hoop.name = 'hoop';
      hoop.parent = hoopTransform;

      hoop.scaling.scaleInPlace(.02);
      hoop.position = new BABYLON.Vector3(0, 3.9, 12.5);
      hoopTransform.rotation.y = -Math.PI / 2;

      hoop.physicsImpostor = new BABYLON.PhysicsImpostor(
        hoop,
        BABYLON.PhysicsImpostor.MeshImpostor,
        { mass: 0, restitution: 0.5, friction: 0.5 },
        scene
      );
    }
  );

  const cheerSound = new BABYLON.Sound("cheer", "assets/sounds/crowd.mp3", scene, null, { loop: true, autoplay: true });

  const dynamicTexture = new BABYLON.DynamicTexture("scoreboard", { width: 512, height: 256 }, scene);
  dynamicTexture.drawText("Score: 0", 50, 100, "bold 36px Arial", "white", "black");

  /*
  const scoreboard = BABYLON.MeshBuilder.CreatePlane("scoreboard", { width: 2, height: 1 }, scene);
  scoreboard.position = new BABYLON.Vector3(0, 3, -5);

  const scoreboardMaterial = new BABYLON.StandardMaterial("scoreboardMaterial", scene);
  scoreboardMaterial.diffuseTexture = dynamicTexture;
  scoreboard.material = scoreboardMaterial;

  */

  return scene;
};

const scenePromise = createScene();

engine.runRenderLoop(() => {
  scenePromise.then(scene => {
    scene.render();
  });
});

window.addEventListener('resize', function () {
  engine.resize();
});

