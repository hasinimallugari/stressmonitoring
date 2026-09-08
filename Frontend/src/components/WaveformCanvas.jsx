import React, { useEffect, useRef } from 'react';

export default function WaveformCanvas({ isActive, isMuted }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        let phase = 0;

        const render = () => {
            if (!isActive) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const width = canvas.width;
            const height = canvas.height;
            const centerY = height / 2;

            if (isMuted) {
                ctx.beginPath();
                ctx.moveTo(0, centerY);
                ctx.lineTo(width, centerY);
                ctx.strokeStyle = "rgba(100, 115, 90, 0.3)";
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = "#486e2e";

                for (let x = 0; x < width; x++) {
                    const angle = (x / width) * Math.PI * 4 + phase;
                    const amplitude = Math.sin(x * 0.02 + phase) * 20 + 5;
                    const y = centerY + Math.sin(angle) * amplitude;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
                phase += 0.06;
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isActive, isMuted]);

    return (
        <canvas 
            ref={canvasRef} 
            width={300} 
            height={80} 
            className="waveform-canvas" 
            id="vc-waveform" 
        />
    );
}
