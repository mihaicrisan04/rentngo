"use client";

import * as React from "react";

import Image from "next/image"; // Import Next.js Image component
import { ArrowRight, Car } from "lucide-react";
import { FeaturesSectionWithHoverEffects } from "@/components/blocks/feature-section-with-hover-effects";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { TestimonialsSection } from "@/components/blocks/testimonials-with-marquee";
import { Header } from "@/components/ui/header";
import { VehicleSearchFilterForm } from "@/components/vehicle/vehicle-search-filter-form"; // Import the new form
import { VehicleCard } from "@/components/vehicle/vehicle-card"; // Import the new VehicleCard
import { FaqSection } from "@/components/blocks/faq"; // Re-added import for FaqSection
import { BackgroundImage } from "@/components/ui/BackgroundImage"; // Import the new BackgroundImage component
import { AnimatedGroup } from "@/components/ui/animated-group"; // Import AnimatedGroup
import { Slideshow } from "@/components/ui/slideshow"; // Import the new Slideshow component
import { Vehicle } from "@/types/vehicle"; // Import centralized Vehicle type
import { useHomepageFeaturedVehicles } from "@/hooks/useHomepageFeaturedVehicles";
import { sectionAnimationVariants } from "@/lib/animations";
import { useTranslations } from 'next-intl';
import { useVehicleSearch } from "@/hooks/useVehicleSearch";
import { SearchData } from "@/lib/searchStorage";

// Updated VehicleList to accept search dates and pass them to VehicleCard
function VehicleList({
  vehicles,
  isLoading,
  searchState,
}: {
  vehicles: Vehicle[] | null;
  isLoading: boolean;
  searchState: SearchData & { isHydrated: boolean };
}) {
  const t = useTranslations('common');
  
  if (isLoading) {
    return <p className="text-center text-muted-foreground">{t('loadingFeaturedCars')}</p>;
  }
  if (vehicles === null) {
    return <p className="text-center text-destructive">{t('couldNotLoadFeaturedCars')}</p>;
  }
  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return <p className="text-center text-muted-foreground">{t('noFeaturedCarsAvailable')}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => {
        if (!vehicle || typeof vehicle._id !== 'string') {
          return null;
        }
        // Pass search state to vehicle cards for dynamic pricing
        return (
          <VehicleCard 
            key={vehicle._id} 
            vehicle={vehicle}
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



export default function Home() {
  // const ensureUserMutation = useMutation(api.users.ensureUser);
  // // const convex = useConvex(); // convex client might not be needed if imperative queries for search are removed

  // React.useEffect(() => {
  //   ensureUserMutation({});
  // }, [ensureUserMutation]);

  const t = useTranslations('homepage');
  const tTestimonials = useTranslations('testimonials');
  const tFaq = useTranslations('faq');
  const { vehiclesToDisplay, currentTitle, isLoading } = useHomepageFeaturedVehicles();
  
  // Add vehicle search hook to get search state
  const { searchState, updateSearchField } = useVehicleSearch();

  // Create FAQ items array from translations
  const faqItems = [
    { question: tFaq('questions.0.question'), answer: tFaq('questions.0.answer') },
    { question: tFaq('questions.1.question'), answer: tFaq('questions.1.answer') },
    { question: tFaq('questions.2.question'), answer: tFaq('questions.2.answer') },
    { question: tFaq('questions.3.question'), answer: tFaq('questions.3.answer') },
    { question: tFaq('questions.4.question'), answer: tFaq('questions.4.answer') },
    { question: tFaq('questions.5.question'), answer: tFaq('questions.5.answer') },
    { question: tFaq('questions.6.question'), answer: tFaq('questions.6.answer') },
  ];



  return (
    <div className="relative flex flex-col min-h-screen">
      <BackgroundImage bottomGradient={true} />

      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-col gap-12 max-w-5xl mx-auto p-4 md:p-6 lg:p-8 w-full mt-[10%] md:mt-[15%] lg:mt-[20%]">
            <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
              <div className="text-center relative">
                {/* Shadow backdrop */}
                <div className="absolute inset-0 bg-black/40 blur-lg rounded-xl -z-10 transform translate-x-1 translate-y-1"></div>
                
                <h1 className="text-4xl md:text-5xl text-secondary font-bold tracking-tight">
                  {t('title')}
                </h1>
                <p className="mt-4 text-lg md:text-xl text-primary-foreground">
                  {t('subtitle')}
                </p>
              </div>
            </AnimatedGroup>


            <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
              <VehicleSearchFilterForm 
                searchState={searchState}
                updateSearchField={updateSearchField}
              />
            </AnimatedGroup>

            <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
              <div className="my-8">
                <h2 className="text-3xl font-semibold mb-6 text-center">
                  {currentTitle}
                </h2>
                <VehicleList
                  vehicles={vehiclesToDisplay}
                  isLoading={isLoading}
                  searchState={searchState}
                />
                <div className="flex justify-center mt-12">
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => window.location.href = '/cars'}
                  >
                    {t('viewAllCars')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AnimatedGroup>
          
          </div>
        
        {/* <AnimatedGroup variants={sectionAnimationVariants} threshold={0.1} triggerOnce={true}> */}
          <div className="w-full">
            <Slideshow className="mb-8" />
          </div>
        {/* </AnimatedGroup> */}

        {/* Our Story Section */}
        <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
          <section className="py-16 px-4">
            <div className="container mx-auto">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {t('ourStory.title')}
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    {t('ourStory.subtitle')}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {t('ourStory.description1')}
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {t('ourStory.description2')}
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {t('ourStory.description3')}
                    </p>
                  </div>
                  <div className="relative">
                    <Card className="overflow-hidden shadow-xl">
                      <CardContent className="p-0">
                        <div className="relative h-80 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Car className="w-24 h-24 text-primary/60" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AnimatedGroup>
        
        <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
          <div className="py-16 px-4 mx-auto bg-muted/20">
            <FeaturesSectionWithHoverEffects />
          </div>
        </AnimatedGroup>

        <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
          <TestimonialsSection
            title={tTestimonials('title')}
            description={tTestimonials('description')}
          />
        </AnimatedGroup>

        <AnimatedGroup variants={sectionAnimationVariants} threshold={0.15} triggerOnce={true}>
          <FaqSection
            title={t('faq.title')}
            description={t('faq.description')}
            items={faqItems}
            ctaSection={{
              title: t('faq.cta.title'),
              description: t('faq.cta.description'),
              buttonText: t('faq.cta.buttonText'),
              onBrowseCars: () => {
                window.location.href = '/cars';
              },
            }}
          />
        </AnimatedGroup>
      </main>

      <Footer
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />}
        brandName=""
      />

    </div>
  );
}
