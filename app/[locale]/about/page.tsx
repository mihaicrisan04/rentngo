'use client';

import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { BackgroundImage } from '@/components/ui/BackgroundImage';
import { Car, Users, Shield, Award, Clock, MapPin, Heart, Star } from 'lucide-react';
import { Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';

// Define animation variants
const sectionAnimationVariants: {
  container: Variants;
  item: Variants;
} = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      scale: 0.95,
      filter: "blur(4px)",
      y: 20,
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
        duration: 0.6,
      },
    },
  },
};

const AboutPage = () => {
  const t = useTranslations('aboutPage');

  const stats = [
    { icon: Car, label: t('stats.vehicles'), value: "20+" },
    { icon: Users, label: t('stats.customers'), value: "200+" },
    { icon: Award, label: t('stats.experience'), value: "5+" },
    { icon: Star, label: t('stats.rating'), value: "4.9" },
  ];

  const values = [
    {
      icon: Shield,
      title: t('values.safetyFirst.title'),
      description: t('values.safetyFirst.description')
    },
    {
      icon: Heart,
      title: t('values.customerCare.title'),
      description: t('values.customerCare.description')
    },
    {
      icon: Clock,
      title: t('values.reliability.title'),
      description: t('values.reliability.description')
    },
    {
      icon: MapPin,
      title: t('values.localExpertise.title'),
      description: t('values.localExpertise.description')
    }
  ];

  return (
    <div className="relative flex flex-col min-h-screen">
      <BackgroundImage bottomGradient={true} />

      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="relative z-10 flex flex-col gap-8 flex-grow">
        <div className="flex flex-col gap-12 max-w-5xl mx-auto p-4 md:p-6 lg:p-8 w-full mt-[10%] md:mt-[15%] lg:mt-[20%]">
          {/* Hero Section */}
          <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
            <div className="text-center">
              <Badge variant="outline" className="mb-4 px-4 py-2 text-lg text-primary">
                {t('title')}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
                {t('heroTitle')}
              </h1>
              <p className="text-xl text-primary-foreground max-w-3xl mx-auto leading-relaxed">
                {t('heroDescription')}
              </p>
            </div>
          </AnimatedGroup>
        </div>

        {/* Stats Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </AnimatedGroup>
          </div>
        </section>

        <Separator className="my-0" />

        {/* Our Story Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
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
              </AnimatedGroup>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 bg-muted/20">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {t('values.title')}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {t('values.subtitle')}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {values.map((value, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
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

        {/* Mission Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                  <CardContent className="p-8 md:p-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                      {t('mission.title')}
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                      {t('mission.description')}
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => window.location.href = '/contact'}
                    >
                      {t('mission.buttonText')}
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedGroup>
            </div>
          </div>
        </section>

        <Separator className="my-0" />

        {/* Why Choose Us Section */}
        <section className="py-16 px-4 bg-card/30">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {t('whyChoose.title')}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {t('whyChoose.subtitle')}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {t('whyChoose.transparentPricing.title')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('whyChoose.transparentPricing.description')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Car className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {t('whyChoose.qualityFleet.title')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('whyChoose.qualityFleet.description')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="text-center hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {t('whyChoose.support247.title')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('whyChoose.support247.description')}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>
      </main>

      <Footer
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />}
        brandName=""
      />
    </div>
  );
};

export default AboutPage;
