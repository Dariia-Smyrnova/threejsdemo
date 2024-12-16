import { useFrame, useLoader } from "@react-three/fiber"
import { useRef, useState } from "react"
import { TextureLoader } from 'three/src/loaders/TextureLoader'

export const Sphere = ({ position, color, args }) => {
    const colorMap = useLoader(TextureLoader, 'textures/matcaps/8.png')

    const ref = useRef()
    let [isHovered, setIsHovered] = useState(false)

    useFrame((state, delta) => {
        const speed = isHovered ? 1 : 0.2
    })

    return (
        <mesh position={position}
            ref={ref}
            onPointerEnter={(e) => (e.stopPropagation(), setIsHovered(true))}
            onPointerLeave={() => setIsHovered(false)}
        >
            <sphereGeometry args={args} />
            <meshMatcapMaterial
                matcap={colorMap}
            />
        </mesh>
    )
}