"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FeaturesSectionWithHoverEffects } from "@/components/features/landing/feature-section-with-hover-effects";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TestimonialsSection } from "@/components/features/landing/testimonials-with-marquee";
import { VehicleSearchFilterForm } from "@/components/features/vehicles/vehicle-search-filter-form";
import { VehicleCardWithPreloadedImage } from "@/components/features/vehicles/vehicle-card-with-preloaded-image";
import { FaqSection } from "@/components/features/landing/faq";
import { BackgroundImage } from "@/components/ui/background-image";
import { AnimatedGroup } from "@/components/ui/animated-group";
import {
  ProgressSlider,
  SliderContent,
  SliderWrapper,
  SliderBtnGroup,
  SliderBtn,
} from "@/components/ui/progressive-carousel";
import { Vehicle } from "@/types/vehicle";
import { sectionAnimationVariants } from "@/lib/animations";
import { useTranslations } from "next-intl";
import { useVehicleSearch } from "@/hooks/use-vehicle-search";
import { SearchData } from "@/lib/search-storage";

interface VehicleWithImageUrl extends Vehicle {
  imageUrl: string | null;
}

interface HomePageClientProps {
  initialVehicles: VehicleWithImageUrl[];
  initialTitle: string;
}

function VehicleList({
  vehicles,
  searchState,
}: {
  vehicles: VehicleWithImageUrl[];
  searchState: SearchData & { isHydrated: boolean };
}) {
  const t = useTranslations("common");

  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        {t("noFeaturedCarsAvailable")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => {
        if (!vehicle || typeof vehicle._id !== "string") {
          return null;
        }
        return (
          <VehicleCardWithPreloadedImage
            key={vehicle._id}
            vehicle={vehicle}
            preloadedImageUrl={vehicle.imageUrl}
            pickupDate={searchState.pickupDate}
            returnDate={searchState.returnDate}
            deliveryLocation={searchState.deliveryLocation}
            restitutionLocation={searchState.restitutionLocation}
            pickupTime={searchState.pickupTime}
            returnTime={searchState.returnTime}
          />
        );
      })}
    </div>
  );
}

