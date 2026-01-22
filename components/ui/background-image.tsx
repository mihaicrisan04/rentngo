"use client";

import React from "react";

interface BackgroundImageProps {
  bottomGradient?: boolean;
}

export function BackgroundImage({ bottomGradient = true }: BackgroundImageProps) {
  return (
    <div
      className={`absolute inset-x-0 top-0 w-full h-[75vh] -z-10 bg-[url('/mercedes-background.png')] bg-cover bg-top ${
        bottomGradient 
          ? "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1/3 after:bg-gradient-to-t after:from-background after:to-transparent after:pointer-events-none"
          : ""
      }`}
      aria-hidden="true" // Good for accessibility as it's decorative
    />
  );
} 
