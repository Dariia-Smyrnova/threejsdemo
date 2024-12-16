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

// Add this helper function before the GridBox component
function getShapeEdgeCoordinates(baseX: number, baseY: number, shape: number[][]) {
    return shape.map(([offsetX, offsetY]) => ({
        x: baseX + offsetX,
        y: baseY + offsetY
    }));
}

// Add this helper function to check if a cell is occupied
function isPositionOccupied(x: number, y: number, placedShapes: PlacedShape[]): boolean {
    return placedShapes.some(placedShape => 
        placedShape.shape.some(([offsetX, offsetY]) => 
            placedShape.x + offsetX === x && placedShape.y + offsetY === y
        )
    );
}

// Add this function to check if a shape can be placed
function canPlaceShape(baseX: number, baseY: number, shape: number[][], placedShapes: PlacedShape[]): boolean {
    return shape.every(([offsetX, offsetY]) => {
        const x = baseX + offsetX;
        const y = baseY + offsetY;
        return !isPositionOccupied(x, y, placedShapes);
    });
}

// Add this function to get overlapping cells
function getOverlappingCells(baseX: number, baseY: number, shape: number[][], placedShapes: PlacedShape[]): {x: number, y: number}[] {
    return shape.reduce<{x: number, y: number}[]>((overlaps, [offsetX, offsetY]) => {
        const x = baseX + offsetX;
        const y = baseY + offsetY;
        if (isPositionOccupied(x, y, placedShapes)) {
            overlaps.push({ x, y });
        }
        return overlaps;
    }, []);
}

function GridBox(props: any) {
    const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
    const textureRef = useRef<any>();
    const group = useRef<any>();
    const mouseUV = useRef(new Vector2());
    const context = useRef<CanvasRenderingContext2D | null>(canvasRef.current.getContext("2d"));
    const [isDragging, setIsDragging] = useState(false);
    const [currentShape, setCurrentShape] = useState<ShapeType>("lShape");
    const [placedShapes, setPlacedShapes] = useState<PlacedShape[]>([]);
    const [draggedShape, setDraggedShape] = useState<PlacedShape | null>(null);
    const [previewPosition, setPreviewPosition] = useState({ x: 0, y: gridSize - 1 }); // Upper left corner
    const [overlappingCells, setOverlappingCells] = useState<{x: number, y: number}[]>([]);

    const handleClick = (e: any) => {
        const cellX = Math.floor(e.uv.x * gridSize);
        const cellY = 16 - Math.floor(e.uv.y * gridSize);
        
        if (!isDragging) {
            // Start dragging
            setIsDragging(true);
            const shapeArray = shapes[currentShape] as number[][];
            setDraggedShape({
                shape: shapeArray,
                x: previewPosition.x,
                y: previewPosition.y
            });
        } else {
            // Try to place the shape
            const shapeArray = shapes[currentShape] as number[][];
            
            if (canPlaceShape(cellX, cellY, shapeArray, placedShapes)) {
                setIsDragging(false);
                
                const edgeCoordinates = getShapeEdgeCoordinates(cellX, cellY, shapeArray);
                console.log('Shape placed at:', {
                    basePosition: { x: cellX, y: cellY },
                    edges: edgeCoordinates
                });

                setPlacedShapes(prev => [...prev, {
                    shape: shapeArray,
                    x: cellX,
                    y: cellY
                }]);
                setDraggedShape(null);
                setOverlappingCells([]);
            }
        }
    };

    // Cycle through shapes on right click
    const handleContextMenu = (e: any) => {
        e.preventDefault();
        const shapeKeys = Object.keys(shapes) as ShapeType[];
        const currentIndex = shapeKeys.indexOf(currentShape);
        const nextIndex = (currentIndex + 1) % shapeKeys.length;
        setCurrentShape(shapeKeys[nextIndex]);
    };

    // Add a new handler for mouse movement during drag
    const handlePointerMove = (e: any) => {
        const cellX = Math.floor(e.uv.x * gridSize);
        const cellY = 16 - Math.floor(e.uv.y * gridSize);
        
        if (isDragging) {
            setDraggedShape(prev => prev ? {
                ...prev,
                x: cellX,
                y: cellY
            } : null);

            // Update overlapping cells
            if (draggedShape) {
                const overlaps = getOverlappingCells(cellX, cellY, draggedShape.shape, placedShapes);
                setOverlappingCells(overlaps);
            }
        }
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

        // Draw either the preview in upper left or the dragging shape
        if (isDragging && draggedShape) {
            // Draw the shape
            drawShape(
                ctx,
                gridSize,
                canvasSize,
                draggedShape.x,
                draggedShape.y,
                draggedShape.shape,
                "rgba(255, 255, 255, 0.5)"
            );

            // Draw overlapping cells in red
            overlappingCells.forEach(({x, y}) => {
                drawCell(
                    ctx,
                    gridSize,
                    canvasSize,
                    x,
                    y,
                    "rgba(255, 0, 0, 0.5)"
                );
            });
        } else {
            // Draw preview in upper left corner
            drawShape(
                ctx,
                gridSize,
                canvasSize,
                previewPosition.x,
                previewPosition.y,
                shapes[currentShape] as number[][],
                "rgba(255, 255, 255, 0.5)"
            );
        }
        
        drawGrid(ctx, gridSize, canvasSize);

        if (textureRef.current) {
            textureRef.current.needsUpdate = true;
        }
    });

    return (
        <group ref={group} {...props}>
            <mesh
                rotation={[degToRad(-90), 0, 0]}
                onPointerMove={handlePointerMove}
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
                Click to drag shape • Right-click to change shape
            </div>
        </div>
    );
}