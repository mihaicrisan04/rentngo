"use client";

import * as React from "react";
import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const ensureUserMutation = useMutation(api.users.ensureUser);

  React.useEffect(() => {
    // This effect will run once when the component mounts.
    ensureUserMutation({});
  }, [ensureUserMutation]);

  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        RentNGo Cluj
        <UserButton />
      </header>
      <main className="p-8 flex flex-col gap-8">
        <Authenticated>
          <Content />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </main>
    </>
  );
}

function SignInForm() {
  return (
    <div className="flex flex-col gap-8 w-96 mx-auto">
      <p className="text-lg text-center">Log in or create an account to start booking.</p>
      <SignInButton mode="modal">
        <Button variant="default" size="lg" className="w-full">
          Sign in
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button variant="outline" size="lg" className="w-full">
          Sign up
        </Button>
      </SignUpButton>
    </div>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto py-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Find Your Perfect Ride
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
          Explore Cluj-Napoca with our wide range of rental cars. Easy booking, great prices.
        </p>
      </div>

      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Search for a Car</CardTitle>
          <CardDescription>Select your dates and preferences to find available vehicles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="grid gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., Cluj-Napoca Airport" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pickupDate">Pick-up Date</Label>
              <Input id="pickupDate" type="date" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="returnDate">Return Date</Label>
              <Input id="returnDate" type="date" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="carType">Car Type</Label>
              <Select>
                <SelectTrigger id="carType">
                  <SelectValue placeholder="Select car type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Type</SelectItem>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="hatchback">Hatchback</SelectItem>
                  <SelectItem value="van">Van/Minibus</SelectItem>
                  <SelectItem value="convertible">Convertible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-6">
          <Button size="lg" className="w-full sm:w-auto">Search Cars</Button>
        </CardFooter>
      </Card>

      <div className="mt-8">
        <h2 className="text-3xl font-semibold mb-6 text-center">Available Cars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Economy Compact", desc: "Perfect for city trips, 4 seats", price: 120, imageText: "Economy Car" },
            { title: "Family SUV", desc: "Spacious and comfortable, 5 seats", price: 200, imageText: "SUV" },
            { title: "Premium Sedan", desc: "Luxury and style, 5 seats", price: 250, imageText: "Premium Sedan" },
          ].map((car, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader className="pb-4">
                <div className="aspect-[16/9] bg-muted rounded-md flex items-center justify-center mb-4 overflow-hidden">
                   <img src={`https://via.placeholder.com/400x225.png?text=${encodeURIComponent(car.imageText)}`} alt={car.title} className="w-full h-full object-cover"/>
                </div>
                <CardTitle>{car.title}</CardTitle>
                <CardDescription>{car.desc}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">Price per day:</span>
                  <span className="text-xl font-semibold">{car.price} RON</span>
                </div>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Fuel Type: Petrol</li>
                  <li>Transmission: Automatic</li>
                  <li>Air Conditioning</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Details & Book</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
