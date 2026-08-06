/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as affiliates from "../affiliates.js";
import type * as auth from "../auth.js";
import type * as blogs from "../blogs.js";
import type * as counters from "../counters.js";
import type * as coupons from "../coupons.js";
import type * as crons from "../crons.js";
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
import type * as files from "../files.js";
import type * as gc from "../gc.js";
import type * as http from "../http.js";
import type * as lib_patch from "../lib/patch.js";
import type * as lib_stats from "../lib/stats.js";
import type * as lib_tableStats from "../lib/tableStats.js";
import type * as migrations_addAdditional50kmPrice from "../migrations/addAdditional50kmPrice.js";
import type * as migrations_backfillClerkUsers from "../migrations/backfillClerkUsers.js";
import type * as migrations_bilingualBlogs from "../migrations/bilingualBlogs.js";
import type * as migrations_clearDeprecatedClassField from "../migrations/clearDeprecatedClassField.js";
import type * as migrations_clearDeprecatedPricePerDay from "../migrations/clearDeprecatedPricePerDay.js";
import type * as migrations_migrateVehicleClasses from "../migrations/migrateVehicleClasses.js";
import type * as migrations_seedTableStats from "../migrations/seedTableStats.js";
import type * as migrations_seedVehicleClasses from "../migrations/seedVehicleClasses.js";
import type * as overview from "../overview.js";
import type * as reservations from "../reservations.js";
import type * as routing from "../routing.js";
import type * as seasons from "../seasons.js";
import type * as tableStats from "../tableStats.js";
import type * as transferPricing from "../transferPricing.js";
import type * as transfers from "../transfers.js";
import type * as users from "../users.js";
import type * as validators from "../validators.js";
import type * as vehicleClasses from "../vehicleClasses.js";
import type * as vehicles from "../vehicles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  affiliates: typeof affiliates;
  auth: typeof auth;
  blogs: typeof blogs;
  counters: typeof counters;
  coupons: typeof coupons;
  crons: typeof crons;
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
  files: typeof files;
  gc: typeof gc;
  http: typeof http;
  "lib/patch": typeof lib_patch;
  "lib/stats": typeof lib_stats;
  "lib/tableStats": typeof lib_tableStats;
  "migrations/addAdditional50kmPrice": typeof migrations_addAdditional50kmPrice;
  "migrations/backfillClerkUsers": typeof migrations_backfillClerkUsers;
  "migrations/bilingualBlogs": typeof migrations_bilingualBlogs;
  "migrations/clearDeprecatedClassField": typeof migrations_clearDeprecatedClassField;
  "migrations/clearDeprecatedPricePerDay": typeof migrations_clearDeprecatedPricePerDay;
  "migrations/migrateVehicleClasses": typeof migrations_migrateVehicleClasses;
  "migrations/seedTableStats": typeof migrations_seedTableStats;
  "migrations/seedVehicleClasses": typeof migrations_seedVehicleClasses;
  overview: typeof overview;
  reservations: typeof reservations;
  routing: typeof routing;
  seasons: typeof seasons;
  tableStats: typeof tableStats;
  transferPricing: typeof transferPricing;
  transfers: typeof transfers;
  users: typeof users;
  validators: typeof validators;
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
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
};
