"use client";
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const sizes = {
  width: 800,
  height: 600
}

export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const scene = new THREE.Scene();
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
      camera.position.z = 5
      camera.position.x = 2

      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(sizes.width, sizes.height);
      containerRef.current?.appendChild(renderer.domElement);
      renderer.render(scene, camera);
    }
  }, []);
  return <div ref={containerRef} id='uniqueDiv'/>;
};
