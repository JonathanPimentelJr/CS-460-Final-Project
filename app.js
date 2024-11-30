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
