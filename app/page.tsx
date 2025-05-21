"use client";

import * as React from "react";
import {
  useMutation,
  useQuery,
  useConvex,
} from "convex/react";
import { api } from "../convex/_generated/api";
// import Link from "next/link"; // Not currently used
// import { SignUpButton } from "@clerk/nextjs"; // Not directly used in main flow for now
// import { SignInButton } from "@clerk/nextjs"; // Not directly used in main flow for now
import Image from "next/image"; // Import Next.js Image component
import { UserButton } from "@clerk/nextjs";
import { Sparkles, Instagram, Facebook} from "lucide-react";
import { Id } from "../convex/_generated/dataModel";
import Link from "next/link";
import { FeaturesSectionWithHoverEffects } from "@/components/blocks/feature-section-with-hover-effects";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
// Input and Label might not be directly needed if the old form is entirely removed
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Popover, PopoverContent, PopoverTrigger might not be needed if old form is removed
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { cn } from "@/lib/utils"; // cn might not be needed if old form is removed
import DisplayCards from "@/components/ui/display-cards";
import { TestimonialsSection } from "@/components/blocks/testimonials-with-marquee";
import { Header } from "@/components/ui/header";
// Calendar import is likely not needed here anymore as it's encapsulated in VehicleSearchFilterForm
// import { Calendar } from "@/components/ui/calendar";
import { VehicleSearchFilterForm } from "@/components/VehicleSearchFilterForm"; // Import the new form
import { VehicleCard } from "@/components/VehicleCard"; // Import the new VehicleCard
import { FaqSection } from "@/components/blocks/faq"; // Added import for FaqSection

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

// The old VehicleSearchFormProps and VehicleSearchForm component will be removed.
// interface VehicleSearchFormProps {
//   onSearch: (results: Vehicle[] | null, loading: boolean) => void;
// }

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
  pickupDate,
  returnDate,
}: {
  vehicles: Vehicle[] | null;
  isLoading: boolean;
  pickupDate?: Date | null;
  returnDate?: Date | null;
}) {
  if (isLoading) {
    return <p className="text-center text-muted-foreground">Searching for available cars...</p>;
  }
  if (vehicles === null) {
    return <p className="text-center text-destructive">Could not load vehicles. Please try searching again.</p>;
  }
  if (!Array.isArray(vehicles) || vehicles.length === 0) {
    return <p className="text-center text-muted-foreground">No vehicles found matching your criteria. Try broadening your search.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => {
        if (!vehicle || typeof vehicle._id !== 'string') {
          return null;
        }
        // Pass pickupDate and returnDate to VehicleCard
        return <VehicleCard key={vehicle._id} vehicle={vehicle} pickupDate={pickupDate} returnDate={returnDate} />;
      })}
    </div>
  );
}

interface SearchParams {
  deliveryLocation: string;
  pickupDate: Date;
  pickupTime: string;
  restitutionLocation: string;
  returnDate: Date;
  returnTime: string;
}

