import { useRef, useEffect, useState } from 'react';

const Squares = ({
    direction = 'right',
    speed = 0.5,
    borderColor = '#999',
    squareSize = 40,
    hoverFillColor = '#222',
}) => {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const numSquaresX = useRef();
    const numSquaresY = useRef();
    const gridOffset = useRef({ x: 0, y: 0 });
    const [hoveredSquare, setHoveredSquare] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1;
            numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const drawGrid = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const startX = Math.floor(gridOffset.current.x / squareSize);
            const startY = Math.floor(gridOffset.current.y / squareSize);
            const offsetX = gridOffset.current.x % squareSize;
            const offsetY = gridOffset.current.y % squareSize;

            for (let x = 0; x < numSquaresX.current; x++) {
                for (let y = 0; y < numSquaresY.current; y++) {
                    const squareX = x * squareSize - offsetX;
                    const squareY = y * squareSize - offsetY;

                    // Draw Border
                    ctx.strokeStyle = borderColor;
                    ctx.lineWidth = 1; // Subtle border
                    ctx.strokeRect(squareX, squareY, squareSize, squareSize);

                    // Draw Hover Highlight
                    if (hoveredSquare) {
                        const drawX = (hoveredSquare.x - startX + x);
                        const drawY = (hoveredSquare.y - startY + y);
                        // This logic needs to match the grid movement.
                        // Actually, simpler approach: check if this specific grid cell (adjusted for offset) matches hover.
                        // The grid moves, so "hoveredSquare" coordinates (in grid space) stay constant relative to grid, or
                        // relative to screen? relative to screen is easier for user interaction.
                    }
                }
            }

            // Simpler approach for Hover: Just fill the square under mouse based on screen coordinates vs grid offset.
            if (hoveredSquare) {
                // Calculate the aligned top-left of the square under the mouse
                // properties: mouseX, mouseY
                // The grid shifts by gridOffset.x % squareSize

                const shiftX = gridOffset.current.x % squareSize;
                const shiftY = gridOffset.current.y % squareSize;

                const hoveredGridX = Math.floor((hoveredSquare.x + shiftX) / squareSize);
                const hoveredGridY = Math.floor((hoveredSquare.y + shiftY) / squareSize);

                const drawX = hoveredGridX * squareSize - shiftX;
                const drawY = hoveredGridY * squareSize - shiftY;

                ctx.fillStyle = hoverFillColor;
                ctx.fillRect(drawX, drawY, squareSize, squareSize);
            }

            // Update offset
            switch (direction) {
                case 'right':
                    gridOffset.current.x = (gridOffset.current.x - speed + squareSize) % squareSize;
                    break;
                case 'left':
                    gridOffset.current.x = (gridOffset.current.x + speed + squareSize) % squareSize;
                    break;
                case 'down':
                    gridOffset.current.y = (gridOffset.current.y - speed + squareSize) % squareSize;
                    break;
                case 'up':
                    gridOffset.current.y = (gridOffset.current.y + speed + squareSize) % squareSize;
                    break;
                case 'diagonal':
                    gridOffset.current.x = (gridOffset.current.x - speed + squareSize) % squareSize;
                    gridOffset.current.y = (gridOffset.current.y - speed + squareSize) % squareSize;
                    break;
                default:
                    break;
            }

            requestRef.current = requestAnimationFrame(drawGrid);
        };

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setHoveredSquare({ x, y });
        };

        const handleMouseLeave = () => {
            setHoveredSquare(null);
        };

        // Use requestAnimationFrame for smooth animation
        requestRef.current = requestAnimationFrame(drawGrid);

        // Use mouse events on window if the canvas is behind everything (so pointer-events might be none on canvas if strictly background)
        // But usually we want the background to be interactive.
        // If z-index is -1, it won't receive events if content covers it.
        // So we attach listener to window, or set pointer-events: auto on canvas if appropriate, 
        // but standard page content will block it.
        // React Bits 'Squares' usually tracks mouse globally or assumes it's the layer interaction.
        // I'll attach to the canvas parent or window. Window is safer for a background.

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(requestRef.current);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [direction, speed, borderColor, hoverFillColor, hoveredSquare, squareSize]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
                // zIndex: -1, 
                pointerEvents: 'none',
            }}
        />
    );
};

export default Squares;
