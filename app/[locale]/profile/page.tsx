"use client";

import React from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserProfileForm } from "@/components/shared/auth/user-profile-form";
import { UserReservationsTable } from "@/components/features/reservations/user-reservations-table";
import { AffiliateDashboard } from "@/components/features/affiliate/affiliate-dashboard";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const t = useTranslations("profile");

  if (!isLoaded) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto rounded-2xl border-border/50">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-5">
              <p className="text-lg font-medium">{t("pleaseSignIn")}</p>
              <div className="flex justify-center">
                <SignInButton mode="modal">
                  <Button className="rounded-xl px-6">
                    {t("signInButton")}
                  </Button>
                </SignInButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userInitials =
    `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();
  const displayName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.username ||
    "User";
  const primaryEmail = user.primaryEmailAddress?.emailAddress || "No email";

  return (
    <div className="flex-1">
      <div className="container mx-auto py-10 px-4 max-w-5xl">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="accent-line"></div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-2 text-center">{t("subtitle")}</p>
        </div>

        <div className="space-y-8">
          {/* User Details Card */}
          <Card className="rounded-2xl border-border/50 overflow-hidden">
            {/* Profile header with subtle background — pulled up over the
                Card's py-6 so the gradient reaches the top edge */}
            <div className="relative -mt-6 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 px-6 pt-8 pb-6">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                  <AvatarImage src={user.imageUrl} alt={displayName} />
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-2xl font-bold tracking-tight mb-1">
                    {displayName}
                  </h3>
                  <p className="text-muted-foreground">{primaryEmail}</p>
                </div>
              </div>
            </div>

            <CardHeader className="pt-2 pb-0">
              <CardTitle>{t("userDetails")}</CardTitle>
              <CardDescription>{t("userDetailsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Separator className="mb-6" />
              <div className="max-w-2xl mx-auto">
                <UserProfileForm />
              </div>
            </CardContent>
          </Card>

          {/* Affiliate program (renders only for enrolled affiliates) */}
          <AffiliateDashboard />

          {/* Reservations Card */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle>{t("reservations")}</CardTitle>
              <CardDescription>{t("reservationsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <UserReservationsTable />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
