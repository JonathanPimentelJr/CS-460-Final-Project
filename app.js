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
  scene.enablePhysics(
    new BABYLON.Vector3(0, -9.81, 0),
    new BABYLON.AmmoJSPlugin(true, ammo)
  );

  // Initialize WebXR Default Experience
  const xr = await BABYLON.WebXRDefaultExperience.CreateAsync(scene);

  // Lighting
  const light = new BABYLON.HemisphericLight(
    'light',
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  const stadiumLight = new BABYLON.PointLight(
    'stadiumLight',
    new BABYLON.Vector3(0, 10, 0),
    scene
  );
  stadiumLight.intensity = 0.8;

  const shadowGenerator = new BABYLON.ShadowGenerator(1024, stadiumLight);
  shadowGenerator.useBlurExponentialShadowMap = true;

  // Ground
  const ground = BABYLON.MeshBuilder.CreateGround(
    'ground',
    { width: 30, height: 15 },
    scene
  );
  ground.position.y = 0;
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, restitution: 0.6, friction: 0.5 },
    scene
  );

  // Ground material (court texture)
  const courtMaterial = new BABYLON.StandardMaterial('courtMaterial', scene);
  courtMaterial.diffuseTexture = new BABYLON.Texture(
    'assets/Court/textures/court.png',
    scene
  );
  ground.material = courtMaterial;

  // Define basketball in the outer scope
  let basketball;

  // Load the basketball model using async/await
  const result = await BABYLON.SceneLoader.ImportMeshAsync(
    '',
    'assets/',
    'basketball.glb',
    scene
  );

  basketball = result.meshes[0];
  basketball.name = 'basketball';
  basketball.scaling.scaleInPlace(0.6);
  basketball.position = new BABYLON.Vector3(0, 2, 1);


  


  basketball.physicsImpostor = new BABYLON.PhysicsImpostor(
    basketball,
    BABYLON.PhysicsImpostor.SphereImpostor,
    { mass: 1, restitution: 0.8, friction: 0.5 },
    scene
  );
  // Make the basketball grabbable
  basketball.isPickable = true;

  // Create crowd function
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
  // Left side
  createCrowd(
    new BABYLON.Vector3(0, 2.5, 7.5),
    'assets/Court/textures/crowd.png'
  );
  createCrowd(
    new BABYLON.Vector3(10, 2.5, 7.5),
    'assets/Court/textures/crowd.png'
  );
  createCrowd(
    new BABYLON.Vector3(-10, 2.5, 7.5),
    'assets/Court/textures/crowd.png'
  );

  // Behind hoops
  const crowdLeft = createCrowd(
    new BABYLON.Vector3(15.5, 2.3, 0.25),
    'assets/Court/textures/crowd.png'
  );
  crowdLeft.scaling.x = 1.5;
  crowdLeft.rotation.y = Math.PI / 2;

  const crowdRight = createCrowd(
    new BABYLON.Vector3(-15.5, 2.3, -0.25),
    'assets/Court/textures/crowd.png'
  );
  crowdRight.scaling.x = 1.5;
  crowdRight.rotation.y = -Math.PI / 2;

  // Right side
  const crowdBack1 = createCrowd(
    new BABYLON.Vector3(0, 2.5, -7.5),
    'assets/Court/textures/crowd.png'
  );
  crowdBack1.rotation.y = Math.PI;

  const crowdBack2 = createCrowd(
    new BABYLON.Vector3(10, 2.5, -7.5),
    'assets/Court/textures/crowd.png'
  );
  crowdBack2.rotation.y = Math.PI;

  const crowdBack3 = createCrowd(
    new BABYLON.Vector3(-10, 2.5, -7.5),
    'assets/Court/textures/crowd.png'
  );
  crowdBack3.rotation.y = Math.PI;

  // Load the hoop models
  // First hoop
  const hoopResult1 = await BABYLON.SceneLoader.ImportMeshAsync(
    '',
    'assets/',
    'hoop.glb',
    scene
  );

  // Iterate through all loaded meshes
  hoopResult1.meshes.forEach(mesh => {
  // Create and assign a new material
  const hoopMaterial = new BABYLON.StandardMaterial("hoopMaterial", scene);
  hoopMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red
  hoopMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // Prevent shininess
  mesh.material = hoopMaterial;
  });

  const hoopTransform1 = new BABYLON.TransformNode('hoopTransform1', scene);

  const hoop1 = hoopResult1.meshes[0];
  hoop1.name = 'hoop1';
  hoop1.parent = hoopTransform1;

  hoop1.scaling.scaleInPlace(0.02);
  hoop1.position = new BABYLON.Vector3(0, 3.9, 12.5);
  hoopTransform1.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);

  hoop1.physicsImpostor = new BABYLON.PhysicsImpostor(
    hoop1,
    BABYLON.PhysicsImpostor.MeshImpostor,
    { mass: 0, restitution: 0.5, friction: 0.5 },
    scene
  );
  

  // Second hoop
  const hoopResult2 = await BABYLON.SceneLoader.ImportMeshAsync(
    '',
    'assets/',
    'hoop.glb',
    scene
  );

  const hoopTransform2 = new BABYLON.TransformNode('hoopTransform2', scene);

  const hoop2 = hoopResult2.meshes[0];
  hoop2.name = 'hoop2';
  hoop2.parent = hoopTransform2;

  hoop2.scaling.scaleInPlace(0.02);
  hoop2.position = new BABYLON.Vector3(0, 3.9, 12.5); // Adjusted position for the opposite end
  hoopTransform2.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0);

  hoop2.physicsImpostor = new BABYLON.PhysicsImpostor(
    hoop2,
    BABYLON.PhysicsImpostor.MeshImpostor,
    { mass: 0, restitution: 0.5, friction: 0.5 },
    scene
  );

  // Variable to track if the basketball is being held
  let isHoldingBall = false;
  function handleKeyDown(event) {
  switch (event.key) {
    case "w":
    case "W":
      verticalDistance -= MOVE_DISTANCE;
      break;
    case "s":
    case "S":
      verticalDistance += MOVE_DISTANCE;
      break;
    case "a":
    case "A":
      transverseDistance += MOVE_DISTANCE;
      break;
    case "d":
    case "D":
      transverseDistance -= MOVE_DISTANCE;
      break;
    case "ArrowUp":
      axialDistance += MOVE_DISTANCE;
      break;
    case "ArrowDown":
      axialDistance -= MOVE_DISTANCE;
      break;
    case "r":
    case "R":
      transverseDistance = axialDistance = verticalDistance = 0;
      mouseYaw = mousePitch = 0;
      break;
    default:
      break;
  }
}

  // Variables to store movement and rotation input
  let movementVector = new BABYLON.Vector3();
  let rotationInput = 0;

  // Handle controller input for grabbing and movement
  xr.input.onControllerAddedObservable.add((xrController) => {
    console.log('Controller added:', xrController);

    xrController.onMotionControllerInitObservable.add((motionController) => {
      console.log('Motion controller initialized:', motionController);

      // Determine the handedness of the controller
      const handedness = xrController.inputSource.handedness; // 'left' or 'right'

      // Log all components
      console.log(`Components for ${handedness} controller:`, motionController.components);

      // Handle movement with left controller
      if (handedness === 'left') {
        // Movement (left thumbstick)
        const thumbstickComponent = motionController.getComponent('xr-standard-thumbstick') || motionController.getComponent('thumbstick') || motionController.getComponent('touchpad');

        if (thumbstickComponent) {
          console.log('Left thumbstick component found:', thumbstickComponent);

          // Observe changes in thumbstick axis values
          thumbstickComponent.onAxisValueChangedObservable.add(() => {
            const xValue = thumbstickComponent.axes.x;
            const yValue = thumbstickComponent.axes.y;

            // Update movement vector
            movementVector.x = xValue;
            movementVector.z = yValue;
          });

          // Reset movement vector when thumbstick is released
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

      // Handle rotation with right controller
      if (handedness === 'right') {
        // Rotation (right thumbstick)
        const thumbstickComponent = motionController.getComponent('xr-standard-thumbstick') || motionController.getComponent('thumbstick') || motionController.getComponent('touchpad');

        if (thumbstickComponent) {
          console.log('Right thumbstick component found:', thumbstickComponent);

          // Observe changes in thumbstick axis values
          thumbstickComponent.onAxisValueChangedObservable.add(() => {
            const xValue = thumbstickComponent.axes.x;

            // Store the xValue for use in the render loop
            rotationInput = xValue;
          });

          // Reset rotation input when thumbstick is released
          thumbstickComponent.onButtonStateChangedObservable.add(() => {
            if (!thumbstickComponent.pressed) {
              rotationInput = 0;
            }
          });
        } else {
          console.warn('Thumbstick component not found on right controller for rotation');
        }
      }

      // Handle grabbing with trigger (applies to both controllers)
      const triggerComponent =
        motionController.getComponent('xr-standard-trigger') ||
        motionController.getComponent('trigger');

      if (triggerComponent) {
        console.log('Trigger component found:', triggerComponent);

        triggerComponent.onButtonStateChangedObservable.add(() => {
          console.log('Trigger state changed:', triggerComponent.changes);

          if (triggerComponent.changes.pressed) {
            if (triggerComponent.pressed) {
              console.log('Trigger pressed');

              // Trigger pressed - attempt to pick up the basketball
              const pickInfo = scene.pickWithRay(
                new BABYLON.Ray(
                  xrController.pointer.position,
                  xrController.pointer.forward,
                  0,
                  10
                )
              );

              if (pickInfo.hit && pickInfo.pickedMesh === basketball) {
                // Attach basketball to controller
                basketball.setParent(xrController.grip);
                basketball.physicsImpostor.sleep();
                isHoldingBall = true;
                console.log('Basketball picked up');
              }
            } else {
              console.log('Trigger released');

              // Trigger released - drop the basketball
              if (basketball.parent === xrController.grip) {
                basketball.setParent(null);
                basketball.physicsImpostor.wakeUp();
                isHoldingBall = false;

                // Apply velocity based on controller's movement
                const currentPos = xrController.grip.position.clone();
                const lastPos = xrController.grip['lastPosition'] || currentPos;
                xrController.grip['lastPosition'] = currentPos.clone();

                const controllerVelocity = currentPos.subtract(lastPos);
                basketball.physicsImpostor.setLinearVelocity(
                  controllerVelocity.scale(60)
                ); // Adjust the scale for desired throw speed

                console.log(
                  'Basketball thrown with velocity:',
                  controllerVelocity.scale(60)
                );
              }
            }
          }
        });
      } else {
        console.warn('Trigger component not found');
      }
    });
  });

  // Update movement and rotation on each frame
  scene.onBeforeRenderObservable.add(() => {
    const camera = xr.baseExperience.camera;

    // Apply movement
    if (!isHoldingBall && (movementVector.x !== 0 || movementVector.z !== 0)) {
      // Calculate direction vectors based on camera's orientation
      const forward = new BABYLON.Vector3(
        Math.sin(camera.rotation.y),
        0,
        Math.cos(camera.rotation.y)
      );
      const right = new BABYLON.Vector3(
        -forward.z,
        0,
        forward.x
      );

      // Calculate movement direction
      const moveDirection = forward.scale(movementVector.z).add(right.scale(movementVector.x));

      // Normalize the movement vector
      moveDirection.normalize();

      // Set movement speed
      const speed = 0.05; // Adjust speed as needed

      // Update camera position
      camera.position.addInPlace(moveDirection.scale(speed));
    }

    // Apply rotation
    if (rotationInput !== 0) {
      const rotationSpeed = 0.05; // Adjust rotation speed as needed

      // Apply deadzone to prevent unwanted rotation
      const deadzone = 0.1;
      if (Math.abs(rotationInput) > deadzone) {
        camera.rotation.y -= rotationInput * rotationSpeed;
      }
    }
  });

  // Enable collisions
  scene.collisionsEnabled = true;
  xr.baseExperience.camera.checkCollisions = true;
  xr.baseExperience.camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);

  // Set collisions for ground and other meshes
  ground.checkCollisions = true;
  hoop1.checkCollisions = true;
  hoop2.checkCollisions = true;
  crowdLeft.checkCollisions = true;
  crowdRight.checkCollisions = true;
  crowdBack1.checkCollisions = true;
  crowdBack2.checkCollisions = true;
  crowdBack3.checkCollisions = true;
  // Add collision checks for other meshes as needed

  // Play cheering sound
  const cheerSound = new BABYLON.Sound(
    'cheer',
    'assets/sounds/crowd.mp3',
    scene,
    null,
    { loop: false, autoplay: false }
  );

  // Scoreboard (if needed)
  const dynamicTexture = new BABYLON.DynamicTexture(
    'scoreboard',
    { width: 512, height: 256 },
    scene
  );
  dynamicTexture.drawText(
    'Score: 0',
    50,
    100,
    'bold 36px Arial',
    'white',
    'black'
  );

  return scene;
};

const scenePromise = createScene();

engine.runRenderLoop(() => {
  scenePromise.then((scene) => {
    scene.render();
  });
});

window.addEventListener('resize', function () {
  engine.resize();
});
