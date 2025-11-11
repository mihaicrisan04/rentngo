"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Phone, Mail, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import {
  contactAnimationVariants,
  sectionAnimationVariants,
} from "@/lib/animations";
import { SocialIcon } from "react-social-icons";
import { useTranslations } from "next-intl";
import Head from "next/head";
import { toast } from "sonner";

const ContactPage = () => {
  const t = useTranslations("contactPage");

  const handleMapClick = () => {
    // Replace with your actual Google Maps coordinates
    const mapsUrl = "https://maps.app.goo.gl/GqUHujmeuz49U4U27";
    window.open(mapsUrl, "_blank");
  };

  const handleWhatsAppClick = () => {
    // Replace with actual WhatsApp number
    const whatsappUrl =
      "https://wa.me/40773932961?text=Hello!%20I'm%20interested%20in%20your%20rental%20services.";
    window.open(whatsappUrl, "_blank");
  };

  const handlePhoneClick = () => {
    const phoneNumber = "+40773932961";
    navigator.clipboard.writeText(phoneNumber).then(() => {
      toast.success("Phone number copied to clipboard!");
    });
  };

  const handleEmailClick = () => {
    window.location.href = "mailto:office@rngo.com";
  };

  return (
    <>
      <Head>
        <title>Contact Rent'n Go - Masini de Inchiriat Cluj-Napoca</title>
        <meta
          name="description"
          content="Contactează Rent'n Go pentru masini de inchiriat Cluj-Napoca. Telefon: +40 773 932 961. Email: office@rngo.com. Servicii profesionale de închiriere auto în Cluj."
        />
        <meta
          name="keywords"
          content="contact rent n go, masini de inchiriat cluj-napoca, telefon închiriere auto cluj, car rentals cluj contact"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ContactPage",
              mainEntity: {
                "@type": "Organization",
                name: "Rent'n Go",
                telephone: "+40-773-932-961",
                email: "office@rngo.com",
                address: {
                  "@type": "PostalAddress",
                  streetAddress:
                    'Cluj "Avram Iancu" International Airport, Strada Traian Vuia 149-151',
                  addressLocality: "Cluj-Napoca",
                  postalCode: "400397",
                  addressCountry: "RO",
                },
                openingHours: ["Mo-Su 00:00-23:59"],
                contactPoint: [
                  {
                    "@type": "ContactPoint",
                    telephone: "+40-773-932-961",
                    contactType: "customer service",
                    availableLanguage: ["Romanian", "English"],
                    areaServed: "Cluj-Napoca",
                  },
                  {
                    "@type": "ContactPoint",
                    email: "office@rngo.com",
                    contactType: "customer service",
                    availableLanguage: ["Romanian", "English"],
                  },
                ],
              },
            }),
          }}
        />
      </Head>

      <div className="flex-grow bg-gradient-to-br from-background via-background to-muted/30">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <AnimatedGroup
              variants={contactAnimationVariants}
              threshold={0.2}
              triggerOnce={true}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t("title")}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("subtitle")}
              </p>
            </AnimatedGroup>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <AnimatedGroup
                variants={contactAnimationVariants}
                threshold={0.2}
                triggerOnce={true}
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {t("letsConnect.title")}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {t("letsConnect.subtitle")}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Phone Contact */}
                  <Card className="hover:shadow-lg transition-shadow duration-300 border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {t("contactMethods.phone.title")}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {t("contactMethods.phone.description")}
                      </p>
                      <Button variant="outline" className="w-full" onClick={handlePhoneClick}>
                        <Phone className="w-4 h-4 mr-2" />
                        {t("contactMethods.phone.buttonText")}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* WhatsApp */}
                  <Card className="hover:shadow-lg transition-shadow duration-300 border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {t("contactMethods.whatsapp.title")}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {t("contactMethods.whatsapp.description")}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleWhatsAppClick}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {t("contactMethods.whatsapp.buttonText")}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Email */}
                  <Card className="hover:shadow-lg transition-shadow duration-300 border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {t("contactMethods.email.title")}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {t("contactMethods.email.description")}
                      </p>
                      <Button variant="outline" className="w-full" onClick={handleEmailClick}>
                        <Mail className="w-4 h-4 mr-2" />
                        {t("contactMethods.email.buttonText")}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Social Media */}
                <div className="mt-12 text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-6">
                    {t("followUs")}
                  </h3>
                  <div className="flex justify-center gap-4">
                    <SocialIcon
                      url="https://www.tiktok.com/@rentn.go"
                      style={{ height: 36, width: 36 }}
                      borderRadius={"0.5rem"}
                    />
                    <SocialIcon
                      url="https://www.instagram.com/rentn_go.ro"
                      style={{ height: 36, width: 36 }}
                      borderRadius={"0.5rem"}
                    />
                    <SocialIcon
                      url="https://www.facebook.com/share/1Ad82uMtP3/?mibextid=wwXIfr"
                      style={{ height: 36, width: 36 }}
                      borderRadius={"0.5rem"}
                    />
                  </div>
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>

        {/* Owner Section */}
        <section className="py-16 px-4 bg-card/50">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <AnimatedGroup
                variants={contactAnimationVariants}
                threshold={0.2}
                triggerOnce={true}
              >
                <div className="text-center mb-12">
                  <Badge variant="outline" className="mb-4 px-4 py-2 text-lg">
                    {t("meetTheMan")}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {t("visionaryTitle")}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {t("visionarySubtitle")}
                  </p>
                </div>

                <Card className="overflow-hidden shadow-xl">
                  <CardContent className="px-6">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative w-full h-full min-h-[400px]">
                        <Image
                          src="/tudor.jpg"
                          alt="Tudor - Founder & CEO"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                      <div className="p-8 md:p-12 flex flex-col justify-center">
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                          {t("founder.name")}
                        </h3>
                        <p className="text-lg text-primary font-semibold mb-6">
                          {t("founder.title")}
                        </p>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          {t("founder.description")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            {t("founder.badges.expert")}
                          </Badge>
                          <Badge variant="secondary">
                            {t("founder.badges.customerFirst")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedGroup>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 px-4 bg-card/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <AnimatedGroup
                variants={sectionAnimationVariants}
                threshold={0.2}
                triggerOnce={true}
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {t("ourLocation")}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {t("locationDescription")}
                  </p>
                </div>

                <Card className="overflow-hidden shadow-xl">
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Map Image */}
                      <div className="h-80 relative">
                        <Image
                          src="/maps.png"
                          alt="Rent'n Go Office Location Map"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>

                      <div className="p-6 bg-card">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              Our Location
                            </h3>
                            <p className="text-muted-foreground flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              Cluj "Avram Iancu" International Airport Strada
                              Traian Vuia 149-151, Cluj-Napoca 400397
                            </p>
                          </div>
                          <Button
                            onClick={handleMapClick}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t("openInMaps")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedGroup>
            </div>
          </div>
        </section>

        {/* Business Hours */}
        <section className="py-16 px-4 bg-card/30">
          <div className="container mx-auto">
            <div className="max-w-2xl mx-auto">
              <AnimatedGroup
                variants={sectionAnimationVariants}
                threshold={0.2}
                triggerOnce={true}
              >
                <Card>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                      {t("businessHours.title")}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="font-medium text-foreground">
                          {t("businessHours.mondayToSunday")}
                        </span>
                        <span className="text-muted-foreground">
                          {t("businessHours.mondayToSundayTime")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedGroup>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;
