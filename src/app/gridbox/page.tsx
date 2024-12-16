"use client"
import React, { useRef, useState } from "react";
import "./styles.css";
import { Canvas, useFrame } from "@react-three/fiber";
import { MathUtils, Vector2 } from "three";
const { degToRad } = MathUtils;

let gridSize = 16;
const canvasSize = 1024;

// Define some basic shapes
const shapes = {
    square: [[0, 0]],
    line: [[0, 0], [0, 1], [0, 2]],
    cross: [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]],
    lShape: [[0, 0], [0, 1], [1, 0]],
} as const;

type ShapeType = keyof typeof shapes;

function drawShape(
    ctx: CanvasRenderingContext2D, 
    gridSize: number, 
    canvasSize: number, 
    baseX: number, 
    baseY: number, 
    shape: number[][], 
    color = "yellow"
) {
    shape.forEach(([offsetX, offsetY]) => {
        const cellX = baseX + offsetX;
        const cellY = baseY + offsetY;
        if (cellX >= 0 && cellX < gridSize && cellY >= 0 && cellY < gridSize) {
            drawCell(ctx, gridSize, canvasSize, cellX, cellY, color);
        }
    });
}

function drawCell(
    ctx: CanvasRenderingContext2D, 
    gridSize: number, 
    canvasSize: number, 
    cellX: number, 
    cellY: number, 
    color = "yellow"
) {
    ctx.fillStyle = color;
    ctx.fillRect(
        cellX * (canvasSize / gridSize),
        cellY * (canvasSize / gridSize),
        canvasSize / gridSize,
        canvasSize / gridSize
    );
}

function drawGrid(ctx: CanvasRenderingContext2D, gridSize: number, canvasSize: number) {
    for (let i = 0; i < gridSize + 1; i++) {
        const x = i * (canvasSize / gridSize);
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "green";
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize);
        ctx.moveTo(0, x);
        ctx.lineTo(canvasSize, x);
        ctx.stroke();
    }
}

interface PlacedShape {
    shape: number[][];
    x: number;
    y: number;
}

function GridBox(props: any) {
    const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
    const textureRef = useRef<any>();
    const group = useRef<any>();
    const mouseUV = useRef(new Vector2());
    const context = useRef<CanvasRenderingContext2D | null>(canvasRef.current.getContext("2d"));
    const [isDragging, setIsDragging] = useState(false);
    const [currentShape, setCurrentShape] = useState<ShapeType>("cross");
    const [placedShapes, setPlacedShapes] = useState<PlacedShape[]>([]);

    const handleClick = (e: any) => {
        const cellX = Math.floor(e.uv.x * gridSize);
        const cellY = 16 - Math.floor(e.uv.y * gridSize);
        
        setPlacedShapes(prev => [...prev, {
            shape: shapes[currentShape],
            x: cellX,
            y: cellY
        }]);
    };

    // Cycle through shapes on right click
    const handleContextMenu = (e: any) => {
        e.preventDefault();
        const shapeKeys = Object.keys(shapes) as ShapeType[];
        const currentIndex = shapeKeys.indexOf(currentShape);
        const nextIndex = (currentIndex + 1) % shapeKeys.length;
        setCurrentShape(shapeKeys[nextIndex]);
    };

    useFrame(() => {
        if (!context.current) return;
        
        canvasRef.current.width = canvasSize;
        canvasRef.current.height = canvasSize;
        const ctx = context.current;
        ctx.clearRect(0, 0, canvasSize, canvasSize);

        // Draw all placed shapes
        placedShapes.forEach(({ shape, x, y }) => {
            drawShape(ctx, gridSize, canvasSize, x, y, shape, "white");
        });

        // Draw current shape preview at mouse position
        const previewX = Math.floor(mouseUV.current.x * gridSize);
        const previewY = 16 - Math.floor(mouseUV.current.y * gridSize);
        drawShape(
            ctx,
            gridSize,
            canvasSize,
            previewX,
            previewY,
            shapes[currentShape],
            "rgba(255, 255, 255, 0.5)"
        );
        
        drawGrid(ctx, gridSize, canvasSize);

        if (textureRef.current) {
            textureRef.current.needsUpdate = true;
        }
    });

    return (
        <group ref={group} {...props}>
            <mesh
                rotation={[degToRad(-90), 0, 0]}
                onPointerMove={(e) => (mouseUV.current = e.uv)}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                onPointerOver={() => document.body.style.cursor = "none"}
                onPointerOut={() => document.body.style.cursor = "pointer"}
            >
                <planeGeometry args={[5, 5]} />
                <meshBasicMaterial>
                    <canvasTexture
                        ref={textureRef}
                        attach="map"
                        image={canvasRef.current}
                    />
                </meshBasicMaterial>
            </mesh>
        </group>
    );
}

export default function GridBoxPage() {
    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
            <Canvas shadows camera={{ position: [0, 5, 0], fov: 75 }}>
                <ambientLight />
                <GridBox />
            </Canvas>
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '10px',
                borderRadius: '5px'
            }}>
                Right-click to change shape
            </div>
        </div>
    );
}