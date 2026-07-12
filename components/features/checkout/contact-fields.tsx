"use client";

import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ContactFieldValues {
  name: string;
  email: string;
  phone: string;
  flightNumber: string;
}

export interface ContactFieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  flightNumber?: string;
}

interface ContactFieldsProps {
  values: ContactFieldValues;
  onChange: (field: keyof ContactFieldValues, value: string) => void;
  errors?: ContactFieldErrors;
  /** Append " *" to the required labels (transfer checkout style). */
  showRequiredMarkers?: boolean;
  /** Overrides the translated phone placeholder (reservation shows a format example). */
  phonePlaceholder?: string;
  /** Show the phone-format helper text under the phone input. */
  showPhoneFormatHint?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-red-500 mt-1 flex items-center">
      <AlertCircle className="h-4 w-4 mr-1" />
      {message}
    </p>
  );
}

/**
 * Name / email / phone / flight-number inputs shared by the reservation and
 * transfer checkouts. Page-specific fields (message, luggage) stay with the
 * page.
 */
export function ContactFields({
  values,
  onChange,
  errors,
  showRequiredMarkers = false,
  phonePlaceholder,
  showPhoneFormatHint = false,
}: ContactFieldsProps) {
  const t = useTranslations("reservationPage");
  const required = showRequiredMarkers ? " *" : "";

  return (
    <>
      <div>
        <Label htmlFor="contact-name" className="pb-2">
          {t("personalInfo.fullName")}
          {required}
        </Label>
        <Input
          id="contact-name"
          type="text"
          placeholder={t("personalInfo.fullNamePlaceholder")}
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          className={cn(errors?.name && "border-red-500")}
        />
        <FieldError message={errors?.name} />
      </div>

      <div>
        <Label htmlFor="contact-email" className="pb-2">
          {t("personalInfo.emailAddress")}
          {required}
        </Label>
        <Input
          id="contact-email"
          type="email"
          placeholder={t("personalInfo.emailPlaceholder")}
          value={values.email}
          onChange={(e) => onChange("email", e.target.value)}
          className={cn(errors?.email && "border-red-500")}
        />
        <FieldError message={errors?.email} />
      </div>

      <div>
        <Label htmlFor="contact-phone" className="pb-2">
          {t("personalInfo.phoneNumber")}
          {required}
        </Label>
        <Input
          id="contact-phone"
          type="tel"
          placeholder={phonePlaceholder ?? t("personalInfo.phonePlaceholder")}
          value={values.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          className={cn(errors?.phone && "border-red-500")}
        />
        <FieldError message={errors?.phone} />
        {showPhoneFormatHint && (
          <p className="text-xs text-muted-foreground mt-1">
            {t("personalInfo.phoneFormat")}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="contact-flight" className="pb-2">
          {t("personalInfo.flightNumber")}
        </Label>
        <Input
          id="contact-flight"
          type="text"
          placeholder={t("personalInfo.flightPlaceholder")}
          value={values.flightNumber}
          onChange={(e) => onChange("flightNumber", e.target.value)}
          className={cn(errors?.flightNumber && "border-red-500")}
        />
        <FieldError message={errors?.flightNumber} />
      </div>
    </>
  );
}
