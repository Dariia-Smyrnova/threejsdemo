"use client";
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const sizes = {
  width: window?.innerWidth ?? 800,
  height: window?.innerHeight ?? 600
}

export default function CameraScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Create horizontal grid effect (bottom half)
    const gridGeometry = new THREE.BufferGeometry();
    const gridPoints: number[] = [];
    const rows = 20;    // rows going into z-direction
    const cols = 30;    // columns along x-axis
    const width = 6;    // total width of the grid
    const depth = 10;   // total depth of the grid

    for (let i = 0; i < rows; i++) {
      const z = (i / rows) * -depth; // Spread rows along z-axis
      for (let j = 0; j < cols; j++) {
        const x = (j / (cols - 1)) * width - width / 2; // Spread points along x-axis
        const y = -1.5; // Fixed y position in bottom half
        gridPoints.push(x, y, z);
      }
    }

    gridGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(gridPoints, 3)
    );

    const gridMaterial = new THREE.PointsMaterial({
      color: 0x0088ff,
      size: 0.05,
      sizeAttenuation: true
    });

const grid = new THREE.Points(gridGeometry, gridMaterial);
    scene.add(grid);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.z = 3;
    camera.position.y = 0; // Adjust camera position to better view the horizontal grid

    // Renderer setup
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Animation
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      // Animate grid points
      const positions = gridGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        // Move points toward camera
        positions[i + 2] += 0.05;
        
        // Reset points that get too close
        if (positions[i + 2] > 3) {
          positions[i + 2] = -depth;
        }
      }
      gridGeometry.attributes.position.needsUpdate = true;

      // Render
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      gridGeometry.dispose();
      gridMaterial.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="fixed top-0 left-0 w-screen h-screen" />;
}
