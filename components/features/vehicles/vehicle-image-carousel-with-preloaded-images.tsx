"use client";

import * as React from "react";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslations } from "next-intl";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface VehicleImageCarouselWithPreloadedImagesProps {
  images?: Id<"_storage">[];
  mainImageId?: Id<"_storage">;
  vehicleName: string;
  mainImageUrl: string | null;
  imageUrls: Record<string, string>;
}

export function VehicleImageCarouselWithPreloadedImages({
  images,
  vehicleName,
  mainImageUrl,
  imageUrls,
}: VehicleImageCarouselWithPreloadedImagesProps) {
  const t = useTranslations("vehicleImageCarousel");
  const [mainApi, setMainApi] = React.useState<CarouselApi>();
  const [thumbApi, setThumbApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

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

  React.useEffect(() => {
    if (images && images.length > 0 && mainApi && thumbApi) {
      mainApi.scrollTo(0);
      thumbApi.scrollTo(0);
      setCurrent(0);
    }
  }, [images, mainApi, thumbApi]);

  const getImageUrl = (imageId: Id<"_storage">): string | null => {
    return imageUrls[imageId.toString()] || null;
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Carousel setApi={setMainApi} className="w-full">
          <CarouselContent>
            {images && images.length > 0 ? (
              images.map((imageId, index) => {
                const url = getImageUrl(imageId);
                return (
                  <CarouselItem key={imageId}>
                    <div className="aspect-[4/3] relative w-full bg-muted overflow-hidden rounded-lg">
                      {url ? (
                        <Image
                          src={url}
                          alt={`${vehicleName} - Image ${index + 1}`}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          priority={index === 0}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <span>{t("loadingImage")}</span>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                );
              })
            ) : (
              <CarouselItem>
                <div className="aspect-[4/3] relative w-full bg-muted overflow-hidden rounded-lg flex items-center justify-center">
                  {mainImageUrl ? (
                    <Image
                      src={mainImageUrl}
                      alt={vehicleName}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <span className="text-muted-foreground">
                      {t("noImageAvailable")}
                    </span>
                  )}
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
              {images.map((imageId, index) => {
                const url = getImageUrl(imageId);
                return (
                  <CarouselItem key={imageId} className="basis-auto pl-2">
                    <button
                      type="button"
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
                      {url ? (
                        <Image
                          src={url}
                          alt={`${vehicleName} thumbnail ${index + 1}`}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted text-muted-foreground text-xs">
                          <span>{t("loading")}</span>
                        </div>
                      )}
                    </button>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
      )}
    </div>
  );
}