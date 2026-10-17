"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { SignInButton } from "@clerk/nextjs";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ContactFields,
  type ContactFieldValues,
} from "@/components/features/checkout/contact-fields";
import type { PersonalInfo } from "@/hooks/use-reservation-form";
import type { FormErrors } from "@/lib/reservation-schema";

interface PersonalInfoCardProps {
  personalInfo: PersonalInfo;
  onPersonalInfoChange: React.Dispatch<React.SetStateAction<PersonalInfo>>;
  errors?: FormErrors["personalInfo"];
  isSignedIn: boolean;
}

export const PersonalInfoCard = React.memo(function PersonalInfoCard({
  personalInfo,
  onPersonalInfoChange,
  errors,
  isSignedIn,
}: PersonalInfoCardProps) {
  const t = useTranslations("reservationPage");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>{t("personalInfo.title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isSignedIn && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                {t("personalInfo.signInPrompt")}
              </p>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="w-full">
                  {t("personalInfo.signInButton")}
                </Button>
              </SignInButton>
            </div>
          )}

          <div className="space-y-4">
            <ContactFields
              values={personalInfo}
              onChange={(field: keyof ContactFieldValues, value) =>
                onPersonalInfoChange((prev) => ({ ...prev, [field]: value }))
              }
              errors={errors}
              phonePlaceholder="+40 123 456 789 or +44 20 7946 0958"
              showPhoneFormatHint
            />

            <div>
              <Label htmlFor="customer-message" className="pb-2">
                {t("personalInfo.additionalMessage")}
              </Label>
              <Textarea
                id="customer-message"
                placeholder={t("personalInfo.messagePlaceholder")}
                value={personalInfo.message}
                onChange={(e) =>
                  onPersonalInfoChange((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
