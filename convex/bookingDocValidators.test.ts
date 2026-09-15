import { describe, expect, it } from "vitest";
import schema from "./schema";
import { reservationDocValidator } from "./reservations";
import { transferDocValidator } from "./transfers";

/**
 * `reservationDocValidator` and `transferDocValidator` spell the stored
 * booking documents out by hand and are used as `returns` validators. A field
 * added to the schema but not to them makes every read of that table throw
 * `ReturnsValidationError` the moment a document actually carries it — which
 * is after a backfill, not at deploy time, so nothing else catches it.
 */
describe("booking doc validators", () => {
  it.each([
    ["reservations", reservationDocValidator],
    ["transfers", transferDocValidator],
  ] as const)("%s covers every schema field", (table, validator) => {
    expect(Object.keys(validator.fields).sort()).toEqual(
      Object.keys(schema.doc(table).fields).sort(),
    );
  });
});
