"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
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
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const t = useTranslations("profile");

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
              <p className="text-lg font-medium">{t("pleaseSignIn")}</p>
              <div className="flex justify-center">
                <Button onClick={() => (window.location.href = "/login")}>
                  {t("signInButton")}
                </Button>
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
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>

        <div className="space-y-8">
          {/* User Details and Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t("userDetails")}</CardTitle>
              <CardDescription>{t("userDetailsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4 max-w-2xl mx-auto">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.imageUrl} alt={displayName} />
                  <AvatarFallback className="text-lg">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-1">{displayName}</h3>
                  <p className="text-muted-foreground">
                    {primaryEmail}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <div className="max-w-2xl mx-auto">
                <UserProfileForm />
              </div>
            </CardContent>
          </Card>

          {/* User Reservations */}
          <Card>
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
