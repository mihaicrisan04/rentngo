import { z } from "zod";
import { useTranslations } from "next-intl";
import { isValidInternationalPhoneNumber } from "@/lib/phone-validation";
import {
  PAYMENT_METHOD_IDS,
  type PaymentMethod,
} from "@/lib/checkout-payment-methods";

type Translator = ReturnType<typeof useTranslations>;

// Validation schema for the reservation form, with translated messages
export const createReservationSchema = (t: Translator) =>
  z.object({
    // Personal info
    name: z.string().min(1, t("validation.nameRequired")),
    email: z.string().email(t("validation.emailRequired")),
    phone: z
      .string()
      .min(1, t("validation.phoneRequired"))
      .refine(
        (val) => isValidInternationalPhoneNumber(val),
        t("validation.phoneFormatInvalid"),
      ),
    flightNumber: z.string().optional(),
    message: z.string().optional(),

    // Rental details
    deliveryLocation: z.string().min(1, t("validation.pickupLocationRequired")),
    pickupDate: z.date({ error: t("validation.pickupDateRequired") }),
    pickupTime: z.string().refine((val) => val.trim().length > 0, {
      message: t("validation.pickupTimeRequired"),
    }),
    restitutionLocation: z
      .string()
      .min(1, t("validation.returnLocationRequired")),
    returnDate: z.date({ error: t("validation.returnDateRequired") }),
    returnTime: z.string().refine((val) => val.trim().length > 0, {
      message: t("validation.returnTimeRequired"),
    }),

    // Payment
    paymentMethod: z
      .union([z.enum(PAYMENT_METHOD_IDS), z.undefined()])
      .refine((val) => val !== undefined, {
        message: t("validation.paymentMethodRequired"),
      }),
    termsAccepted: z
      .boolean()
      .refine((val) => val === true, t("validation.termsAcceptanceRequired")),
  });

// Raw form state fed to validation — fields the schema requires may still
// be missing here; Zod reports them as per-field errors.
export interface ReservationFormData {
  name: string;
  email: string;
  phone: string;
  flightNumber?: string;
  message?: string;
  deliveryLocation: string;
  pickupDate: Date | undefined;
  pickupTime: string;
  restitutionLocation: string;
  returnDate: Date | undefined;
  returnTime: string;
  paymentMethod: PaymentMethod | undefined;
  termsAccepted: boolean;
}

// Form validation errors, grouped by card
export interface FormErrors {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    flightNumber?: string;
  };
  rentalDetails?: {
    deliveryLocation?: string;
    pickupDate?: string;
    pickupTime?: string;
    restitutionLocation?: string;
    returnDate?: string;
    returnTime?: string;
  };
  payment?: {
    method?: string;
    termsAccepted?: string;
  };
}

const PERSONAL_INFO_FIELDS = ["name", "email", "phone", "flightNumber"];
const RENTAL_DETAIL_FIELDS = [
  "deliveryLocation",
  "pickupDate",
  "pickupTime",
  "restitutionLocation",
  "returnDate",
  "returnTime",
];

/**
 * Validate the reservation form: Zod schema plus the same-day time rule
 * (return time must be after pickup time when both fall on the same day).
 */
export function validateReservationForm(
  formData: ReservationFormData,
  t: Translator,
): FormErrors {
  const result = createReservationSchema(t).safeParse(formData);
  const newErrors: FormErrors = {};

  if (!result.success) {
    result.error.issues.forEach((error) => {
      const path = error.path[0] as string;

      // Map field names to error structure
      if (PERSONAL_INFO_FIELDS.includes(path)) {
        newErrors.personalInfo = {
          ...newErrors.personalInfo,
          [path]: error.message,
        };
      } else if (RENTAL_DETAIL_FIELDS.includes(path)) {
        newErrors.rentalDetails = {
          ...newErrors.rentalDetails,
          [path]: error.message,
        };
      } else if (path === "paymentMethod") {
        newErrors.payment = { ...newErrors.payment, method: error.message };
      } else if (path === "termsAccepted") {
        newErrors.payment = {
          ...newErrors.payment,
          termsAccepted: error.message,
        };
      }
    });
  }

  // Additional validation for same-day time logic
  const { pickupDate, returnDate, pickupTime, returnTime } = formData;
  if (pickupDate && returnDate && pickupTime && returnTime) {
    const isSameDay =
      pickupDate.getFullYear() === returnDate.getFullYear() &&
      pickupDate.getMonth() === returnDate.getMonth() &&
      pickupDate.getDate() === returnDate.getDate();

    if (isSameDay) {
      const [pickupHour, pickupMinute] = pickupTime.split(":").map(Number);
      const [returnHour, returnMinute] = returnTime.split(":").map(Number);

      if (
        returnHour < pickupHour ||
        (returnHour === pickupHour && returnMinute <= pickupMinute)
      ) {
        newErrors.rentalDetails = {
          ...newErrors.rentalDetails,
          returnTime: t("validation.returnTimeSameDay"),
        };
      }
    }
  }

  return newErrors;
}

export function hasFormErrors(errors: FormErrors): boolean {
  return Object.keys(errors).some(
    (key) => Object.keys(errors[key as keyof FormErrors] || {}).length > 0,
  );
}
