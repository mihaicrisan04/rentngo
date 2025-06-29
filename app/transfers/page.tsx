"use client"

import * as React from "react"
import Image from "next/image"
import { Car, Clock, Shield, Users, MapPin, CheckCircle } from "lucide-react"

import { Footer } from "@/components/ui/footer"
import { Header } from "@/components/ui/header"
import { TransferSearchForm } from "@/components/transfer-search-form"
import { BackgroundImage } from "@/components/ui/BackgroundImage"
import { AnimatedGroup } from "@/components/ui/animated-group"
import { sectionAnimationVariants } from "@/lib/animations"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function TransfersPage() {
  return (
    <div className="relative flex flex-col min-h-screen">
      <BackgroundImage bottomGradient={true} />

      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col gap-12 max-w-6xl mx-auto p-4 md:p-6 lg:p-8 w-full mt-[5%] md:mt-[8%] lg:mt-[10%]">
          
          {/* Hero Section */}
          <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl text-secondary font-bold tracking-tight">
                Airport & City Transfers
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground max-w-3xl mx-auto">
                Reliable, comfortable, and professional transfer services to and from Cluj-Napoca Airport, 
                hotels, and any destination in the city and surrounding areas.
              </p>
            </div>
          </AnimatedGroup>

          {/* Search Form */}
          <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
            <TransferSearchForm />
          </AnimatedGroup>

          {/* Features Section */}
          <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardHeader className="pb-2">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">24/7 Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Available round the clock for all your transfer needs, including early morning and late night flights.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader className="pb-2">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Modern Fleet</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Comfortable, well-maintained vehicles with air conditioning and professional drivers.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader className="pb-2">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Safe & Reliable</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Licensed drivers, fully insured vehicles, and real-time tracking for your peace of mind.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader className="pb-2">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Group Transfers</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Accommodate groups of all sizes with our range of vehicles from sedans to minibuses.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </AnimatedGroup>

          {/* How It Works Section */}
          <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  How Our Transfer Service Works
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Simple, straightforward booking process for hassle-free transfers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                    1
                  </div>
                  <h3 className="text-xl font-semibold">Book Online</h3>
                  <p className="text-muted-foreground">
                    Enter your pickup and dropoff locations, select date and time, and choose the number of passengers.
                  </p>
                </div>

                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                    2
                  </div>
                  <h3 className="text-xl font-semibold">Get Confirmation</h3>
                  <p className="text-muted-foreground">
                    Receive instant confirmation with driver details and vehicle information via email and SMS.
                  </p>
                </div>

                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                    3
                  </div>
                  <h3 className="text-xl font-semibold">Enjoy Your Ride</h3>
                  <p className="text-muted-foreground">
                    Meet your driver at the designated location and enjoy a comfortable, safe journey to your destination.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedGroup>

          {/* Popular Routes Section */}
          <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Popular Transfer Routes
                </h2>
                <p className="text-muted-foreground text-lg">
                  Most requested destinations from Cluj-Napoca Airport
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Airport to City Center
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Distance:</span>
                        <span className="font-medium">8 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">15-20 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price from:</span>
                        <span className="font-medium text-primary">25 €</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Airport to Hotels
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Distance:</span>
                        <span className="font-medium">5-12 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">10-25 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price from:</span>
                        <span className="font-medium text-primary">20 €</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      City to Train Station
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Distance:</span>
                        <span className="font-medium">3 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">8-12 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price from:</span>
                        <span className="font-medium text-primary">15 €</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Long Distance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>To Brasov:</span>
                        <span className="font-medium">180 €</span>
                      </div>
                      <div className="flex justify-between">
                        <span>To Bucharest:</span>
                        <span className="font-medium">350 €</span>
                      </div>
                      <div className="flex justify-between">
                        <span>To Sibiu:</span>
                        <span className="font-medium">120 €</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </AnimatedGroup>

          {/* What's Included Section */}
          <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-center text-2xl">What's Included in Every Transfer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    "Professional, licensed driver",
                    "Meet & greet service",
                    "Flight monitoring for delays",
                    "Free waiting time (60 min airport, 15 min other)",
                    "Child seats available on request",
                    "24/7 customer support",
                    "All taxes and fees included",
                    "Free cancellation up to 24h",
                    "SMS and email confirmations"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedGroup>
        </div>
      </main>

      <Footer
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />}
        brandName=""
      />
    </div>
  )
} 