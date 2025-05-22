"use client";

import * as React from "react";
import {
  useMutation,
  useQuery,
  useConvex,
} from "convex/react";
import { api } from "../convex/_generated/api";
import Image from "next/image"; // Import Next.js Image component
import { Sparkles } from "lucide-react";
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

// Car Rental FAQ Data
const CAR_RENTAL_FAQS = [
  {
    question: "What documents do I need to rent a car?",
    answer: "You\'ll typically need a valid driver\'s license held for at least one year, a credit card in the main driver\'s name for the security deposit, and a form of photo ID (like a passport or national ID card). International renters might need an International Driving Permit (IDP).",
  },
  {
    question: "Is there a minimum age to rent a car?",
    answer: "Yes, the minimum age is generally 21 years. However, drivers between 21-24 may be subject to a young driver surcharge and may have restrictions on available vehicle categories.",
  },
  {
    question: "Can I add an additional driver?",
    answer: "Yes, additional drivers can usually be added for an extra daily fee. They must meet the same age and license requirements as the main driver and must be present at the rental counter with their documents.",
  },
  {
    question: "What is your fuel policy?",
    answer: "Our standard fuel policy is \'full-to-full.\' You will receive the car with a full tank of fuel and you should return it full. If returned with less fuel, refueling charges will apply. Other pre-paid fuel options might be available.",
  },
  {
    question: "What happens if I return the car late?",
    answer: "We understand delays can happen. A short grace period is usually allowed, but late returns beyond that may incur additional charges, potentially a full extra day\'s rental. Please contact us if you anticipate being late.",
  },
  {
    question: "Is insurance included in the rental price?",
    answer: "Basic Collision Damage Waiver (CDW) and Theft Protection (TP) with an excess amount are typically included. We also offer optional insurance packages to reduce the excess or provide more comprehensive coverage.",
  },
];

const defaultCards = [
  {
    icon: <Sparkles className="size-4 text-blue-300" />,
    title: "Featured",
    description: "Discover amazing content",
    date: "Just now",
    iconClassName: "text-blue-500",
    titleClassName: "text-blue-500",
    className:
      "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Sparkles className="size-4 text-blue-300" />,
    title: "Popular",
    description: "Trending this week",
    date: "2 days ago",
    iconClassName: "text-blue-500",
    titleClassName: "text-blue-500",
    className:
      "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Sparkles className="size-4 text-blue-300" />,
    title: "New",
    description: "Latest updates and features",
    date: "Today",
    iconClassName: "text-blue-500",
    titleClassName: "text-blue-500",
    className:
      "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
  },
];

const testimonials = [
  {
    author: {
      name: "Emma Thompson",
      handle: "@emmaai",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    text: "The car rental process was incredibly smooth and efficient. The online booking system made it so easy to find and reserve the perfect vehicle for our family vacation.",
    href: "https://twitter.com/emmaai"
  },
  {
    author: {
      name: "David Park",
      handle: "@davidtech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    text: "I've rented from many companies, but this one stands out. The cars are always clean, well-maintained, and the customer service is exceptional. Will definitely use again!",
    href: "https://twitter.com/davidtech"
  },
  {
    author: {
      name: "Sofia Rodriguez",
      handle: "@sofiaml",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    text: "The flexible rental options and competitive pricing made it perfect for my business trip. The car was exactly as advertised and the pickup/dropoff process was seamless."
  }
];

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
        // Pass pickupDate and returnDate to VehicleCard // These are removed
        return <VehicleCard key={vehicle._id} vehicle={vehicle} />;
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
        <AnimatedGroup variants={sectionAnimationVariants}>
          <div className="flex flex-col gap-12 max-w-5xl mx-auto p-4 md:p-6 lg:p-8 w-full">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Find Your Perfect Ride
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                Explore Cluj-Napoca with our wide range of rental cars. Easy booking, great prices.
              </p>
            </div>

            <VehicleSearchFilterForm />

            <div className="mt-8">
              <h2 className="text-3xl font-semibold mb-6 text-center">
                {currentTitle}
              </h2>
              <VehicleList
                vehicles={vehiclesToDisplay as Vehicle[]}
                isLoading={featuredVehiclesQuery === undefined}
              />
            </div>
          </div>
        </AnimatedGroup>
        
        <AnimatedGroup variants={sectionAnimationVariants}>
          <FeaturesSectionWithHoverEffects />
        </AnimatedGroup>

        <AnimatedGroup variants={sectionAnimationVariants}>
          <TestimonialsSection
            title="What Our Customers Say"
            description="Read what our customers have to say about us."
            testimonials={testimonials}
          />
        </AnimatedGroup>

        <AnimatedGroup variants={sectionAnimationVariants}>
          <FaqSection
            title="Frequently Asked Questions"
            description="Find answers to common questions about renting a car with us."
            items={CAR_RENTAL_FAQS}
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
