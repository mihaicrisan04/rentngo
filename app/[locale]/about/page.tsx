"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { BackgroundImage } from "@/components/ui/background-image";
import {
  Car,
  Users,
  Shield,
  Award,
  Clock,
  MapPin,
  Heart,
  Star,
  ArrowRight,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { contactAnimationVariants as sectionAnimationVariants } from "@/lib/animations";

const AboutPage = () => {
  const t = useTranslations("aboutPage");
  const locale = useLocale();

  const stats = [
    { icon: Car, label: t("stats.vehicles"), value: "20+" },
    { icon: Users, label: t("stats.customers"), value: "200+" },
    { icon: Award, label: t("stats.experience"), value: "5+" },
    { icon: Star, label: t("stats.rating"), value: "4.9" },
  ];

  const values = [
    {
      icon: Shield,
      title: t("values.safetyFirst.title"),
      description: t("values.safetyFirst.description"),
    },
    {
      icon: Heart,
      title: t("values.customerCare.title"),
      description: t("values.customerCare.description"),
    },
    {
      icon: Clock,
      title: t("values.reliability.title"),
      description: t("values.reliability.description"),
    },
    {
      icon: MapPin,
      title: t("values.localExpertise.title"),
      description: t("values.localExpertise.description"),
    },
  ];

  return (
    <>
      <BackgroundImage bottomGradient={true} />

      <div className="relative z-10 flex flex-col flex-grow">
        {/* Hero Section */}
        <div className="flex flex-col gap-12 max-w-5xl mx-auto p-4 md:p-6 lg:p-8 w-full mt-[10%] md:mt-[15%] lg:mt-[20%]">
          <AnimatedGroup
            variants={sectionAnimationVariants}
            threshold={0.2}
            triggerOnce={true}
          >
            <div className="text-center relative">
              <div className="absolute inset-0 bg-black/40 blur-xl rounded-2xl -z-10 transform translate-x-1 translate-y-1"></div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/90">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                {t("title")}
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                {t("heroTitle")}
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                {t("heroDescription")}
              </p>
            </div>
          </AnimatedGroup>
        </div>

        {/* Stats Section — dramatic counter style */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <AnimatedGroup
              variants={sectionAnimationVariants}
              threshold={0.2}
              triggerOnce={true}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 max-w-5xl mx-auto">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="relative text-center p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group"
                  >
                    <div className="absolute top-4 right-4 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity">
                      <stat.icon className="w-16 h-16" />
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedGroup>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto w-full"></div>

        {/* Our Story Section — asymmetric editorial */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <AnimatedGroup
                variants={sectionAnimationVariants}
                threshold={0.2}
                triggerOnce={true}
              >
                <div className="flex flex-col items-center gap-3 mb-14">
                  <div className="accent-line"></div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center">
                    {t("ourStory.title")}
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl text-center">
                    {t("ourStory.subtitle")}
                  </p>
                </div>

                <div className="grid md:grid-cols-5 gap-12 items-center">
                  <div className="md:col-span-3 relative order-2 md:order-1">
                    <Card className="overflow-hidden p-0 relative h-[28rem] rounded-2xl shadow-2xl">
                      <Image
                        src="/our-story.jpg"
                        alt="Our Story"
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                    </Card>
                  </div>
                  <div className="md:col-span-2 space-y-6 order-1 md:order-2">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {t("ourStory.description1")}
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {t("ourStory.description2")}
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {t("ourStory.description3")}
                    </p>
                  </div>
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto w-full"></div>

        {/* Values Section */}
        <section className="py-20 px-4 relative grain-overlay">
          <div className="container mx-auto relative z-10">
            <div className="max-w-6xl mx-auto">
              <AnimatedGroup
                variants={sectionAnimationVariants}
                threshold={0.2}
                triggerOnce={true}
              >
                <div className="flex flex-col items-center gap-3 mb-14">
                  <div className="accent-line"></div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center">
                    {t("values.title")}
                  </h2>
                  <p className="text-muted-foreground text-lg text-center">
                    {t("values.subtitle")}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {values.map((value, index) => (
                    <Card
                      key={index}
                      className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 rounded-2xl"
                    >
                      <CardContent className="p-8">
                        <div className="flex items-start gap-5">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                            <value.icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              {value.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {value.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>

        {/* Mission CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <AnimatedGroup
                variants={sectionAnimationVariants}
                threshold={0.2}
                triggerOnce={true}
              >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground/[0.03] via-primary/[0.04] to-foreground/[0.03] border border-border/50 p-10 md:p-16 text-center">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                    {t("mission.title")}
                  </h2>
                  <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
                    {t("mission.description")}
                  </p>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground group"
                    asChild
                  >
                    <Link href={`/${locale}/contact`}>
                      {t("mission.buttonText")}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto w-full"></div>

        {/* Why Choose Us */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <AnimatedGroup
                variants={sectionAnimationVariants}
                threshold={0.2}
                triggerOnce={true}
              >
                <div className="flex flex-col items-center gap-3 mb-14">
                  <div className="accent-line"></div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center">
                    {t("whyChoose.title")}
                  </h2>
                  <p className="text-muted-foreground text-lg text-center">
                    {t("whyChoose.subtitle")}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: Shield,
                      color: "text-emerald-600 dark:text-emerald-400",
                      bg: "bg-emerald-500/10",
                      title: t("whyChoose.transparentPricing.title"),
                      desc: t("whyChoose.transparentPricing.description"),
                    },
                    {
                      icon: Car,
                      color: "text-blue-600 dark:text-blue-400",
                      bg: "bg-blue-500/10",
                      title: t("whyChoose.qualityFleet.title"),
                      desc: t("whyChoose.qualityFleet.description"),
                    },
                    {
                      icon: Clock,
                      color: "text-violet-600 dark:text-violet-400",
                      bg: "bg-violet-500/10",
                      title: t("whyChoose.support247.title"),
                      desc: t("whyChoose.support247.description"),
                    },
                  ].map((item, index) => (
                    <Card
                      key={index}
                      className="group text-center hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 rounded-2xl"
                    >
                      <CardContent className="p-8">
                        <div
                          className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}
                        >
                          <item.icon className={`w-7 h-7 ${item.color}`} />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-3">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
