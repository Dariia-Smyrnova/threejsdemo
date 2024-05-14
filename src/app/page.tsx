"use client"
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Sphere } from "./components/Sphere";

const Cube = ({ position, color }) => {
  const ref = useRef()

  useFrame((state, delta) => {
    ref.current.rotation.x += delta
    ref.current.rotation.y += delta
    ref.current.position.z = Math.sin(state.clock.elapsedTime) * 2
  })
  return (
    <mesh position={position} ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>)
}



export default function Home() {
  return (<div style={{ width: '100%', height: '100%', position: 'absolute' }}>
    <Canvas >
      <directionalLight position={[0, 5, 5]} />
      <ambientLight intensity={2} />
      <Sphere position={[2, 0, 0]} color="red" />
    </Canvas>
  </div>)

}
