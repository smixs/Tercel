"use client" 

import * as React from "react"
import { useState, useRef } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MousePointerClick } from "lucide-react";
import { VariantProps } from "class-variance-authority";

interface ParticleButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
    onSuccess?: () => void;
    successDuration?: number;
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
}

function SuccessParticles({
    buttonRef,
}: {
    buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    return (
        <AnimatePresence>
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="fixed w-1 h-1 bg-black dark:bg-white rounded-full"
                    style={{ left: centerX, top: centerY }}
                    initial={{
                        scale: 0,
                        x: 0,
                        y: 0,
                    }}
                    animate={{
                        scale: [0, 1, 0],
                        x: [0, (i % 2 ? 1 : -1) * (Math.random() * 50 + 20)],
                        y: [0, -Math.random() * 50 - 20],
                    }}
                    transition={{
                        duration: 0.6,
                        delay: i * 0.1,
                        ease: "easeOut",
                    }}
                />
            ))}
        </AnimatePresence>
    );
}

function ParticleButton({
    children,
    onClick,
    onSuccess,
    successDuration = 1000,
    className,
    variant,
    size,
    ...props
}: ParticleButtonProps) {
    const [showParticles, setShowParticles] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        setShowParticles(true);
        
        if (onClick) {
            onClick(e);
        }
        
        if (onSuccess) {
            onSuccess();
        }

        setTimeout(() => {
            setShowParticles(false);
        }, successDuration);
    };

    return (
        <>
            {showParticles && <SuccessParticles buttonRef={buttonRef} />}
            <Button
                ref={buttonRef}
                onClick={handleClick}
                className={cn(
                    "relative",
                    showParticles && "scale-95",
                    "transition-transform duration-100",
                    className
                )}
                variant={variant}
                size={size}
                {...props}
            >
                {children}
            </Button>
        </>
    );
}

export { ParticleButton } 