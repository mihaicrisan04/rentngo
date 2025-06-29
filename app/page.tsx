"use client";

import * as React from "react";
import {
  useMutation,
  useQuery,
  useConvex,
} from "convex/react";
import { api } from "../convex/_generated/api";
import Image from "next/image"; // Import Next.js Image component
import { ArrowRight, Sparkles, Car } from "lucide-react";
import { Id } from "../convex/_generated/dataModel";
import Link from "next/link";
import { FeaturesSectionWithHoverEffects } from "@/components/blocks/feature-section-with-hover-effects";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DisplayCards from "@/components/ui/display-cards";
import { TestimonialsSection } from "@/components/blocks/testimonials-with-marquee";
import { Header } from "@/components/ui/header";
import { VehicleSearchFilterForm } from "@/components/vehicle-search-filter-form"; // Import the new form
import { VehicleCard } from "@/components/vehicle-card"; // Import the new VehicleCard
import { FaqSection } from "@/components/blocks/faq"; // Re-added import for FaqSection
import { BackgroundImage } from "@/components/ui/BackgroundImage"; // Import the new BackgroundImage component
import { AnimatedGroup } from "@/components/ui/animated-group"; // Import AnimatedGroup
import { Slideshow } from "@/components/ui/slideshow"; // Import the new Slideshow component
import { Vehicle } from "@/types/vehicle"; // Import centralized Vehicle type
import { useHomepageFeaturedVehicles } from "@/hooks/useHomepageFeaturedVehicles";
import { sectionAnimationVariants } from "@/lib/animations";

// Updated VehicleList to accept search dates and pass them to VehicleCard
function VehicleList({
  vehicles,
  isLoading,
}: {
  vehicles: Vehicle[] | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <p className="text-center text-muted-foreground">Loading featured cars...</p>;
  }
  if (vehicles === null) {
    return <p className="text-center text-destructive">Could not load featured cars.</p>;
  }
  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return <p className="text-center text-muted-foreground">No featured cars available at the moment.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => {
        if (!vehicle || typeof vehicle._id !== 'string') {
          return null;
        }
        // For featured cars on homepage, we don't have search parameters
        return (
          <VehicleCard 
            key={vehicle._id} 
            vehicle={vehicle}
            pickupDate={null}
            returnDate={null}
            deliveryLocation={null}
            restitutionLocation={null}
            pickupTime={null}
            returnTime={null}
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

  const { vehiclesToDisplay, currentTitle, isLoading } = useHomepageFeaturedVehicles();

  const isAuthorized = useQuery(api.auth.isAuthorized);

  return (
    <div className="relative flex flex-col min-h-screen">
      <BackgroundImage bottomGradient={true} />

      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-col gap-12 max-w-5xl mx-auto p-4 md:p-6 lg:p-8 w-full mt-[10%] md:mt-[15%] lg:mt-[20%]">
            <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl text-secondary font-bold tracking-tight">
                  Find Your Perfect Ride
                </h1>
                <p className="mt-4 text-lg md:text-xl text-primary-foreground">
                  Explore Cluj-Napoca with our wide range of rental cars. Easy booking, great prices.
                </p>
              </div>
            </AnimatedGroup>


            <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
              <VehicleSearchFilterForm />
            </AnimatedGroup>

            <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
              <div className="my-8">
                <h2 className="text-3xl font-semibold mb-6 text-center">
                  {currentTitle}
                </h2>
                <VehicleList
                  vehicles={vehiclesToDisplay}
                  isLoading={isLoading}
                />
                <div className="flex justify-center mt-12">
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={() => window.location.href = '/cars'}
                  >
                    View All Cars
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AnimatedGroup>
          
          </div>
        
        <AnimatedGroup variants={sectionAnimationVariants} threshold={0.1} triggerOnce={true}>
          <div className="w-full">
            <Slideshow className="mb-8" />
          </div>
        </AnimatedGroup>

        {/* Our Story Section */}
        <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
          <section className="py-16 px-4">
            <div className="container mx-auto">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Our Story
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Your trusted partner for exploring Cluj-Napoca and beyond
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      At Rent'n Go, we believe that every journey should be memorable. Founded with a passion 
                      for travel and a commitment to excellence, we've been serving the Cluj-Napoca community 
                      with reliable, affordable car rental solutions.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Whether you're exploring the historic streets of Cluj-Napoca, venturing into the 
                      beautiful Transylvanian countryside, or need a reliable vehicle for business, 
                      we're here to make your journey smooth and enjoyable.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Our carefully curated fleet of modern vehicles, combined with transparent pricing 
                      and exceptional customer service, ensures that your rental experience exceeds expectations 
                      every time.
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
            title="What Our Customers Say"
            description="Read what our customers have to say about us."
          />
        </AnimatedGroup>

        <AnimatedGroup variants={sectionAnimationVariants} threshold={0.15} triggerOnce={true}>
          <FaqSection
            title="Frequently Asked Questions"
            description="Find answers to common questions about renting a car with us."
            ctaSection={{
              title: "Ready to Hit the Road?",
              description: "Browse our extensive fleet of vehicles and find the perfect car for your next adventure in Cluj-Napoca.",
              buttonText: "Browse Our Cars",
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
