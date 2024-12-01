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

  // Create a basic camera
  const camera = new BABYLON.FreeCamera(
    "camera",
    new BABYLON.Vector3(0, 1.6, -5), // Position at player's eye level
    scene
  );
  camera.setTarget(new BABYLON.Vector3(0, 1.6, 0)); // Look towards the court
  camera.attachControl(canvas, true);

  // Create a hemispheric light
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  // Create an invisible ground plane with physics impostor
  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
  ground.position.y = 0; // Adjust based on your court model
  ground.isVisible = false; // Set to true temporarily for testing
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, restitution: 0.5, friction: 0.5 },
    scene
  );
 

  // Initialize the physics viewer for debugging
  const physicsViewer = new BABYLON.PhysicsViewer(scene);
  physicsViewer.showImpostor(ground.physicsImpostor);

  // Load the court model
  await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "court.glb", scene)
    .then(function (result) {
      // Optionally, handle loaded meshes
      // Assign physics impostor to the court floor if necessary
    })
    .catch(function (error) {
      console.error("Error loading court model:", error);
    });

  // Load the basketball model
  const result = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "basketball.glb", scene);

  // Check if multiple meshes
  let basketball;
  if (result.meshes.length > 1) {
    // Create a parent mesh
    basketball = new BABYLON.Mesh("basketballParent", scene);

    // Reset transformations on child meshes
    result.meshes.forEach(mesh => {
      if (mesh !== basketball) {
        mesh.parent = basketball;
        mesh.position = BABYLON.Vector3.Zero();
        mesh.rotation = BABYLON.Vector3.Zero();
        mesh.scaling = new BABYLON.Vector3(1, 1, 1);
      }
    });
  } else {
    basketball = result.meshes[0];
  }

  basketball.name = 'basketball';

  // Scale and position
  basketball.scaling.scaleInPlace(0.24);
  basketball.position = new BABYLON.Vector3(0, 5, 0);

  // Assign physics impostor
  basketball.physicsImpostor = new BABYLON.PhysicsImpostor(
    basketball,
    BABYLON.PhysicsImpostor.SphereImpostor, // Use MeshImpostor if issues persist
    { mass: 0.624, restitution: 0.6, friction: 0.5 },
    scene
  );

  // Visualize the physics impostor
  physicsViewer.showImpostor(basketball.physicsImpostor);

  // Load the cheering sound
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

// Call the createScene function and wait for it to resolve
createScene().then(scene => {
  // Start the render loop
  engine.runRenderLoop(() => {
    scene.render();
  });

  // Optional: Show the debug layer
  scene.debugLayer.show();
}).catch(function (error) {
  console.error("Error creating the scene:", error);
});

// Resize the engine when the window is resized
window.addEventListener("resize", function () {
  engine.resize();
});
