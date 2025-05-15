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
import { format } from "date-fns";
import { Sparkles, Twitter, Github, Hexagon } from "lucide-react";
import { Id } from "../convex/_generated/dataModel";

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

// Define the expected shape of a vehicle object from the backend
interface Vehicle {
  _id: Id<"vehicles">;
  make: string;
  model: string;
  year: number;
  type: string;
  pricePerDay: number;
  location: string;
  features: string[];
  status: string;
  images: Id<"_storage">[];
  mainImageId?: Id<"_storage">; // Corrected to Id<"_storage">
  title?: string;
  desc?: string;
}

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
    text: "Using this AI platform has transformed how we handle data analysis. The speed and accuracy are unprecedented.",
    href: "https://twitter.com/emmaai"
  },
  {
    author: {
      name: "David Park",
      handle: "@davidtech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    text: "The API integration is flawless. We\'ve reduced our development time by 60% since implementing this solution.",
    href: "https://twitter.com/davidtech"
  },
  {
    author: {
      name: "Sofia Rodriguez",
      handle: "@sofiaml",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    text: "Finally, an AI tool that actually understands context! The accuracy in natural language processing is impressive."
  }
];

// The old VehicleSearchForm component definition is removed from here.
// function VehicleSearchForm({ onSearch }: VehicleSearchFormProps) { ... }


// VehicleCard component to display individual vehicle information
function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  if (!vehicle || typeof vehicle._id !== 'string' ) { // Simplified ID check for now
    return <Card className="flex flex-col p-4"><CardContent>Invalid vehicle data</CardContent></Card>;
  }

   const imageUrl = vehicle.mainImageId ? useQuery(api.vehicles.getImageUrl, { imageId: vehicle.mainImageId }) : null;


  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <div className="aspect-[16/9] bg-muted rounded-md flex items-center justify-center mb-4 overflow-hidden text-muted-foreground">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm">No Image</span>
          )}
        </div>
        <CardTitle>{`${vehicle.make} ${vehicle.model} (${vehicle.year})`}</CardTitle>
        <CardDescription>{`Type: ${vehicle.type}, Location: ${vehicle.location}`}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-muted-foreground">Price per day:</span>
          <span className="text-xl font-semibold">{vehicle.pricePerDay} RON</span>
        </div>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          {vehicle.features.slice(0, 3).map(feature => <li key={feature}>{feature}</li>)}
          {vehicle.features.length === 0 && <li>No specific features listed.</li>}
        </ul>
      </CardContent>
      <CardFooter>
        {vehicle._id && (
          <Button className="w-full" asChild>
             <a href={`/dashboard/vehicles/${vehicle._id}`}>View Details & Book</a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function VehicleList({ vehicles, isLoading }: { vehicles: Vehicle[] | null, isLoading: boolean }) {
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
        // Simplified ID check
        if (!vehicle || typeof vehicle._id !== 'string') {
          return null;
        }
        return <VehicleCard key={vehicle._id} vehicle={vehicle} />;
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

  // featuredVehiclesQuery remains the same
  const featuredVehiclesQuery = useQuery(api.vehicles.getAll, { paginationOpts: { numItems: 3, cursor: null }});

  // This function will be called by VehicleSearchFilterForm
  const handleNewVehicleSearch = async (params: SearchParams) => {
    console.log("Search initiated with params:", params);
    setIsSearching(true);
    setSearchResults(null); // Clear previous results while searching

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


  return (
    <div className="flex flex-col min-h-screen">
      <Header logo={<Image src="/logo.png" alt="Rent\'n Go Logo" width={100} height={40} />} />

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

          <div className="flex min-h-[400px] w-full items-center justify-center py-20">
            <div className="w-full max-w-3xl">
              <DisplayCards cards={defaultCards} />
            </div>
          </div>

          <FeaturesSectionWithHoverEffects />

          <TestimonialsSection
            title="What Our Customers Say"
            description="Read what our customers have to say about us."
            testimonials={testimonials}
          />

          <div className="mt-8">
            <h2 className="text-3xl font-semibold mb-6 text-center">
              {currentTitle}
            </h2>
            {/* Update isLoading prop for VehicleList */}
            <VehicleList vehicles={vehiclesToDisplay as Vehicle[]} isLoading={isSearching || (featuredVehiclesQuery === undefined && searchResults === null)} />
          </div>
        </div>
      </main>

      <Footer
        logo={<Hexagon className="h-10 w-10" />}
        brandName="Awesome Corp"
        socialLinks={[
          {
            icon: <Twitter className="h-5 w-5" />,
            href: "https://twitter.com",
            label: "Twitter",
          },
          {
            icon: <Github className="h-5 w-5" />,
            href: "https://github.com",
            label: "GitHub",
          },
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
