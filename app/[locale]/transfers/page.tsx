"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { TransferSearchForm } from "@/components/features/transfers/transfer-search-form";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { sectionAnimationVariants } from "@/lib/animations";
import { Car, Shield, Clock, MapPin } from "lucide-react";

export default function TransfersPage() {
  const t = useTranslations("transferPage");

  const features = [
    {
      id: "premium",
      icon: Car,
      title: "Premium Vehicles",
      description: "Travel in comfort with our luxury fleet",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      id: "safe",
      icon: Shield,
      title: "Safe & Reliable",
      description: "Professional drivers with verified backgrounds",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      id: "ontime",
      icon: Clock,
      title: "On-Time Service",
      description: "Punctual pickups and drop-offs guaranteed",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      id: "destination",
      icon: MapPin,
      title: "Any Destination",
      description: "Airport transfers and city-to-city routes",
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <>
      <div className="grow flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
        {/* Hero Section */}
        <section className="relative pt-16 pb-8 lg:pt-24 lg:pb-12">
          <div className="container mx-auto px-4">
            <AnimatedGroup
              variants={sectionAnimationVariants}
              threshold={0.2}
              triggerOnce={true}
            >
              <div className="text-center max-w-3xl mx-auto mb-10 lg:mb-14">
                <div className="flex justify-center mb-6">
                  <div className="accent-line"></div>
                </div>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-5 tracking-tight">
                  {t("title")}
                </h1>
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                  {t("subtitle")}
                </p>
              </div>

              {/* Search Form */}
              <div className="max-w-4xl mx-auto">
                <TransferSearchForm />
              </div>
            </AnimatedGroup>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto w-full my-4"></div>

        {/* How It Works Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <AnimatedGroup
              variants={sectionAnimationVariants}
              threshold={0.2}
              triggerOnce={true}
            >
              <div className="flex flex-col items-center gap-3 mb-12">
                <div className="accent-line"></div>
                <h2 className="text-2xl lg:text-3xl font-bold text-center">
                  {t("howItWorks.title")}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
                {/* Connecting line behind steps (desktop) */}
                <div className="hidden md:block absolute top-7 left-[16.7%] right-[16.7%] h-[2px] bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20"></div>

                {[
                  { num: 1, title: t("howItWorks.step1.title"), desc: t("howItWorks.step1.description") },
                  { num: 2, title: t("howItWorks.step2.title"), desc: t("howItWorks.step2.description") },
                  { num: 3, title: t("howItWorks.step3.title"), desc: t("howItWorks.step3.description") },
                ].map((step) => (
                  <div key={step.num} className="flex flex-col items-center text-center relative">
                    <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-5 shadow-lg shadow-primary/20 relative z-10">
                      {step.num}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </AnimatedGroup>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto w-full"></div>

        {/* Features Grid */}
        <section className="py-16 lg:py-24 relative grain-overlay">
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedGroup
              variants={sectionAnimationVariants}
              threshold={0.2}
              triggerOnce={true}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {features.map((feature) => (
                  <Card
                    key={feature.id}
                    className="group text-center hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 rounded-2xl"
                  >
                    <CardContent className="p-8">
                      <div
                        className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}
                      >
                        <feature.icon className={`w-7 h-7 ${feature.color}`} />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </div>
    </>
  );
}
