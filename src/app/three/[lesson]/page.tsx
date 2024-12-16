"use client";
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import GUI from "lil-gui"
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const gui = new GUI()
gui.add({ color: '#ff0000' }, 'color')

const sizes = {
  width: window?.innerWidth ?? 800,
  height: window?.innerHeight ?? 600
}

const cursor = {
  x: 0,
  y: 0
}

const loadingManager = new THREE.LoadingManager();
loadingManager.onError = () => {
  console.log('error');
}
const texture = new THREE.TextureLoader().load('/textures/minecraft.png');
texture.colorSpace = THREE.SRGBColorSpace

export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const handleMouseMove = (event: MouseEvent) => {
      cursor.x = event.clientX / sizes.width - 0.5;
      cursor.y = -(event.clientY / sizes.height - 0.5);
    }
    window.addEventListener('mousemove', handleMouseMove);

    const scene = new THREE.Scene();
    const geometry = new THREE.BoxGeometry();
    const materialT = new THREE.MeshBasicMaterial({ map: texture });
    const material = new THREE.MeshStandardMaterial();
    material.metalness = 0.5;
    material.roughness = 0.5;

    const cube = new THREE.Mesh(geometry, material);
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), material);
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material);
    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 32, 64), material);
    cube.position.x = 0.7;
    sphere.position.x = -0.7;
    torus.position.y = 0.7;
    plane.rotation.x = -Math.PI * 0.5;
    scene.add(cube, sphere, plane, torus);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 30)
    pointLight.position.x = 2
    pointLight.position.y = 3
    pointLight.position.z = 4
    scene.add(pointLight)

    const rgbeLoader = new RGBELoader()
    rgbeLoader.load('/textures/2k.hdr', (environmentMap) => {
      environmentMap.mapping = THREE.EquirectangularReflectionMapping
      scene.background = environmentMap
      scene.environment = environmentMap
    })

    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
    camera.position.z = 2

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(sizes.width, sizes.height);
    containerRef.current.appendChild(renderer.domElement);
    
    const clock = new THREE.Clock();

    let animationFrameId: number;
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
      camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
      camera.position.y = cursor.y * 5;
      camera.lookAt(cube.position)
      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(tick);
    }
    tick();

    const handleResize = () => {
      sizes.width = window.innerWidth
      sizes.height = window.innerHeight

      camera.aspect = sizes.width / sizes.height
      camera.updateProjectionMatrix()

      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      materialT.dispose();
      texture.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      gui.destroy();
      window.removeEventListener('resize', handleResize)
    };
  }, []);

  return <div ref={containerRef} id='uniqueDiv' className="fixed top-0 left-0 w-screen h-screen" />;
};