export function HomePageClient({
  initialVehicles,
  initialTitle,
}: HomePageClientProps) {
  const t = useTranslations("homepage");
  const tAbout = useTranslations("aboutPage");
  const tTestimonials = useTranslations("testimonials");
  const tFaq = useTranslations("faq");

  const { searchState, updateSearchField } = useVehicleSearch();

  const faqItems = [
    {
      question: tFaq("questions.0.question"),
      answer: tFaq("questions.0.answer"),
    },
    {
      question: tFaq("questions.1.question"),
      answer: tFaq("questions.1.answer"),
    },
    {
      question: tFaq("questions.2.question"),
      answer: tFaq("questions.2.answer"),
    },
    {
      question: tFaq("questions.3.question"),
      answer: tFaq("questions.3.answer"),
    },
    {
      question: tFaq("questions.4.question"),
      answer: tFaq("questions.4.answer"),
    },
    {
      question: tFaq("questions.5.question"),
      answer: tFaq("questions.5.answer"),
    },
    {
      question: tFaq("questions.6.question"),
      answer: tFaq("questions.6.answer"),
    },
  ];

  return (
    <>
      <BackgroundImage bottomGradient={true} />

      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col gap-12 max-w-5xl mx-auto p-4 md:p-6 lg:p-8 w-full mt-[10%] md:mt-[15%] lg:mt-[20%]">
          <AnimatedGroup
            variants={sectionAnimationVariants}
            threshold={0.2}
            triggerOnce={true}
          >
            <div className="text-center relative">
              <div className="absolute inset-0 bg-black/40 blur-lg rounded-xl -z-10 transform translate-x-1 translate-y-1"></div>

              <h1 className="text-4xl md:text-5xl text-secondary font-bold tracking-tight">
                {t("title")}
              </h1>
              <p className="mt-4 text-lg md:text-xl text-primary-foreground">
                {t("subtitle")}
              </p>
            </div>
          </AnimatedGroup>

          <AnimatedGroup
            variants={sectionAnimationVariants}
            threshold={0.2}
            triggerOnce={true}
          >
            <VehicleSearchFilterForm
              searchState={searchState}
              updateSearchField={updateSearchField}
            />
          </AnimatedGroup>

          <AnimatedGroup
            variants={sectionAnimationVariants}
            threshold={0.2}
            triggerOnce={true}
          >
            <div className="my-8">
              <h2 className="text-3xl font-semibold mb-6 text-center">
                {initialTitle}
              </h2>
              <VehicleList
                vehicles={initialVehicles}
                searchState={searchState}
              />
              <div className="flex justify-center mt-12">
                <Button
                  variant="default"
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white"
                  asChild
                >
                  <Link href="/cars">
                    {t("viewAllCars")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </AnimatedGroup>
        </div>

        <div className="w-full px-4 py-16">
          <ProgressSlider
            activeSlider="slide1"
            duration={5000}
            className="max-w-7xl mx-auto"
          >
            <SliderContent>
              <SliderWrapper value="slide1" className="w-full">
                <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                  <Image
                    src="/slideshow/banner1.jpeg"
                    alt="Cars ready for adventure and exploration"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </SliderWrapper>
              <SliderWrapper value="slide2" className="w-full">
                <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                  <Image
                    src="/slideshow/banner2.jpeg"
                    alt="Cars ready for adventure and exploration"
                    fill
                    className="object-cover"
                  />
                </div>
              </SliderWrapper>
              <SliderWrapper value="slide3" className="w-full">
                <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                  <Image
                    src="/slideshow/banner3.jpeg"
                    alt="Cars ready for adventure and exploration"
                    fill
                    className="object-cover"
                  />
                </div>
              </SliderWrapper>
              <SliderWrapper value="slide4" className="w-full">
                <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                  <Image
                    src="/slideshow/banner4.jpeg"
                    alt="Cars ready for adventure and exploration"
                    fill
                    className="object-cover"
                  />
                </div>
              </SliderWrapper>
            </SliderContent>

            <SliderBtnGroup className="flex justify-center gap-2 mt-6">
              <SliderBtn
                value="slide1"
                className="w-12 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
                progressBarClass="bg-white h-full rounded-full top-0"
              >
                <span className="sr-only">Slide 1</span>
              </SliderBtn>
              <SliderBtn
                value="slide2"
                className="w-12 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
                progressBarClass="bg-white h-full rounded-full top-0"
              >
                <span className="sr-only">Slide 2</span>
              </SliderBtn>
              <SliderBtn
                value="slide3"
                className="w-12 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
                progressBarClass="bg-white h-full rounded-full top-0"
              >
                <span className="sr-only">Slide 3</span>
              </SliderBtn>
              <SliderBtn
                value="slide4"
                className="w-12 h-2 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
                progressBarClass="bg-white h-full rounded-full top-0"
              >
                <span className="sr-only">Slide 4</span>
              </SliderBtn>
            </SliderBtnGroup>
          </ProgressSlider>
        </div>

        <AnimatedGroup
          variants={sectionAnimationVariants}
          threshold={0.2}
          triggerOnce={true}
        >
          <section className="py-16 px-4">
            <div className="container mx-auto">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {tAbout("ourStory.title")}
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    {tAbout("ourStory.subtitle")}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {tAbout("ourStory.description1")}
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {tAbout("ourStory.description2")}
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {tAbout("ourStory.description3")}
                    </p>
                  </div>
                  <div className="relative">
                    <Card className="overflow-hidden shadow-xl p-0 relative h-96">
                      <Image
                        src="/our-story.jpg"
                        alt="Our Story"
                        fill
                        className="object-cover"
                      />
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AnimatedGroup>

        <AnimatedGroup
          variants={sectionAnimationVariants}
          threshold={0.2}
          triggerOnce={true}
        >
          <div className="py-16 px-4 mx-auto bg-muted/20">
            <FeaturesSectionWithHoverEffects />
          </div>
        </AnimatedGroup>

        <AnimatedGroup
          variants={sectionAnimationVariants}
          threshold={0.2}
          triggerOnce={true}
        >
          <TestimonialsSection
            title={tTestimonials("title")}
            description={tTestimonials("description")}
          />
        </AnimatedGroup>

        <AnimatedGroup
          variants={sectionAnimationVariants}
          threshold={0.15}
          triggerOnce={true}
        >
          <FaqSection
            title={t("faq.title")}
            description={t("faq.description")}
            items={faqItems}
            ctaSection={{
              title: t("faq.cta.title"),
              description: t("faq.cta.description"),
              buttonText: t("faq.cta.buttonText"),
              href: "/cars",
            }}
          />
        </AnimatedGroup>
      </div>
    </>
  );
}