'use client';

import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook, ExternalLink } from 'lucide-react';
import { contactAnimationVariants, sectionAnimationVariants } from '@/lib/animations';

const ContactPage = () => {
  const handleMapClick = () => {
    // Replace with your actual Google Maps coordinates
    const mapsUrl = "https://maps.google.com/?q=Rent'n+Go+Office,+Bucharest,+Romania";
    window.open(mapsUrl, '_blank');
  };

  const handleWhatsAppClick = () => {
    // Replace with actual WhatsApp number
    const whatsappUrl = "https://wa.me/40773932961?text=Hello!%20I'm%20interested%20in%20your%20rental%20services.";
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="flex-grow bg-gradient-to-br from-background via-background to-muted/30">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <AnimatedGroup variants={contactAnimationVariants} threshold={0.2} triggerOnce={true}>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Get in Touch
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ready to hit the road? We're here to make your rental experience smooth and memorable.
              </p>
            </AnimatedGroup>
          </div>
        </section>

        {/* Owner Section */}
        <section className="py-16 px-4 bg-card/50">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <AnimatedGroup variants={contactAnimationVariants} threshold={0.2} triggerOnce={true}>
                <div className="text-center mb-12">
                  <Badge variant="outline" className="mb-4 px-4 py-2 text-lg">
                    Meet the Man
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    The Visionary Behind the Wheels
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Driven by passion
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
                          Tudor
                        </h3>
                        <p className="text-lg text-primary font-semibold mb-6">
                          Founder & CEO
                        </p>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          With over a decade of experience in the automotive industry, Tudor founded Rent'n Go 
                          with a simple mission: to provide premium vehicles and exceptional service that exceeds 
                          expectations. His attention to detail and commitment to customer satisfaction drives 
                          every aspect of our business.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Automotive Expert</Badge>
                          <Badge variant="secondary">Customer-First</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedGroup>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <AnimatedGroup variants={contactAnimationVariants} threshold={0.2} triggerOnce={true}>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Let's Connect
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Multiple ways to reach us - choose what works best for you
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Phone Contact */}
                  <Card className="hover:shadow-lg transition-shadow duration-300 border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Phone</h3>
                      <p className="text-muted-foreground mb-4">Call us directly</p>
                      <Button variant="outline" className="w-full">
                        <Phone className="w-4 h-4 mr-2" />
                        +40 773 932 961
                      </Button>
                    </CardContent>
                  </Card>

                  {/* WhatsApp */}
                  <Card className="hover:shadow-lg transition-shadow duration-300 border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">WhatsApp</h3>
                      <p className="text-muted-foreground mb-4">Quick & easy messaging</p>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleWhatsAppClick}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message Us
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Email */}
                  <Card className="hover:shadow-lg transition-shadow duration-300 border-border/50">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Email</h3>
                      <p className="text-muted-foreground mb-4">Detailed inquiries</p>
                      <Button variant="outline" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        office@rngo.com
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Social Media */}
                <div className="mt-12 text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-6">Follow Us</h3>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" size="lg" className="rounded-full">
                      <Instagram className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="lg" className="rounded-full">
                      <Facebook className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 px-4 bg-card/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Visit Our Office
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Located in the heart of Cluj-Napoca for your convenience
                  </p>
                </div>

                <Card className="overflow-hidden shadow-xl">
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Static Map Image Placeholder */}
                      <div className="h-80 bg-muted/50 flex items-center justify-center relative">
                        <div className="text-center">
                          <MapPin className="w-16 h-16 text-red-500 mx-auto mb-4" />
                          <p className="text-foreground text-lg font-medium">
                            Rent'n Go Office
                          </p>
                          <p className="text-muted-foreground">
                            Cluj-Napoca, Romania
                          </p>
                        </div>
                        {/* You can replace this with an actual static map image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-40"></div>
                      </div>
                      
                      <div className="p-6 bg-card">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              Our Location
                            </h3>
                            <p className="text-muted-foreground flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              Calea Turzii, Cluj-Napoca, Romania
                            </p>
                          </div>
                          <Button 
                            onClick={handleMapClick}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in Google Maps
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
        <section className="py-16 px-4 bg-muted/20">
          <div className="container mx-auto">
            <div className="max-w-2xl mx-auto">
              <AnimatedGroup variants={sectionAnimationVariants} threshold={0.2} triggerOnce={true}>
                <Card>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                      Business Hours
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="font-medium text-foreground">Monday - Friday</span>
                        <span className="text-muted-foreground">9:00 AM - 7:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="font-medium text-foreground">Saturday</span>
                        <span className="text-muted-foreground">9:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium text-foreground">Sunday</span>
                        <span className="text-muted-foreground">10:00 AM - 4:00 PM</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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

export default ContactPage; 