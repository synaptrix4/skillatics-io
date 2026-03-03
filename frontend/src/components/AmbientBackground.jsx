// src/components/AmbientBackground.jsx
import React from 'react';

export default function AmbientBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-white/50 backdrop-blur-3xl">
            {/* Main Top Center Sarvam Glow - Adjusted opacities for white bg */}
            <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] rounded-[100%] bg-orange-500/20 blur-[120px]" />
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[40vw] h-[40vh] rounded-[100%] bg-amber-400/20 blur-[100px]" />
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] rounded-[100%] bg-orange-300/10 blur-[100px]" />

            {/* Noise texture for premium feel */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>
    );
}
