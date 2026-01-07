// IMPORTANT: this is a Convex Node Action - required for React Email rendering
"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { render } from "@react-email/render";
import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import React from "react";

// Import email templates
import { AdminReservationEmail } from "./emails/templates/AdminReservationEmail";
import { UserReservationEmail } from "./emails/templates/UserReservationEmail";
import { UserTransferEmail } from "./emails/templates/UserTransferEmail";
import { AdminTransferEmail } from "./emails/templates/AdminTransferEmail";
import { ReservationEmailData, TransferEmailData } from "./emails/types";

// Initialize Resend component (testMode: false for production)
export const resend = new Resend(components.resend, { testMode: false });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "office@rngo.ro";
const FROM_EMAIL = "Rent'n Go <noreply@rngo.ro>";

// Validators for email data
const customerInfoValidator = v.object({
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  message: v.optional(v.string()),
  flightNumber: v.optional(v.string()),
});

const vehicleInfoValidator = v.object({
  make: v.string(),
  model: v.string(),
  year: v.optional(v.number()),
  type: v.optional(v.string()),
  seats: v.optional(v.number()),
  transmission: v.optional(v.string()),
  fuelType: v.optional(v.string()),
  features: v.optional(v.array(v.string())),
});

const rentalDetailsValidator = v.object({
  startDate: v.string(),
  endDate: v.string(),
  pickupTime: v.string(),
  restitutionTime: v.string(),
  pickupLocation: v.string(),
  restitutionLocation: v.string(),
  numberOfDays: v.number(),
});

const pricingDetailsValidator = v.object({
  pricePerDay: v.number(),
  totalPrice: v.number(),
  paymentMethod: v.string(),
  promoCode: v.optional(v.string()),
  additionalCharges: v.optional(
    v.array(
      v.object({
        description: v.string(),
        amount: v.number(),
      })
    )
  ),
  isSCDWSelected: v.optional(v.boolean()),
  deductibleAmount: v.optional(v.number()),
  protectionCost: v.optional(v.number()),
});

// Send reservation confirmation emails (admin + customer)
export const sendReservationConfirmationEmail = internalAction({
  args: {
    reservationNumber: v.number(),
    customerInfo: customerInfoValidator,
    vehicleInfo: vehicleInfoValidator,
    rentalDetails: rentalDetailsValidator,
    pricingDetails: pricingDetailsValidator,
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const emailData: ReservationEmailData = {
      reservationNumber: args.reservationNumber,
      customerInfo: args.customerInfo,
      vehicleInfo: args.vehicleInfo as ReservationEmailData["vehicleInfo"],
      rentalDetails: args.rentalDetails,
      pricingDetails: args.pricingDetails as ReservationEmailData["pricingDetails"],
      locale: (args.locale === "ro" ? "ro" : "en") as "en" | "ro",
    };

    try {
      // Render admin email
      const adminHtml = await render(AdminReservationEmail({ data: emailData }) as React.ReactElement);

      // Send admin notification email
      await resend.sendEmail(ctx, {
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject: `New reservation request #${args.reservationNumber}`,
        html: adminHtml,
        replyTo: [args.customerInfo.email],
      });

      // Render user email
      const userHtml = await render(UserReservationEmail({ data: emailData }) as React.ReactElement);

      // Send user confirmation email
      await resend.sendEmail(ctx, {
        from: FROM_EMAIL,
        to: [args.customerInfo.email],
        subject: `Request submitted #${args.reservationNumber}`,
        html: userHtml,
        replyTo: ["office@rngo.ro"],
      });

      console.log(
        `Reservation confirmation emails sent for #${args.reservationNumber}`
      );
    } catch (error) {
      console.error("Error sending reservation emails:", error);
      throw error;
    }
  },
});

// Transfer email validators
const transferLocationValidator = v.object({
  address: v.string(),
});

const transferVehicleInfoValidator = v.object({
  make: v.string(),
  model: v.string(),
  year: v.optional(v.number()),
});

const transferPricingDetailsValidator = v.object({
  baseFare: v.number(),
  distancePrice: v.number(),
  totalPrice: v.number(),
  pricePerKm: v.number(),
});

// Send transfer confirmation emails (customer + admin)
export const sendTransferConfirmationEmail = internalAction({
  args: {
    transferNumber: v.number(),
    customerInfo: customerInfoValidator,
    vehicleInfo: transferVehicleInfoValidator,
    pickupLocation: transferLocationValidator,
    dropoffLocation: transferLocationValidator,
    pickupDate: v.string(),
    pickupTime: v.string(),
    returnDate: v.optional(v.string()),
    returnTime: v.optional(v.string()),
    transferType: v.string(),
    passengers: v.number(),
    luggageCount: v.optional(v.number()),
    distanceKm: v.number(),
    estimatedDurationMinutes: v.number(),
    pricingDetails: transferPricingDetailsValidator,
    paymentMethod: v.string(),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const locale = (args.locale === "ro" ? "ro" : "en") as "en" | "ro";
    
    const emailData: TransferEmailData = {
      transferNumber: args.transferNumber,
      customerInfo: args.customerInfo,
      vehicleInfo: args.vehicleInfo,
      pickupLocation: args.pickupLocation,
      dropoffLocation: args.dropoffLocation,
      pickupDate: args.pickupDate,
      pickupTime: args.pickupTime,
      returnDate: args.returnDate,
      returnTime: args.returnTime,
      transferType: args.transferType as "one_way" | "round_trip",
      passengers: args.passengers,
      luggageCount: args.luggageCount,
      distanceKm: args.distanceKm,
      estimatedDurationMinutes: args.estimatedDurationMinutes,
      pricingDetails: args.pricingDetails,
      paymentMethod: args.paymentMethod as
        | "cash_on_delivery"
        | "card_on_delivery"
        | "card_online",
      locale,
    };

    try {
      // Render admin transfer email
      const adminHtml = await render(
        AdminTransferEmail({ data: emailData, locale }) as React.ReactElement
      );

      // Send admin notification email
      await resend.sendEmail(ctx, {
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject: `New Transfer Booking #${args.transferNumber}`,
        html: adminHtml,
        replyTo: [args.customerInfo.email],
      });

      // Render user transfer email
      const userHtml = await render(
        UserTransferEmail({ data: emailData, locale }) as React.ReactElement
      );

      // Send customer confirmation email
      await resend.sendEmail(ctx, {
        from: FROM_EMAIL,
        to: [args.customerInfo.email],
        subject: locale === "ro" 
          ? `Cerere trimisă #${args.transferNumber}` 
          : `Request submitted #${args.transferNumber}`,
        html: userHtml,
        replyTo: ["office@rngo.ro"],
      });

      console.log(
        `Transfer confirmation emails sent for #${args.transferNumber}`
      );
    } catch (error) {
      console.error("Error sending transfer emails:", error);
      throw error;
    }
  },
});
