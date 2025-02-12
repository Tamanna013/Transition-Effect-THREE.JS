import * as THREE from "three";

const objCount = 5000;

function getMeshProps() {
  const arr = [];
  for (let i = 0; i < objCount; i += 1) {
    arr.push({
      position: {
        x: Math.random() * 10000 - 5000,
        y: Math.random() * 6000 - 3000,
        z: Math.random() * 8000 - 4000
      },
      rotation: {
        x: Math.random() * 2 * Math.PI,
        y: Math.random() * 2 * Math.PI,
        z: Math.random() * 2 * Math.PI,
      },
      scale: Math.random() * 200 + 100
    });
  }
  return arr;
}

const dummyProps = getMeshProps();
function getMesh(material) {
  const geometries = [
    new THREE.IcosahedronGeometry(0.25, 1),
    new THREE.BoxGeometry(0.3, 0.3, 0.3),
    new THREE.SphereGeometry(0.2, 10, 10),
  ];
  const colors = [0xffb6c1, 0x00ff00, 0x0000ff]; // Red, Green, Blue

  // Create separate instanced meshes for each geometry type
  const mesh1 = new THREE.InstancedMesh(geometries[0], material, objCount);
  const mesh2 = new THREE.InstancedMesh(geometries[1], material, objCount);
  const mesh3 = new THREE.InstancedMesh(geometries[2], material, objCount);

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < objCount; i++) {
    const props = dummyProps[i];
    const randomGeo = geometries[Math.floor(Math.random() * geometries.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    dummy.position.set(props.position.x, props.position.y, props.position.z);
    dummy.rotation.set(props.rotation.x, props.rotation.y, props.rotation.z);
    dummy.scale.set(props.scale, props.scale, props.scale);
    dummy.updateMatrix();

    if (randomGeo === geometries[0]) {
      mesh1.setMatrixAt(i, dummy.matrix);
      mesh1.setColorAt(i, color.set(randomColor));
    } else if (randomGeo === geometries[1]) {
      mesh2.setMatrixAt(i, dummy.matrix);
      mesh2.setColorAt(i, color.set(randomColor));
    } else {
      mesh3.setMatrixAt(i, dummy.matrix);
      mesh3.setColorAt(i, color.set(randomColor));
    }
  }

  return [mesh1, mesh2, mesh3];
}

export function getFXScene({ renderer, material, clearColor, needsAnimatedColor = false }) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const camera = new THREE.PerspectiveCamera(50, w / h, 1, 10000);
  camera.position.z = 2000;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(clearColor, 0.0002);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 1.0));

  const [mesh1, mesh2, mesh3] = getMesh(material);
  scene.add(mesh1);
  scene.add(mesh2);
  scene.add(mesh3);

  const fbo = new THREE.WebGLRenderTarget(w, h);

  const rotationSpeed = new THREE.Vector3(0.1, -0.2, 0.15);
  const update = (delta) => {
    mesh1.rotation.x += delta * rotationSpeed.x;
    mesh1.rotation.y += delta * rotationSpeed.y;
    mesh1.rotation.z += delta * rotationSpeed.z;
    mesh2.rotation.x += delta * rotationSpeed.x;
    mesh2.rotation.y += delta * rotationSpeed.y;
    mesh2.rotation.z += delta * rotationSpeed.z;
    mesh3.rotation.x += delta * rotationSpeed.x;
    mesh3.rotation.y += delta * rotationSpeed.y;
    mesh3.rotation.z += delta * rotationSpeed.z;

    if (needsAnimatedColor) {
      material.color.setHSL(0.1 + 0.5 * Math.sin(0.0002 * Date.now()), 1, 0.5);
    }
  };

  const render = (delta, rtt) => {
    update(delta);

    renderer.setClearColor(clearColor);

    if (rtt) {
      renderer.setRenderTarget(fbo);
      renderer.clear();
      renderer.render(scene, camera);
    } else {
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    }
  };

  return { fbo, render, update };
};
