import { useFrame } from "@react-three/fiber"
import { useRef, useState } from "react"

export const Sphere = ({ position, color, args }) => {
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
            <meshStandardMaterial
                color={color}
            />
        </mesh>
    )
}