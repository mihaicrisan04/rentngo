"use client";

import React from "react";
import Image from "next/image";

interface BackgroundImageProps {
  bottomGradient?: boolean;
}

export function BackgroundImage({
  bottomGradient = true,
}: BackgroundImageProps) {
  return (
    <div
      className="absolute inset-x-0 top-0 w-full h-[75vh] -z-10 overflow-hidden"
      aria-hidden="true" // Good for accessibility as it's decorative
    >
      {/*
        Rendered through next/image (instead of a CSS background-image) so the
        1.9 MB source PNG is served resized and re-encoded as AVIF/WebP, and
        `priority` emits a preload hint for this LCP element.
      */}
      <Image
        src="/mercedes-background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />
      {bottomGradient && (
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      )}
    </div>
  );
}
