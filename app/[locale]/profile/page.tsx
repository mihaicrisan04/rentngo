"use client";

import React from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from 'next-intl';
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserProfileForm } from "@/components/user-profile-form";
import { UserReservationsTable } from "@/components/user-reservations-table";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const t = useTranslations('profile');

  if (!isLoaded) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">{t('pleaseSignIn')}</p>
              <div className="flex justify-center">
                <Button onClick={() => window.location.href = '/login'}>
                  {t('signInButton')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userInitials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User';
  const primaryEmail = user.primaryEmailAddress?.emailAddress || 'No email';

  return (
    <div className="flex flex-col min-h-screen">
      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />
      
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
          </div>

          <div className="space-y-8">
            {/* User Details and Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t('userDetails')}</CardTitle>
                <CardDescription>{t('userDetailsDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
                  <div className="flex justify-center sm:justify-start">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.imageUrl} alt={displayName} />
                      <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="text-2xl font-semibold mb-2">{displayName}</h3>
                    <p className="text-muted-foreground text-lg">{primaryEmail}</p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Profile Form */}
                <UserProfileForm />
              </CardContent>
            </Card>

            {/* User Reservations */}
            <Card>
              <CardHeader>
                <CardTitle>{t('reservations')}</CardTitle>
                <CardDescription>{t('reservationsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <UserReservationsTable />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />}
        brandName=""
      />
    </div>
  );
} 