export default function Home() {
  const ensureUserMutation = useMutation(api.users.ensureUser);
  const convex = useConvex(); // Get Convex client for imperative queries

  React.useEffect(() => {
    ensureUserMutation({});
  }, [ensureUserMutation]);

  const [searchResults, setSearchResults] = React.useState<Vehicle[] | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const [currentSearchParams, setCurrentSearchParams] = React.useState<SearchParams | null>(null);

  // featuredVehiclesQuery remains the same
  const featuredVehiclesQuery = useQuery(api.vehicles.getAll, { paginationOpts: { numItems: 3, cursor: null }});

  // This function will be called by VehicleSearchFilterForm
  const handleNewVehicleSearch = async (params: SearchParams) => {
    console.log("Search initiated with params:", params);
    setIsSearching(true);
    setSearchResults(null); // Clear previous results while searching
    setCurrentSearchParams(params); // Store current search params

    const startDateTimestamp = Math.floor(params.pickupDate.getTime() / 1000);
    const endDateTimestamp = Math.floor(params.returnDate.getTime() / 1000);

    if (endDateTimestamp <= startDateTimestamp) {
      // More specific check considering time for same-day rentals might be needed if backend supports it
      if (params.returnDate.getTime() === params.pickupDate.getTime() && params.returnTime <= params.pickupTime) {
          alert("Return time must be after pick-up time for same-day rentals.");
          setIsSearching(false);
          return;
      }
      // If not same day, or if same day but time is valid, this condition is for date part only
      if (params.returnDate.getTime() < params.pickupDate.getTime()){ 
        alert("Return date must be after or the same as pick-up date.");
        setIsSearching(false);
        return;
      }
    }

    try {
      // Note: params.pickupTime, params.returnTime, and params.restitutionLocation
      // are not currently used by the api.vehicles.searchAvailableVehicles query.
      // They are available here if the backend query is updated.
      console.log("Calling Convex query with:", {
        startDate: startDateTimestamp,
        endDate: endDateTimestamp,
        deliveryLocation: params.deliveryLocation,
        // restitutionLocation: params.restitutionLocation, // If backend supports
        // pickupTime: params.pickupTime, // If backend supports
        // returnTime: params.returnTime, // If backend supports
      });

      const results = await convex.query(api.vehicles.searchAvailableVehicles, {
        startDate: startDateTimestamp,
        endDate: endDateTimestamp,
        deliveryLocation: params.deliveryLocation,
      });
      setSearchResults(results as Vehicle[]);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed. Please try again.");
      setSearchResults(null); // Explicitly set to null on error
    } finally {
      setIsSearching(false);
    }
  };


  const vehiclesToDisplay = searchResults !== null ? searchResults : (featuredVehiclesQuery?.page || []);
  const currentTitle = isSearching ? "Searching..." : searchResults !== null ? (searchResults.length > 0 ? "Available Cars" : "No Cars Found") : "Featured Cars";

  const isAuthorized = useQuery(api.auth.isAuthorized);


  return (
    <div
      className="relative flex flex-col min-h-screen"
    >
      {/* Gradient Background - Restoring the first gradient */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="flex flex-col items-end absolute -right-120 -top-40 blur-xl">
          <div className="h-[40rem] rounded-full w-[160rem] bg-gradient-to-b blur-[12rem] from-neutral-700 to-neutral-900 opacity-50"></div>
        </div>
        <div className="flex flex-col items-start absolute -left-120 -bottom-40 blur-xl">
          <div className="h-[40rem] rounded-full w-[160rem] bg-gradient-to-b blur-[12rem] from-neutral-700 to-neutral-900 opacity-50"></div>
        </div>
      </div>

      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="p-8 flex flex-col gap-8">
        <div className="flex flex-col gap-12 max-w-5xl mx-auto py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Find Your Perfect Ride
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground">
              Explore Cluj-Napoca with our wide range of rental cars. Easy booking, great prices.
            </p>
          </div>

          {/* Replace old VehicleSearchForm with the new VehicleSearchFilterForm */}
          <VehicleSearchFilterForm onSearchSubmit={handleNewVehicleSearch} />

          <div className="mt-8">
            <h2 className="text-3xl font-semibold mb-6 text-center">
              {currentTitle}
            </h2>
            {/* Update isLoading prop and pass search dates to VehicleList */}
            <VehicleList
              vehicles={vehiclesToDisplay as Vehicle[]}
              isLoading={isSearching || (featuredVehiclesQuery === undefined && searchResults === null)}
              pickupDate={currentSearchParams?.pickupDate}
              returnDate={currentSearchParams?.returnDate}
            />
          </div>

          <FeaturesSectionWithHoverEffects />

          <TestimonialsSection
            title="What Our Customers Say"
            description="Read what our customers have to say about us."
            testimonials={testimonials}
          />

          {/* FAQ Section Start */}
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

        </div>
      </main>

      <Footer
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />}
        brandName=""
        socialLinks={[
          {
            icon: <Instagram className="h-5 w-5" />,
            href: "https://www.instagram.com/rentn_go.ro",
            label: "Instagram",
          },
          {
            icon: <Facebook className="h-5 w-5" />,
            href: "https://www.facebook.com/share/1Ad82uMtP3/?mibextid=wwXIfr",
            label: "Facebook",
          },
          // {
          //   icon: <TikTok className="h-5 w-5" />,
          //   href: "https://www.tiktok.com",
          //   label: "TikTok",
          // }

        ]}
        mainLinks={[
          { href: "/", label: "Home" },
          { href: "/about", label: "About" },
          { href: "/blog", label: "Blog" },
          { href: "/contact", label: "Contact" },
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy" },
          { href: "/terms", label: "Terms" },
        ]}
        copyright={{
          text: "© 2025 RentNGo Cluj",
          license: "All rights reserved",
        }}
      />

    </div>
  );
}
