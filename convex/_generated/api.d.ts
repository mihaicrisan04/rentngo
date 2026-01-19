/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as blogs from "../blogs.js";
import type * as emails from "../emails.js";
import type * as emails_components_customer_info_section from "../emails/components/customer_info_section.js";
import type * as emails_components_email_footer from "../emails/components/email_footer.js";
import type * as emails_components_email_header from "../emails/components/email_header.js";
import type * as emails_components_pricing_section from "../emails/components/pricing_section.js";
import type * as emails_components_rental_details_section from "../emails/components/rental_details_section.js";
import type * as emails_components_transfer_details_section from "../emails/components/transfer_details_section.js";
import type * as emails_components_transfer_pricing_section from "../emails/components/transfer_pricing_section.js";
import type * as emails_components_vehicle_info_section from "../emails/components/vehicle_info_section.js";
import type * as emails_templates_AdminReservationEmail from "../emails/templates/AdminReservationEmail.js";
import type * as emails_templates_AdminTransferEmail from "../emails/templates/AdminTransferEmail.js";
import type * as emails_templates_UserReservationEmail from "../emails/templates/UserReservationEmail.js";
import type * as emails_templates_UserTransferEmail from "../emails/templates/UserTransferEmail.js";
import type * as emails_types from "../emails/types.js";
import type * as emails_utils from "../emails/utils.js";
import type * as featuredCars from "../featuredCars.js";
import type * as migrations_addAdditional50kmPrice from "../migrations/addAdditional50kmPrice.js";
import type * as migrations_migrateVehicleClasses from "../migrations/migrateVehicleClasses.js";
import type * as migrations_seedVehicleClasses from "../migrations/seedVehicleClasses.js";
import type * as reservations from "../reservations.js";
import type * as seasons from "../seasons.js";
import type * as transferPricing from "../transferPricing.js";
import type * as transfers from "../transfers.js";
import type * as users from "../users.js";
import type * as vehicleClasses from "../vehicleClasses.js";
import type * as vehicles from "../vehicles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  blogs: typeof blogs;
  emails: typeof emails;
  "emails/components/customer_info_section": typeof emails_components_customer_info_section;
  "emails/components/email_footer": typeof emails_components_email_footer;
  "emails/components/email_header": typeof emails_components_email_header;
  "emails/components/pricing_section": typeof emails_components_pricing_section;
  "emails/components/rental_details_section": typeof emails_components_rental_details_section;
  "emails/components/transfer_details_section": typeof emails_components_transfer_details_section;
  "emails/components/transfer_pricing_section": typeof emails_components_transfer_pricing_section;
  "emails/components/vehicle_info_section": typeof emails_components_vehicle_info_section;
  "emails/templates/AdminReservationEmail": typeof emails_templates_AdminReservationEmail;
  "emails/templates/AdminTransferEmail": typeof emails_templates_AdminTransferEmail;
  "emails/templates/UserReservationEmail": typeof emails_templates_UserReservationEmail;
  "emails/templates/UserTransferEmail": typeof emails_templates_UserTransferEmail;
  "emails/types": typeof emails_types;
  "emails/utils": typeof emails_utils;
  featuredCars: typeof featuredCars;
  "migrations/addAdditional50kmPrice": typeof migrations_addAdditional50kmPrice;
  "migrations/migrateVehicleClasses": typeof migrations_migrateVehicleClasses;
  "migrations/seedVehicleClasses": typeof migrations_seedVehicleClasses;
  reservations: typeof reservations;
  seasons: typeof seasons;
  transferPricing: typeof transferPricing;
  transfers: typeof transfers;
  users: typeof users;
  vehicleClasses: typeof vehicleClasses;
  vehicles: typeof vehicles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  resend: {
    lib: {
      cancelEmail: FunctionReference<
        "mutation",
        "internal",
        { emailId: string },
        null
      >;
      cleanupAbandonedEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      cleanupOldEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      createManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          replyTo?: Array<string>;
          subject: string;
          to: Array<string> | string;
        },
        string
      >;
      get: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          bcc?: Array<string>;
          bounced?: boolean;
          cc?: Array<string>;
          clicked?: boolean;
          complained: boolean;
          createdAt: number;
          deliveryDelayed?: boolean;
          errorMessage?: string;
          failed?: boolean;
          finalizedAt: number;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          opened: boolean;
          replyTo: Array<string>;
          resendId?: string;
          segment: number;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
          subject?: string;
          template?: {
            id: string;
            variables?: Record<string, string | number>;
          };
          text?: string;
          to: Array<string>;
        } | null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          bounced: boolean;
          clicked: boolean;
          complained: boolean;
          deliveryDelayed: boolean;
          errorMessage: string | null;
          failed: boolean;
          opened: boolean;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        } | null
      >;
      handleEmailEvent: FunctionReference<
        "mutation",
        "internal",
        { event: any },
        null
      >;
      sendEmail: FunctionReference<
        "mutation",
        "internal",
        {
          bcc?: Array<string>;
          cc?: Array<string>;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          options: {
            apiKey: string;
            initialBackoffMs: number;
            onEmailEvent?: { fnHandle: string };
            retryAttempts: number;
            testMode: boolean;
          };
          replyTo?: Array<string>;
          subject?: string;
          template?: {
            id: string;
            variables?: Record<string, string | number>;
          };
          text?: string;
          to: Array<string>;
        },
        string
      >;
      updateManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          emailId: string;
          errorMessage?: string;
          resendId?: string;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        },
        null
      >;
    };
  };
};
