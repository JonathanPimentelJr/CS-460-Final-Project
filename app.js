// Get the canvas element
const canvas = document.getElementById('renderCanvas');

// Generate the Babylon.js 3D engine
const engine = new BABYLON.Engine(canvas, true);

// Create the scene
const createScene = async () => {
  const scene = new BABYLON.Scene(engine);

  // Wait for Ammo.js to be ready and get the module instance
  const ammo = await Ammo();

  // Enable physics with the Ammo.js plugin, passing the ammo instance
  scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.AmmoJSPlugin(true, ammo));

  // Initialize WebXR Default Experience
  const xr = await BABYLON.WebXRDefaultExperience.CreateAsync(scene);

  // Lighting
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

  const stadiumLight = new BABYLON.PointLight("stadiumLight", new BABYLON.Vector3(0, 10, 0), scene);
  stadiumLight.intensity = 0.8;

  const shadowGenerator = new BABYLON.ShadowGenerator(1024, stadiumLight);
  shadowGenerator.useBlurExponentialShadowMap = true;

  // Ground
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 30, height: 15 }, scene);
  ground.position.y = 0;
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction: 0.5 }, scene
  );

  // Ground material (court texture)
  const courtMaterial = new BABYLON.StandardMaterial("courtMaterial", scene);
  courtMaterial.diffuseTexture = new BABYLON.Texture("assets/Court/textures/court.png", scene);
  ground.material = courtMaterial;

  // Define basketball in the outer scope
  let basketball;

  // Load the basketball model using async/await
  const result = await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/', 'basketball.glb', scene);

  basketball = result.meshes[0];
  basketball.name = 'basketball';
  basketball.scaling.scaleInPlace(0.24);
  basketball.position = new BABYLON.Vector3(0, 1.6, -1);

  basketball.physicsImpostor = new BABYLON.PhysicsImpostor(
    basketball,
    BABYLON.PhysicsImpostor.SphereImpostor,
    { mass: 0.624, restitution: 0.6, friction: 0.5 },
    scene
  );
  // Make the basketball grabbable
  basketball.isPickable = true;

  // Create crowd function
  const createCrowd = (position, texturePath) => {
    const crowdPlane = BABYLON.MeshBuilder.CreatePlane("crowdPlane", { width: 10, height: 5 }, scene);
    crowdPlane.position = position;

    const crowdMaterial = new BABYLON.StandardMaterial("crowdMaterial", scene);
    crowdMaterial.diffuseTexture = new BABYLON.Texture(texturePath, scene);
    crowdMaterial.diffuseTexture.hasAlpha = true;
    crowdPlane.material = crowdMaterial;

    return crowdPlane;
  };

  // Create the crowd around the court
  // Left side
  createCrowd(new BABYLON.Vector3(0, 2.5, 7.5), "assets/Court/textures/crowd.png");
  createCrowd(new BABYLON.Vector3(10, 2.5, 7.5), "assets/Court/textures/crowd.png");
  createCrowd(new BABYLON.Vector3(-10, 2.5, 7.5), "assets/Court/textures/crowd.png");

  // Behind hoops
  const crowdLeft = createCrowd(new BABYLON.Vector3(15.5, 2.3, 0.25), "assets/Court/textures/crowd.png");
  crowdLeft.scaling.x = 1.5;
  crowdLeft.rotation.y = Math.PI / 2;

  const crowdRight = createCrowd(new BABYLON.Vector3(-15.5, 2.3, -0.25), "assets/Court/textures/crowd.png");
  crowdRight.scaling.x = 1.5;
  crowdRight.rotation.y = -Math.PI / 2;

  // Right side
  const crowdBack1 = createCrowd(new BABYLON.Vector3(0, 2.5, -7.5), "assets/Court/textures/crowd.png");
  crowdBack1.rotation.y = Math.PI;

  const crowdBack2 = createCrowd(new BABYLON.Vector3(10, 2.5, -7.5), "assets/Court/textures/crowd.png");
  crowdBack2.rotation.y = Math.PI;

  const crowdBack3 = createCrowd(new BABYLON.Vector3(-10, 2.5, -7.5), "assets/Court/textures/crowd.png");
  crowdBack3.rotation.y = Math.PI;

  // Load the hoop models
  // First hoop
  BABYLON.SceneLoader.ImportMesh(
    '',
    'assets/',
    'hoop.glb',
    scene,
    function (meshes) {
      const hoopTransform = new BABYLON.TransformNode("hoopTransform1", scene);

      const hoop = meshes[0];
      hoop.name = 'hoop1';
      hoop.parent = hoopTransform;

      hoop.scaling.scaleInPlace(0.02);
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

  // Second hoop
  BABYLON.SceneLoader.ImportMesh(
    '',
    'assets/',
    'hoop.glb',
    scene,
    function (meshes) {
      const hoopTransform = new BABYLON.TransformNode("hoopTransform2", scene);

      const hoop = meshes[0];
      hoop.name = 'hoop2';
      hoop.parent = hoopTransform;

      hoop.scaling.scaleInPlace(0.02);
      hoop.position = new BABYLON.Vector3(0, 3.9, -12.5); // Adjusted position for the opposite end
      hoopTransform.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0);

      hoop.physicsImpostor = new BABYLON.PhysicsImpostor(
        hoop,
        BABYLON.PhysicsImpostor.MeshImpostor,
        { mass: 0, restitution: 0.5, friction: 0.5 },
        scene
      );
    }
  );

  // Handle controller input for grabbing
  xr.input.onControllerAddedObservable.add((xrController) => {
    // Enable pointer selection
    const laserPointer = xrController.pointer;
    const grabRay = new BABYLON.Ray();
    const grabRayHelper = new BABYLON.RayHelper(grabRay);
    grabRayHelper.attachToMesh(laserPointer);

    xrController.onMotionControllerInitObservable.add((motionController) => {
      const triggerComponent = motionController.getComponent("trigger");
      if (triggerComponent) {
        triggerComponent.onButtonStateChangedObservable.add(() => {
          if (triggerComponent.changes.pressed) {
            if (triggerComponent.pressed) {
              // Trigger pressed - attempt to pick up the basketball
              const pickInfo = scene.pickWithRay(grabRay);
              if (pickInfo.hit && pickInfo.pickedMesh === basketball) {
                // Attach basketball to controller
                basketball.setParent(xrController.grip);
                basketball.physicsImpostor.sleep();
              }
            } else {
              // Trigger released - drop the basketball
              if (basketball.parent === xrController.grip) {
                basketball.setParent(null);
                basketball.physicsImpostor.wakeUp();

                // Apply velocity based on controller's movement
                const currentPos = xrController.grip.position.clone();
                const lastPos = xrController.grip['lastPosition'] || currentPos;
                xrController.grip['lastPosition'] = currentPos.clone();

                const controllerVelocity = currentPos.subtract(lastPos);
                basketball.physicsImpostor.setLinearVelocity(controllerVelocity.scale(60)); // Adjust the scale for desired throw speed
              }
            }
          }
        });
      }
    });
  });

  // Play cheering sound
  const cheerSound = new BABYLON.Sound("cheer", "assets/sounds/crowd.mp3", scene, null, { loop: true, autoplay: true });

  // Scoreboard (if needed)
  const dynamicTexture = new BABYLON.DynamicTexture("scoreboard", { width: 512, height: 256 }, scene);
  dynamicTexture.drawText("Score: 0", 50, 100, "bold 36px Arial", "white", "black");

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
