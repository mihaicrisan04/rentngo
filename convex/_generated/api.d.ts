/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as featuredCars from "../featuredCars.js";
import type * as migrations_addAdditional50kmPrice from "../migrations/addAdditional50kmPrice.js";
import type * as migrations_migrateVehicleClasses from "../migrations/migrateVehicleClasses.js";
import type * as migrations_seedVehicleClasses from "../migrations/seedVehicleClasses.js";
import type * as reservations from "../reservations.js";
import type * as seasons from "../seasons.js";
import type * as users from "../users.js";
import type * as vehicleClasses from "../vehicleClasses.js";
import type * as vehicles from "../vehicles.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  featuredCars: typeof featuredCars;
  "migrations/addAdditional50kmPrice": typeof migrations_addAdditional50kmPrice;
  "migrations/migrateVehicleClasses": typeof migrations_migrateVehicleClasses;
  "migrations/seedVehicleClasses": typeof migrations_seedVehicleClasses;
  reservations: typeof reservations;
  seasons: typeof seasons;
  users: typeof users;
  vehicleClasses: typeof vehicleClasses;
  vehicles: typeof vehicles;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
