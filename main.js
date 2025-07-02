import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder } from "@babylonjs/core";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);

const scene = new Scene(engine);

// Camera
const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 3, 4, Vector3.Zero(), scene);
camera.attachControl(canvas, true);

// Light
const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

// Ground + Box
MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
MeshBuilder.CreateBox("box", { size: 12 }, scene);

engine.runRenderLoop(() => {
  scene.render();
});
