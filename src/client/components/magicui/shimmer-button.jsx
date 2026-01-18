
import React from 'react';
import { cn } from '@/lib/utils';

export const ShimmerButton = React.forwardRef(({
    shimmerColor = "#ffffff",
    shimmerSize = "0.05em",
    shimmerDuration = "3s",
    borderRadius = "100px",
    background = "rgba(0, 0, 0, 1)",
    className,
    children,
    ...props
}, ref) => {
    return (
        <button
            style={{
                "--spread": "90deg",
                "--shimmer-color": shimmerColor,
                "--radius": borderRadius,
                "--speed": shimmerDuration,
                "--cut": shimmerSize,
                "--bg": background,
            }}
            className={cn(
                "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)]",
                "transform-gpu transition-all duration-300 ease-in-out hover:scale-105 active:scale-95",
                "shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(214,75,23,0.4)]",
                "backdrop-blur-md", // Added backdrop blur for glass effect
                className
            )}
            ref={ref}
            {...props}
        >
            {/* Liquid Shimmer Border */}
            <div
                className={cn(
                    "-z-30",
                    "absolute inset-0 overflow-visible [container-type:size]",
                )}
            >
                <div className="absolute inset-0 h-[100cqh] animate-spin-around [aspect-ratio:1] [border-radius:0] [mask:none]">
                    {/* Uniform gradient for smoother border */}
                    <div className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0] opacity-60" />
                </div>
            </div>
            {children}

            {/* Inner Glass Highlight */}
            <div
                className={cn(
                    "absolute inset-0 pointer-events-none rounded-[inherit]",
                    // Refined inner shadow for glass depth
                    "shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(0,0,0,0.3)]",
                )}
            />

            {/* Background Overlay for Depth */}
            <div
                className={cn(
                    "absolute -z-20 [background:rgba(20,20,30,0.6)] [border-radius:var(--radius)] [inset:var(--cut)]",
                    // Ensure the background is slightly dark but translucent
                )}
            />
        </button>
    );
});

ShimmerButton.displayName = "ShimmerButton";
