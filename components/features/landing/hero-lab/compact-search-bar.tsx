"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { LocationPicker } from "@/components/shared/search-filters/location-picker";
import { DateTimePicker } from "@/components/shared/search-filters/date-time-picker";
import { useToday } from "@/hooks/use-today";
import { carsPath } from "@/lib/localized-routes";
import { cn } from "@/lib/utils";
import type { HomeHeroProps } from "@/app/[locale]/home-page-client";

interface CompactSearchBarProps extends Pick<
  HomeHeroProps,
  "searchState" | "updateSearchField"
> {
  className?: string;
  /** "row" puts every field on one line when the bar is wide enough; "stack" keeps a column. */
  layout?: "row" | "stack";
}

/** One-line search: pickup place, both dates, and the return place on demand. */
export function CompactSearchBar({
  searchState,
  updateSearchField,
  className,
  layout = "row",
}: CompactSearchBarProps) {
  const t = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const today = useToday();
  const [pickupCalendarOpen, setPickupCalendarOpen] = React.useState(false);
  const [returnCalendarOpen, setReturnCalendarOpen] = React.useState(false);
  const [differentReturn, setDifferentReturn] = React.useState(false);

  const { pickupDate, returnDate } = searchState;
  const isRow = layout === "row";

  const setPickupLocation = (value: string) => {
    updateSearchField("deliveryLocation", value);
    if (!differentReturn) updateSearchField("restitutionLocation", value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pickupDate && returnDate && returnDate < pickupDate) {
      alert(t("returnDateAfterPickup"));
      return;
    }
    router.push(carsPath(locale));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "@container rounded-2xl border border-border/60 bg-card p-3 shadow-xl shadow-black/5 md:p-4",
        className,
      )}
    >
      <div
        className={cn(
          "grid gap-3",
          isRow &&
            "@3xl:grid-cols-[minmax(15rem,1fr)_auto_auto_auto] @3xl:items-end",
        )}
      >
        <LocationPicker
          id="heroDeliveryLocation"
          label={t("pickupLocation")}
          value={searchState.deliveryLocation ?? ""}
          onValueChange={setPickupLocation}
          placeholder={t("selectPickupLocation")}
          disabled={false}
        />
        <DateTimePicker
          id="heroPickupDate"
          label={t("pickupDateTime")}
          dateState={pickupDate}
          setDateState={(value) => updateSearchField("pickupDate", value)}
          timeState={searchState.pickupTime ?? null}
          setTimeState={(value) => updateSearchField("pickupTime", value)}
          minDate={today}
          disabledDateRanges={(date: Date) => (today ? date < today : false)}
          calendarOpen={pickupCalendarOpen}
          onCalendarOpenChange={setPickupCalendarOpen}
          onDateSelected={() =>
            setTimeout(() => setReturnCalendarOpen(true), 100)
          }
          onDateChange={(newDate) => {
            if (newDate && returnDate && returnDate < newDate) {
              updateSearchField("returnDate", newDate);
            }
          }}
        />
        <DateTimePicker
          id="heroReturnDate"
          label={t("returnDateTime")}
          dateState={returnDate}
          setDateState={(value) => updateSearchField("returnDate", value)}
          timeState={searchState.returnTime ?? null}
          setTimeState={(value) => updateSearchField("returnTime", value)}
          minDate={pickupDate || today}
          disabledDateRanges={(date: Date) => {
            const min = pickupDate || today;
            return min ? date < min : false;
          }}
          pickupDate={pickupDate}
          pickupTime={searchState.pickupTime ?? null}
          calendarOpen={returnCalendarOpen}
          onCalendarOpenChange={setReturnCalendarOpen}
        />
        <Button
          type="submit"
          size="lg"
          className={cn("h-[50px] px-6 text-base", !isRow && "w-full")}
        >
          <Search className="h-5 w-5" />
          <span className={cn(isRow && "@3xl:sr-only @6xl:not-sr-only")}>
            {t("searchCars")}
          </span>
        </Button>
      </div>

      {differentReturn && (
        <div className={cn("mt-3", isRow && "@3xl:max-w-sm")}>
          <LocationPicker
            id="heroRestitutionLocation"
            label={t("returnLocation")}
            value={searchState.restitutionLocation ?? ""}
            onValueChange={(value) =>
              updateSearchField("restitutionLocation", value)
            }
            placeholder={t("selectReturnLocation")}
            disabled={false}
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          if (differentReturn) {
            updateSearchField(
              "restitutionLocation",
              searchState.deliveryLocation ?? "",
            );
          }
          setDifferentReturn(!differentReturn);
        }}
        className="mt-3 px-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {differentReturn
          ? t("sameReturnLocation")
          : t("differentReturnLocation")}
      </button>
    </form>
  );
}
