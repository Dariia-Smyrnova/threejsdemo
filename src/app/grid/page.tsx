'use client'

import { Canvas } from '@react-three/fiber'
import { Grid, Center, OrbitControls, DragControls, OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'

type DragControlsProps = {
    /** If autoTransform is true, automatically apply the local transform on drag, true */
    autoTransform?: boolean
    /** The matrix to control */
    matrix?: THREE.Matrix4
    /** Lock the drag to a specific axis */
    axisLock?: 'x' | 'y' | 'z'
    /** Limits */
    dragLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined]
    /** Hover event */
    onHover?: (hovering: boolean) => void
    /** Drag start event */
    onDragStart?: (origin: THREE.Vector3) => void
    /** Drag event */
    onDrag?: (
        localMatrix: THREE.Matrix4,
        deltaLocalMatrix: THREE.Matrix4,
        worldMatrix: THREE.Matrix4,
        deltaWorldMatrix: THREE.Matrix4
    ) => void
    /** Drag end event */
    onDragEnd?: () => void
    children: React.ReactNode
}


export default function GridPage() {
    return (
        <div className="w-full h-screen">
            <Canvas>
                <OrthographicCamera
                    makeDefault
                    position={[0, 10, 0]}
                    zoom={50}
                />
                <color attach="background" args={['#f0f0f0']} />
                
                <ambientLight intensity={1} />
                <directionalLight position={[0, 10, 0]} intensity={1} />

                <Grid
                    args={[10, 10]}
                    cellSize={0.5}
                    cellThickness={0.5}
                    cellColor="#6f6f6f"
                    sectionSize={2}
                    sectionThickness={1}
                    sectionColor="#4286f4"
                    fadeDistance={30}
                    fadeStrength={1}
                />

                <OrbitControls
                    makeDefault
                    enableRotate={false}
                    enableZoom={true}
                    enablePan={true}
                    minPolarAngle={0}
                    maxPolarAngle={0}
                />

                <Center top position={[3, 0, 1]}>
                    <DragControls>
                        <mesh rotation={[0, 0, 0]}>
                            <boxGeometry args={[0.5, 0.1, 0.5]} />
                            <meshStandardMaterial color="#9d4b4b" />
                        </mesh>
                    </DragControls>
                </Center>
            </Canvas>
        </div>
    )
}
