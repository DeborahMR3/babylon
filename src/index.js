import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera.js";
import { Engine } from "@babylonjs/core/Engines/engine.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder.js";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder.js";
import { Scene } from "@babylonjs/core/scene.js";

import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial.js";

import "@babylonjs/loaders";
import { ArcRotateCamera, ImportMeshAsync, SceneLoader } from "@babylonjs/core";

import { CreateCamera } from "./cameraHandler";

// Get the canvas element from the DOM.
const canvas = document.getElementById("renderCanvas");

// Associate a Babylon Engine to it.
const engine = new Engine(canvas);

// Create our first scene.
const scene = new Scene(engine);

// This creates and positions a free camera (non-mesh)
const camera = new ArcRotateCamera(
    "camera1",
    0,
    0,
    10,
    new Vector3(0, 0, 0),
    scene
);
camera.setTarget(Vector3.Zero());
camera.attachControl(canvas, true);
// CreateCamera();

// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 0.7;

// Create a grid material
const material = new GridMaterial("grid", scene);

// Our built-in 'sphere' shape.
const sphere = CreateSphere("sphere1", { segments: 16, diameter: 1 }, scene);

// Move the sphere upward 1/2 its height
sphere.position.y = 2;

// Affect a material
sphere.material = material;

// Our built-in 'ground' shape.
const ground = CreateGround(
    "ground1",
    { width: 12, height: 12, subdivisions: 2 },
    scene
);

// Affect a material
ground.material = material;

// Render every frame
engine.runRenderLoop(() => {
    scene.render();
});

//SceneLoader.ImportMesh("", "./models/", "IVAR.glb", scene);

const ivarShelf = ImportMeshAsync("./models/IVAR.glb", scene);

//ivarShelf.Vector3.position
