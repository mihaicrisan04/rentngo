"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedGroup } from "@/components/ui/animated-group";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ExternalLink,
  Clock,
} from "lucide-react";
import {
  contactAnimationVariants,
  sectionAnimationVariants,
} from "@/lib/animations";
import { SocialIcon } from "react-social-icons";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

const ContactPage = () => {
  const t = useTranslations("contactPage");

  const handleMapClick = () => {
    const mapsUrl = "https://maps.app.goo.gl/GqUHujmeuz49U4U27";
    window.open(mapsUrl, "_blank");
  };

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/40773932961?text=${encodeURIComponent(t("whatsappMessage"))}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePhoneClick = () => {
    const phoneNumber = "+40773932961";
    navigator.clipboard.writeText(phoneNumber).then(() => {
      toast.success(t("phoneCopied"));
    });
  };

  const handleEmailClick = () => {
    window.location.href = "mailto:office@rngo.ro";
  };

  return (
    <>
      <div className="flex-grow bg-gradient-to-b from-background via-background to-muted/20">
        {/* Hero Section */}
        <section className="pt-20 pb-12 px-4">
          <div className="container mx-auto text-center">
            <AnimatedGroup
              variants={contactAnimationVariants}
              threshold={0.2}
              triggerOnce={true}
            >
              <div className="flex flex-col items-center gap-3 mb-4">
                <div className="accent-line"></div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 tracking-tight">
                {t("title")}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t("subtitle")}
              </p>
            </AnimatedGroup>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <AnimatedGroup
                variants={contactAnimationVariants}
                threshold={0.2}
                triggerOnce={true}
              >
                <div className="flex flex-col items-center gap-3 mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    {t("letsConnect.title")}
                  </h2>
                  <p className="text-muted-foreground text-lg text-center">
                    {t("letsConnect.subtitle")}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Phone */}
                  <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 rounded-2xl">
                    <CardContent className="p-8 text-center">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                        <Phone className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {t("contactMethods.phone.title")}
                      </h3>
                      <p className="text-muted-foreground mb-5">
                        {t("contactMethods.phone.description")}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full rounded-xl"
                        onClick={handlePhoneClick}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {t("contactMethods.phone.buttonText")}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* WhatsApp */}
                  <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-emerald-500/20 rounded-2xl">
                    <CardContent className="p-8 text-center">
                      <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {t("contactMethods.whatsapp.title")}
                      </h3>
                      <p className="text-muted-foreground mb-5">
                        {t("contactMethods.whatsapp.description")}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full rounded-xl"
                        onClick={handleWhatsAppClick}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {t("contactMethods.whatsapp.buttonText")}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Email */}
                  <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-violet-500/20 rounded-2xl">
                    <CardContent className="p-8 text-center">
                      <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                        <Mail className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {t("contactMethods.email.title")}
                      </h3>
                      <p className="text-muted-foreground mb-5">
                        {t("contactMethods.email.description")}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full rounded-xl"
                        onClick={handleEmailClick}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {t("contactMethods.email.buttonText")}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Social Media */}
                <div className="mt-14 text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-5">
                    {t("followUs")}
                  </h3>
                  <div className="flex justify-center gap-4">
                    <SocialIcon
                      url="https://www.tiktok.com/@rentn.go"
                      style={{ height: 40, width: 40 }}
                      borderRadius={"0.75rem"}
                      className="hover:scale-110 transition-transform"
                    />
                    <SocialIcon
                      url="https://www.instagram.com/rentn_go.ro"
                      style={{ height: 40, width: 40 }}
                      borderRadius={"0.75rem"}
                      className="hover:scale-110 transition-transform"
                    />
                    <SocialIcon
                      url="https://www.facebook.com/share/1Ad82uMtP3/?mibextid=wwXIfr"
                      style={{ height: 40, width: 40 }}
                      borderRadius={"0.75rem"}
                      className="hover:scale-110 transition-transform"
                    />
                  </div>
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto w-full"></div>

        {/* Founder Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto">
              <AnimatedGroup
                variants={contactAnimationVariants}
                threshold={0.2}
                triggerOnce={true}
              >
                <div className="flex flex-col items-center gap-3 mb-12">
                  <div className="accent-line"></div>
                  <Badge
                    variant="outline"
                    className="px-4 py-1.5 text-base rounded-full"
                  >
                    {t("meetTheMan")}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center">
                    {t("visionaryTitle")}
                  </h2>
                  <p className="text-muted-foreground text-lg text-center">
                    {t("visionarySubtitle")}
                  </p>
                </div>

                <Card className="overflow-hidden shadow-2xl rounded-3xl border-border/50">
                  <CardContent className="p-0">
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
                      <div className="p-10 md:p-14 flex flex-col justify-center">
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                          {t("founder.name")}
                        </h3>
                        <p className="text-lg text-primary font-semibold mb-6">
                          {t("founder.title")}
                        </p>
                        <p className="text-muted-foreground leading-relaxed mb-8">
                          {t("founder.description")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="secondary"
                            className="rounded-lg px-3 py-1"
                          >
                            {t("founder.badges.expert")}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="rounded-lg px-3 py-1"
                          >
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

        <div className="section-divider max-w-5xl mx-auto w-full"></div>

        {/* Map + Hours — side by side on desktop */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto">
              <AnimatedGroup
                variants={sectionAnimationVariants}
                threshold={0.2}
                triggerOnce={true}
              >
                <div className="flex flex-col items-center gap-3 mb-12">
                  <div className="accent-line"></div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center">
                    {t("ourLocation")}
                  </h2>
                  <p className="text-muted-foreground text-lg text-center">
                    {t("locationDescription")}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Map Card */}
                  <Card className="overflow-hidden shadow-xl rounded-2xl md:col-span-2 border-border/50">
                    <CardContent className="p-0">
                      <div className="relative h-72 md:h-80">
                        <Image
                          src="/maps.png"
                          alt="Rent'n Go Office Location Map"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <p className="text-muted-foreground flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>
                              Cluj &quot;Avram Iancu&quot; International
                              Airport, Strada Traian Vuia 149-151, Cluj-Napoca
                              400397
                            </span>
                          </p>
                          <Button
                            onClick={handleMapClick}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0 rounded-xl"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t("openInMaps")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Business Hours */}
                  <Card className="rounded-2xl border-border/50 flex flex-col justify-center">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">
                          {t("businessHours.title")}
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-border/50">
                          <span className="font-medium text-foreground">
                            {t("businessHours.mondayToSunday")}
                          </span>
                          <span className="text-primary font-semibold">
                            {t("businessHours.mondayToSundayTime")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">24/7</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;
