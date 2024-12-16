"use client"
import { Canvas, extend } from "@react-three/fiber";
import Image from 'next/image'
import card from '@/public/CARD.svg'
import { Sphere } from "@/app/components/Sphere";

extend({ Image })


export default function Card() {
    return (
        <div className="w-full h-full absolute flex items-center justify-center">
            <div className="w-1/2 h-1/2 bg-contain bg-[url('/BG.svg')] bg-center bg-no-repeat flex items-center justify-center">
            <Image src={card} alt="card" className="absolute z-10 backdrop-blur-md"/>
            <Canvas className="absolute">
                {/* <directionalLight position={[0, 2, 2]} /> */}
                <ambientLight intensity={3} />
            <Sphere position={[2.3, 0.3, 0]} color="#eea8ff" args={[0.9, 32, 32]}/>
            <Sphere position={[0.1, 1.3, 0]} color="#eea8ff" args={[0.7, 32, 32]}/>
            <Sphere position={[-2, -0.8, 0]} color="#eea8ff" args={[1.35, 32, 32]}/>
            </Canvas>
            </div>
        </div>
    )
}