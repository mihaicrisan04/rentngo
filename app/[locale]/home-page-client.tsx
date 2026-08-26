"use client";

import { ArrowRight, Plane, Clock, Star, Headphones } from "lucide-react";
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
      {vehicles.map((vehicle, index) => {
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
            imagePriority={index < 4}
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

      <div className="relative z-10 flex flex-col">
        {/* ═══════════════════════════════════════════
            HERO — cinematic, full-impact
        ═══════════════════════════════════════════ */}
        <div className="flex flex-col gap-12 max-w-5xl mx-auto p-4 md:p-6 lg:p-8 w-full mt-[8%] md:mt-[12%] lg:mt-[16%]">
          <AnimatedGroup
            variants={sectionAnimationVariants}
            threshold={0.2}
            triggerOnce={true}
          >
            <div className="text-center relative">
              <div className="absolute inset-0 bg-black/50 blur-2xl rounded-3xl -z-10 scale-110"></div>

              <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-white/90 shadow-lg shadow-black/10">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Cluj-Napoca, Romania
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-bold tracking-tight leading-[1.05]">
                {t("title")}
              </h1>
              <p className="mt-6 text-lg md:text-xl lg:text-2xl text-white/75 max-w-2xl mx-auto leading-relaxed font-light">
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
        </div>

        {/* ═══════════════════════════════════════════
            TRUST BAR — quick social proof strip
        ═══════════════════════════════════════════ */}
        <AnimatedGroup
          variants={sectionAnimationVariants}
          threshold={0.2}
          triggerOnce={true}
        >
          <div className="max-w-5xl mx-auto w-full px-4 mt-4 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: Star,
                  label: t("trustBar.rating"),
                  value: t("trustBar.ratingDesc"),
                },
                {
                  icon: Plane,
                  label: t("trustBar.airport"),
                  value: t("trustBar.airportDesc"),
                },
                {
                  icon: Clock,
                  label: t("trustBar.support"),
                  value: t("trustBar.supportDesc"),
                },
                {
                  icon: Headphones,
                  label: t("trustBar.roadside"),
                  value: t("trustBar.roadsideDesc"),
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm"
                >
                  <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedGroup>

        {/* ═══════════════════════════════════════════
            FEATURED VEHICLES
        ═══════════════════════════════════════════ */}
        <div className="max-w-5xl mx-auto w-full px-4 md:px-6 lg:px-8">
          <AnimatedGroup
            variants={sectionAnimationVariants}
            threshold={0.2}
            triggerOnce={true}
          >
            <div className="py-12">
              <div className="flex flex-col items-center gap-3 mb-10">
                <div className="accent-line"></div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight">
                  {initialTitle}
                </h2>
              </div>
              <VehicleList
                vehicles={initialVehicles}
                searchState={searchState}
              />
              <div className="flex justify-center mt-14">
                <Button
                  variant="default"
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white group px-8 h-12 text-base"
                  asChild
                >
                  <Link href="/cars">
                    {t("viewAllCars")}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </AnimatedGroup>
        </div>

        {/* ═══════════════════════════════════════════
            SLIDESHOW — full-bleed gallery
        ═══════════════════════════════════════════ */}
        <div className="w-full px-4 py-20">
          <ProgressSlider
            activeSlider="slide1"
            duration={5000}
            className="max-w-7xl mx-auto"
          >
            <SliderContent>
              {["banner1", "banner2", "banner3", "banner4"].map((banner, i) => (
                <SliderWrapper
                  key={banner}
                  value={`slide${i + 1}`}
                  className="w-full"
                >
                  <div className="relative w-full aspect-video overflow-hidden rounded-3xl shadow-2xl">
                    <Image
                      src={`/slideshow/${banner}.jpeg`}
                      alt="Cars ready for adventure and exploration"
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  </div>
                </SliderWrapper>
              ))}
            </SliderContent>

            <SliderBtnGroup className="flex justify-center gap-3 mt-8">
              {["slide1", "slide2", "slide3", "slide4"].map((slide, i) => (
                <SliderBtn
                  key={slide}
                  value={slide}
                  className="w-14 h-1.5 rounded-full bg-foreground/15 hover:bg-foreground/25 transition-colors"
                  progressBarClass="bg-primary h-full rounded-full top-0"
                >
                  <span className="sr-only">Slide {i + 1}</span>
                </SliderBtn>
              ))}
            </SliderBtnGroup>
          </ProgressSlider>
        </div>

        {/* ═══════════════════════════════════════════
            OUR STORY — editorial asymmetric
        ═══════════════════════════════════════════ */}
        <AnimatedGroup
          variants={sectionAnimationVariants}
          threshold={0.2}
          triggerOnce={true}
        >
          <section className="py-24 px-4 relative">
            <div className="container mx-auto">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col items-center gap-3 mb-16">
                  <div className="accent-line"></div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-center tracking-tight">
                    {tAbout("ourStory.title")}
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl text-center">
                    {tAbout("ourStory.subtitle")}
                  </p>
                </div>

                <div className="grid md:grid-cols-5 gap-12 lg:gap-16 items-center">
                  <div className="md:col-span-2 space-y-6">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {tAbout("ourStory.description1")}
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {tAbout("ourStory.description2")}
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {tAbout("ourStory.description3")}
                    </p>
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="group"
                        asChild
                      >
                        <Link href="/about">
                          {tAbout("mission.buttonText")}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-3 relative">
                    <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] -z-10 hidden md:block"></div>
                    <Card className="overflow-hidden shadow-2xl p-0 relative h-[30rem] rounded-2xl">
                      <Image
                        src="/our-story.jpg"
                        alt="Our Story"
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent"></div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AnimatedGroup>

        <div className="section-divider max-w-5xl mx-auto w-full"></div>

        {/* ═══════════════════════════════════════════
            FEATURES — static bg, animated items only
        ═══════════════════════════════════════════ */}
        <div className="py-20 px-4 w-full relative grain-overlay">
          <div className="flex flex-col items-center gap-3 mb-4 relative z-10">
            <div className="accent-line"></div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-center tracking-tight">
              {t("features.title")}
            </h2>
          </div>
          <FeaturesSectionWithHoverEffects />
        </div>

        <div className="section-divider max-w-5xl mx-auto w-full"></div>

        {/* ═══════════════════════════════════════════
            TESTIMONIALS
        ═══════════════════════════════════════════ */}
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

        <div className="section-divider max-w-5xl mx-auto w-full"></div>

        {/* ═══════════════════════════════════════════
            BOLD CTA BANNER — full-width call to action
        ═══════════════════════════════════════════ */}
        <AnimatedGroup
          variants={sectionAnimationVariants}
          threshold={0.2}
          triggerOnce={true}
        >
          <section className="py-24 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] via-primary/[0.05] to-foreground/[0.03]"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                {t("faq.cta.title")}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
                {t("faq.cta.description")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground group px-8 h-13 text-base shadow-lg shadow-primary/20"
                  asChild
                >
                  <Link href="/cars">
                    {t("faq.cta.buttonText")}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 h-13 text-base"
                  asChild
                >
                  <Link href="/contact">{t("faq.contact")}</Link>
                </Button>
              </div>
            </div>
          </section>
        </AnimatedGroup>

        {/* ═══════════════════════════════════════════
            FAQ
        ═══════════════════════════════════════════ */}
        <AnimatedGroup
          variants={sectionAnimationVariants}
          threshold={0.15}
          triggerOnce={true}
        >
          <FaqSection
            title={t("faq.title")}
            description={t("faq.description")}
            items={faqItems}
          />
        </AnimatedGroup>
      </div>
    </>
  );
}
