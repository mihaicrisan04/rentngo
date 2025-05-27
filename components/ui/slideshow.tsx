"use client";

import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";

interface SlideData {
  id: string;
  image: string;
  title?: string;
  description?: string;
  alt: string;
}

interface SlideshowProps {
  slides?: SlideData[];
  autoplay?: boolean;
  autoplayDelay?: number;
  showIndicators?: boolean;
  className?: string;
}

// Default slides with placeholder images
const defaultSlides: SlideData[] = [
  {
    id: "1",
    image: "/slideshow/banner1.png",
    // title: "Adventure Awaits",
    // description: "Perfect vehicles for your next adventure in Cluj-Napoca",
    alt: "Cars ready for adventure and exploration",
  },
  {
    id: "2",
    image: "/slideshow/banner2.png",
    // title: "Adventure Awaits",
    // description: "Perfect vehicles for your next adventure in Cluj-Napoca",
    alt: "Cars ready for adventure and exploration",
  },
];

export function Slideshow({
  slides = defaultSlides,
  autoplay = true,
  autoplayDelay = 5000,
  showIndicators = true,
  className,
}: SlideshowProps) {
  const [api, setApi] = React.useState<any>();
  const [current, setCurrent] = React.useState(0);

  const autoplayPlugin = React.useMemo(
    () => (autoplay ? [Autoplay({ delay: autoplayDelay })] : []),
    [autoplay, autoplayDelay]
  );

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className={`relative w-full ${className || ""}`}>
      <Carousel
        setApi={setApi}
        className="w-full"
        plugins={autoplayPlugin}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <Card className="border-0">
                <CardContent className="relative p-0 h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    priority={slide.id === "1"}
                  />
                  {(slide.title || slide.description) && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="text-center text-white px-4 max-w-4xl">
                        {slide.title && (
                          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                            {slide.title}
                          </h2>
                        )}
                        {slide.description && (
                          <p className="text-lg md:text-xl lg:text-2xl opacity-90">
                            {slide.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="left-4 md:left-8 bg-white/10 border-white/20 hover:bg-white/20 text-white" />
        <CarouselNext className="right-4 md:right-8 bg-white/10 border-white/20 hover:bg-white/20 text-white" />
      </Carousel>

      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === current
                  ? "bg-white scale-110"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 