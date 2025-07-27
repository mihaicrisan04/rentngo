"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import Image from "next/image";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useTranslations } from 'next-intl';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface VehicleImageCarouselProps {
  images?: Id<"_storage">[];
  mainImageId?: Id<"_storage">;
  vehicleName: string;
}

export function VehicleImageCarousel({ 
  images, 
  vehicleName 
}: VehicleImageCarouselProps) {
  const t = useTranslations('vehicleImageCarousel');
  const [mainApi, setMainApi] = React.useState<CarouselApi>();
  const [thumbApi, setThumbApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  // Synchronize the carousels
  React.useEffect(() => {
    if (!mainApi || !thumbApi) return;

    const handleMainSelect = () => {
      const selected = mainApi.selectedScrollSnap();
      setCurrent(selected);
      thumbApi.scrollTo(selected);
    };

    const handleThumbSelect = () => {
      const selected = thumbApi.selectedScrollSnap();
      setCurrent(selected);
      mainApi.scrollTo(selected);
    };

    mainApi.on("select", handleMainSelect);
    thumbApi.on("select", handleThumbSelect);

    return () => {
      mainApi.off("select", handleMainSelect);
      thumbApi.off("select", handleThumbSelect);
    };
  }, [mainApi, thumbApi]);

  // Set initial slide based on main image
  React.useEffect(() => {
    if (images && images.length > 0 && mainApi && thumbApi) {
      // Always start from the first image (index 0) instead of jumping to main image
      // This provides a better user experience as requested
      mainApi.scrollTo(0);
      thumbApi.scrollTo(0);
      setCurrent(0);
    }
  }, [images, mainApi, thumbApi]); // Removed mainImageId dependency

  return (
    <div className="space-y-4">
      {/* Main Image Carousel */}
      <div className="relative">
        <Carousel setApi={setMainApi} className="w-full">
          <CarouselContent>
            {images && images.length > 0 ? (
              images.map((imageId, index) => (
                <CarouselItem key={imageId}>
                  <div className="aspect-[4/3] relative w-full bg-muted overflow-hidden rounded-lg">
                    <VehicleMainImage 
                      imageId={imageId}
                      alt={`${vehicleName} - Image ${index + 1}`}
                      loadingText={t('loadingImage')}
                    />
                  </div>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem>
                <div className="aspect-[4/3] relative w-full bg-muted overflow-hidden rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">{t('noImageAvailable')}</span>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          {images && images.length > 1 && (
            <>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>
          )}
        </Carousel>
      </div>

      {/* Thumbnail Carousel */}
      {images && images.length > 1 && (
        <div className="w-full">
          <Carousel
            setApi={setThumbApi}
            opts={{
              containScroll: "keepSnaps",
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 p-2">
              {images.map((imageId, index) => (
                <CarouselItem key={imageId} className="basis-auto pl-2">
                  <div
                    className={`w-20 h-20 relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      current === index
                        ? "border-yellow-500 ring-2 ring-yellow-500 ring-offset-2"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      mainApi?.scrollTo(index);
                      thumbApi?.scrollTo(index);
                    }}
                  >
                    <VehicleThumbnailImage 
                      imageId={imageId}
                      alt={`${vehicleName} thumbnail ${index + 1}`}
                      loadingText={t('loading')}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )}
    </div>
  );
}

// Component for main carousel images
function VehicleMainImage({ 
  imageId, 
  alt,
  loadingText
}: { 
  imageId: Id<"_storage">; 
  alt: string;
  loadingText: string;
}) {
  const imageUrl = useQuery(api.vehicles.getImageUrl, { imageId });

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <span>{loadingText}</span>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      style={{ objectFit: "cover" }}
      sizes="(max-width: 1024px) 100vw, 50vw"
      priority
    />
  );
}

// Component for thumbnail carousel images
function VehicleThumbnailImage({ 
  imageId, 
  alt,
  loadingText
}: { 
  imageId: Id<"_storage">; 
  alt: string;
  loadingText: string;
}) {
  const imageUrl = useQuery(api.vehicles.getImageUrl, { imageId });

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-muted text-muted-foreground text-xs">
        <span>{loadingText}</span>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      style={{ objectFit: "cover" }}
      sizes="80px"
    />
  );
} 
