// Get the canvas element
const canvas = document.getElementById('renderCanvas');

// Generate the Babylon.js 3D engine
const engine = new BABYLON.Engine(canvas, true);

async function createScene() {
  const scene = new BABYLON.Scene(engine);

  // ----- Ammo.js Physics Setup -----
  await Ammo();
  console.log("Ammo.js loaded");

  scene.enablePhysics(
    new BABYLON.Vector3(0, -9.81, 0),
    new BABYLON.AmmoJSPlugin(true)
  );
  console.log("Physics enabled with plugin:", scene.getPhysicsEngine().getPhysicsPluginName());

  // ----- WebXR Experience -----
  const xr = await BABYLON.WebXRDefaultExperience.CreateAsync(scene);

  // ----- Lighting -----
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
  const stadiumLight = new BABYLON.PointLight('stadiumLight', new BABYLON.Vector3(0, 10, 0), scene);
  stadiumLight.intensity = 0.8;

  const shadowGenerator = new BABYLON.ShadowGenerator(1024, stadiumLight);
  shadowGenerator.useBlurExponentialShadowMap = true;

  // ----- Ground -----
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 30, height: 15 }, scene);
  ground.position.y = 0;
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, restitution: 0.5, friction: 0.5 },
    scene
  );

  // Ground material (court texture)
  const courtMaterial = new BABYLON.StandardMaterial('courtMaterial', scene);
  courtMaterial.diffuseTexture = new BABYLON.Texture('assets/Court/textures/court.png', scene);
  ground.material = courtMaterial;

  // ===== Player Box (Kinematic) =====
  // Acts as the player's physical body that can push objects
  const playerBox = BABYLON.MeshBuilder.CreateBox("playerBox", { width: 1, height: 2, depth: 1 }, scene);
  // Initially place it near origin (so half is above ground)
  playerBox.position.set(0, 1, 0);
  playerBox.visibility = 0.2; // Make slightly visible for debugging. Set to 0 if you want it fully invisible.

  // Kinematic impostor: mass=0
  playerBox.physicsImpostor = new BABYLON.PhysicsImpostor(
    playerBox,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, restitution: 0, friction: 0.5 },
    scene
  );
  playerBox.checkCollisions = true;

  // ===== Sphere (Ball) =====
  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
  sphere.scaling.scaleInPlace(0.6);
  sphere.position = new BABYLON.Vector3(0, 2, -2);
  // Use BoxImpostor for bounding box shape
  sphere.physicsImpostor = new BABYLON.PhysicsImpostor(
    sphere,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 1, restitution: 0.6, friction: 0.5 },
    scene
  );
  sphere.isPickable = true;
  sphere.checkCollisions = true;
  // Optional: Assign a material to ensure it's visible
  const sphereMat = new BABYLON.StandardMaterial("sphereMat", scene);
  sphereMat.diffuseColor = BABYLON.Color3.White();
  sphere.material = sphereMat;

  // ===== Crowd Creation Function =====
  const createCrowd = (position, texturePath) => {
    const crowdPlane = BABYLON.MeshBuilder.CreatePlane(
      'crowdPlane',
      { width: 10, height: 5 },
      scene
    );
    crowdPlane.position = position;

    const crowdMaterial = new BABYLON.StandardMaterial('crowdMaterial', scene);
    crowdMaterial.diffuseTexture = new BABYLON.Texture(texturePath, scene);
    crowdMaterial.diffuseTexture.hasAlpha = true;
    crowdPlane.material = crowdMaterial;

    return crowdPlane;
  };

  // Create the crowd around the court
  createCrowd(new BABYLON.Vector3(0, 2.5, 7.5), 'assets/Court/textures/crowd.png');
  createCrowd(new BABYLON.Vector3(10, 2.5, 7.5), 'assets/Court/textures/crowd.png');
  createCrowd(new BABYLON.Vector3(-10, 2.5, 7.5), 'assets/Court/textures/crowd.png');

  // Behind hoops
  const crowdLeft = createCrowd(new BABYLON.Vector3(15.5, 2.3, 0.25), 'assets/Court/textures/crowd.png');
  crowdLeft.scaling.x = 1.5;
  crowdLeft.rotation.y = Math.PI / 2;

  const crowdRight = createCrowd(new BABYLON.Vector3(-15.5, 2.3, -0.25), 'assets/Court/textures/crowd.png');
  crowdRight.scaling.x = 1.5;
  crowdRight.rotation.y = -Math.PI / 2;

  // Right side
  const crowdBack1 = createCrowd(new BABYLON.Vector3(0, 2.5, -7.5), 'assets/Court/textures/crowd.png');
  crowdBack1.rotation.y = Math.PI;

  const crowdBack2 = createCrowd(new BABYLON.Vector3(10, 2.5, -7.5), 'assets/Court/textures/crowd.png');
  crowdBack2.rotation.y = Math.PI;

  const crowdBack3 = createCrowd(new BABYLON.Vector3(-10, 2.5, -7.5), 'assets/Court/textures/crowd.png');
  crowdBack3.rotation.y = Math.PI;

  // ===== Hoops =====
  // First hoop
  const hoopResult1 = await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/', 'hoop.glb', scene);
  hoopResult1.meshes.forEach(mesh => {
    const hoopMaterial = new BABYLON.StandardMaterial("hoopMaterial", scene);
    hoopMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    hoopMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    mesh.material = hoopMaterial;
  });
  const hoopTransform1 = new BABYLON.TransformNode('hoopTransform1', scene);
  const hoop1 = hoopResult1.meshes[0];
  hoop1.name = 'hoop1';
  hoop1.parent = hoopTransform1;
  hoop1.scaling.scaleInPlace(0.02);
  hoop1.position = new BABYLON.Vector3(0, 3.9, 12.5);
  hoopTransform1.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
  // Use BoxImpostor for bounding box
  hoop1.physicsImpostor = new BABYLON.PhysicsImpostor(
    hoop1,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, restitution: 0.5, friction: 0.5 },
    scene
  );

  // Second hoop
  const hoopResult2 = await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/', 'hoop.glb', scene);
  const hoopTransform2 = new BABYLON.TransformNode('hoopTransform2', scene);
  const hoop2 = hoopResult2.meshes[0];
  hoop2.name = 'hoop2';
  hoop2.parent = hoopTransform2;
  hoop2.scaling.scaleInPlace(0.02);
  hoop2.position = new BABYLON.Vector3(0, 3.9, 12.5);
  hoopTransform2.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0);
  hoop2.physicsImpostor = new BABYLON.PhysicsImpostor(
    hoop2,
    BABYLON.PhysicsImpostor.MeshImpostor,
    { mass: 0, restitution: 0.5, friction: 0.5 },
    scene
  );

  let isHoldingBall = false;
  let movementVector = new BABYLON.Vector3();
  let rotationInput = 0;

  // ===== Grabbing Logic (Squeeze) =====
  const checkGrab = (pressed, controller) => {
    const ray = controller.getWorldPointerRay();
    const pickInfo = scene.pickWithRay(ray);
    console.log("PickInfo:", pickInfo);

    if (pressed) {
      if (pickInfo.hit && pickInfo.pickedMesh === sphere) {
        sphere.setParent(controller.grip);
        sphere.physicsImpostor.sleep();
        isHoldingBall = true;
        console.log("Sphere picked up");
      } else {
        console.log("Sphere not picked; ensure it's in front.");
      }
    } else {
      if (sphere.parent === controller.grip) {
        sphere.setParent(null);
        sphere.physicsImpostor.wakeUp();
        isHoldingBall = false;

        const currentPos = controller.grip.position.clone();
        const lastPos = controller.grip['lastPosition'] || currentPos;
        controller.grip['lastPosition'] = currentPos.clone();

        const controllerVelocity = currentPos.subtract(lastPos);
        sphere.physicsImpostor.setLinearVelocity(controllerVelocity.scale(60));
        console.log('Sphere thrown with velocity:', controllerVelocity.scale(60));
      }
    }
  };

  // Attach squeeze for grabbing
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMeshLoadedObservable.addOnce((rootMesh) => {
      shadowGenerator.addShadowCaster(rootMesh, true);
    });
    controller.onMotionControllerInitObservable.add(() => {
      const squeeze = controller.motionController.getComponentOfType("squeeze");
      if (squeeze) {
        squeeze.onButtonStateChangedObservable.add(() => {
          if (squeeze.changes.pressed) {
            checkGrab(squeeze.pressed, controller);
          }
        });
      }
    });
  });

  // ===== Movement & Rotation Each Frame =====
  scene.onBeforeRenderObservable.add(() => {
    const camera = xr.baseExperience.camera;
    const speed = 0.05;

    if (!isHoldingBall && (movementVector.x !== 0 || movementVector.z !== 0)) {
      // Move camera along world axes
      camera.position.x += movementVector.x * speed;
      camera.position.z += movementVector.z * speed;
    }

    // Rotation from right thumbstick
    if (rotationInput !== 0) {
      const rotationSpeed = 0.05;
      const deadzone = 0.1;
      if (Math.abs(rotationInput) > deadzone) {
        camera.rotation.y -= rotationInput * rotationSpeed;
      }
    }

    // ===== Sync PlayerBox to the Camera =====
    // Player box is kinematic (mass=0). We place it so the camera is at "head" level
    playerBox.position.x = camera.position.x;
    playerBox.position.y = camera.position.y - 1; // half of the 2-meter box height
    playerBox.position.z = camera.position.z;
  });

  // ===== Movement & Rotation Input from Controllers =====
  xr.input.onControllerAddedObservable.add((xrController) => {
    xrController.onMotionControllerInitObservable.add((motionController) => {
      const handedness = xrController.inputSource.handedness;
      console.log(`Components for ${handedness} controller:`, motionController.components);

      // Left controller: movement
      if (handedness === 'left') {
        const thumbstickComponent = motionController.getComponent('xr-standard-thumbstick') ||
                                    motionController.getComponent('thumbstick') ||
                                    motionController.getComponent('touchpad');
        if (thumbstickComponent) {
          thumbstickComponent.onAxisValueChangedObservable.add(() => {
            const xValue = thumbstickComponent.axes.x;
            const yValue = thumbstickComponent.axes.y;
            // x -> left/right, y -> forward/back
            movementVector.x = xValue;
            movementVector.z = yValue;
          });
          thumbstickComponent.onButtonStateChangedObservable.add(() => {
            if (!thumbstickComponent.pressed) {
              movementVector.x = 0;
              movementVector.z = 0;
            }
          });
        } else {
          console.warn('Thumbstick component not found on left controller for movement');
        }
      }

      // Right controller: rotation
      if (handedness === 'right') {
        const thumbstickComponent = motionController.getComponent('xr-standard-thumbstick') ||
                                    motionController.getComponent('thumbstick') ||
                                    motionController.getComponent('touchpad');
        if (thumbstickComponent) {
          thumbstickComponent.onAxisValueChangedObservable.add(() => {
            const xValue = thumbstickComponent.axes.x;
            rotationInput = xValue;
          });
          thumbstickComponent.onButtonStateChangedObservable.add(() => {
            if (!thumbstickComponent.pressed) {
              rotationInput = 0;
            }
          });
        } else {
          console.warn('Thumbstick component not found on right controller for rotation');
        }
      }
    });
  });

  // Collisions
  scene.collisionsEnabled = true;
  xr.baseExperience.camera.checkCollisions = true;
  xr.baseExperience.camera.ellipsoid = new BABYLON.Vector3(0.5,1,0.5);
  ground.checkCollisions = true;
  playerBox.checkCollisions = true; // ensures collisions for the player box

  return scene;
}

const scenePromise = createScene();

engine.runRenderLoop(() => {
  scenePromise.then((scene) => {
    scene.render();
  });
});

window.addEventListener("resize", function() {
  engine.resize();
});


/* 
const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

  const scoreText = new BABYLON.GUI.TextBlock();
  scoreText.text = "Score: 0"; // Initial score
  scoreText.color = "white";
  scoreText.fontSize = 24;
  scoreText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  scoreText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  scoreText.paddingTop = 10;
  scoreText.paddingLeft = 10;

  advancedTexture.addControl(scoreText);

  // Function to update the score
  let score = 0;

  function updateScore(newScore) {
    scoreText.text = `Score: ${newScore}`;
}
*/