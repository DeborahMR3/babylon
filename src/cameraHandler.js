import { FreeCamera } from "@babylonjs/core";

export function createCamera() {
    // This creates and positions a free camera (non-mesh)
    const camera = new FreeCamera(
        "camera1",
        new Vector3(0, 5, -10),
        this.scene
    );

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(this.canvas, true);

    return camera;
}
