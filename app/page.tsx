"use client";

import * as React from "react";
import {
  useMutation,
  useQuery,
  useConvex,
} from "convex/react";
import { api } from "../convex/_generated/api";
import Image from "next/image"; // Import Next.js Image component
import { ArrowRight, Sparkles } from "lucide-react";
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
import { VehicleSearchFilterForm } from "@/components/VehicleSearchFilterForm"; // Import the new form
import { VehicleCard } from "@/components/VehicleCard"; // Import the new VehicleCard
import { FaqSection } from "@/components/blocks/faq"; // Re-added import for FaqSection
import { BackgroundImage } from "@/components/ui/BackgroundImage"; // Import the new BackgroundImage component
import { AnimatedGroup } from "@/components/ui/animated-group"; // Import AnimatedGroup
import { Slideshow } from "@/components/ui/slideshow"; // Import the new Slideshow component
import { Variants } from "framer-motion"; // Import Variants for typing

// Define the expected shape of a vehicle object from the backend
interface Vehicle {
  _id: Id<"vehicles">;
  make: string;
  model: string;
  year: number;
  type: string;
  pricePerDay: number;
  currency?: string; // Optional, will default in Card
  location: string;
  features: string[];
  status: string;
  images: Id<"_storage">[];
  mainImageId?: Id<"_storage">;
  title?: string;
  desc?: string;
  engineCapacity?: number; // Optional
  engineType?: string; // Optional
  fuelType?: string; // Optional
}



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

// Define the animation variants
const sectionAnimationVariants: {
  container: Variants;
  item: Variants;
} = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Adjust stagger timing as needed
        delayChildren: 0.2, // Optional delay before children start animating
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      scale: 0.9,
      filter: "blur(8px)",
      y: 20, // Slight upward movement
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8, // Adjust duration as needed
      },
    },
  },
};

export default function Home() {
  // const ensureUserMutation = useMutation(api.users.ensureUser);
  // // const convex = useConvex(); // convex client might not be needed if imperative queries for search are removed

  // React.useEffect(() => {
  //   ensureUserMutation({});
  // }, [ensureUserMutation]);

  const featuredVehiclesQuery = useQuery(api.vehicles.getAll, { paginationOpts: { numItems: 3, cursor: null }});

  const vehiclesToDisplay = featuredVehiclesQuery?.page || [];
  const currentTitle = featuredVehiclesQuery === undefined ? "Loading..." : (vehiclesToDisplay.length > 0 ? "Featured Cars" : "No Featured Cars");

  const isAuthorized = useQuery(api.auth.isAuthorized);

  return (
    <div className="relative flex flex-col min-h-screen">
      <BackgroundImage />

      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="relative z-10 flex flex-col gap-8 mt-[10%] md:mt-[15%] lg:mt-[20%]">
        <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
          <div className="flex flex-col gap-12 max-w-5xl mx-auto p-4 md:p-6 lg:p-8 w-full">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl text-secondary font-bold tracking-tight">
                Find Your Perfect Ride
              </h1>
              <p className="mt-4 text-lg md:text-xl text-primary-foreground">
                Explore Cluj-Napoca with our wide range of rental cars. Easy booking, great prices.
              </p>
            </div>

            <VehicleSearchFilterForm />

            <div className="my-8">
              <h2 className="text-3xl font-semibold mb-6 text-center">
                {currentTitle}
              </h2>
              <VehicleList
                vehicles={vehiclesToDisplay as Vehicle[]}
                isLoading={featuredVehiclesQuery === undefined}
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
          
          </div>
        </AnimatedGroup>
        
        <AnimatedGroup variants={sectionAnimationVariants} threshold={0.3} triggerOnce={true}>
          <div className="w-full">
            <Slideshow className="mb-8" />
          </div>
        </AnimatedGroup>
        
        <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
          <FeaturesSectionWithHoverEffects />
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
            contactInfo={{
              title: "Still have questions?",
              description: "Our team is ready to help you with any inquiries.",
              buttonText: "Contact Us",
              onContact: () => {
                // You can implement navigation to a contact page or open a contact modal here
                console.log("Contact Us button clicked from FAQ");
                // Example: window.location.href = \'/contact\';
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
