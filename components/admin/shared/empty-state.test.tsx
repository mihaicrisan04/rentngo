import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { Car } from "lucide-react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders the message without an action button", () => {
    const html = renderToString(
      <EmptyState icon={Car} message="No vehicles yet" />,
    );
    expect(html).toContain("No vehicles yet");
    expect(html).not.toContain("<button");
  });

  it("renders the action button only when both label and handler are given", () => {
    expect(
      renderToString(
        <EmptyState
          icon={Car}
          message="No vehicles yet"
          actionLabel="Add vehicle"
          onAction={() => {}}
        />,
      ),
    ).toContain("Add vehicle");

    expect(
      renderToString(
        <EmptyState
          icon={Car}
          message="No vehicles yet"
          actionLabel="Add vehicle"
        />,
      ),
    ).not.toContain("Add vehicle");
  });
});
