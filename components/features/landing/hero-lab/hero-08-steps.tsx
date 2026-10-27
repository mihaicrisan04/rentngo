"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TrustItem } from "@/hooks/use-trust-items";

export interface Hero08Step {
  icon: LucideIcon;
  title: string;
  body: string;
  notes: TrustItem[];
}

interface Hero08StepsProps {
  steps: Hero08Step[];
  stepLabel: string;
  header: React.ReactNode;
}

const SPRING = { stiffness: 150, damping: 32, mass: 0.5, restDelta: 0.0005 };
const ICON_SIZE = 64;
const ARCH_GAP = 18;
const ARCH_RISE = 36;

/** Scroll progress at which the desktop story switches to step 2 and step 3. */
const STEP_STARTS = [0, 0.36, 0.7] as const;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Like motion's useReducedMotion, but hydration-safe for class names. */
function usePrefersReducedMotion(): boolean {
  return React.useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

function useElementWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = React.useState(0);

  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

function useStepIndex(
  progress: MotionValue<number>,
  starts: readonly number[],
) {
  const indexFor = React.useCallback(
    (value: number) =>
      starts.reduce(
        (active, start, i) => (value + 0.002 >= start ? i : active),
        0,
      ),
    [starts],
  );
  const [index, setIndex] = React.useState(0);
  useMotionValueEvent(progress, "change", (value) => setIndex(indexFor(value)));
  return index;
}

/** Two shallow arches hopping between the three icon centres. */
function connectorPath(width: number): string {
  const column = width / 3;
  const y = ICON_SIZE / 2;
  const radius = ICON_SIZE / 2 + ARCH_GAP;
  return [0, 1]
    .map((i) => {
      const from = column * (i + 0.5) + radius;
      const to = column * (i + 1.5) - radius;
      const pull = (to - from) * 0.3;
      return `M ${from} ${y} C ${from + pull} ${y - ARCH_RISE} ${to - pull} ${y - ARCH_RISE} ${to} ${y}`;
    })
    .join(" ");
}

interface StepIconProps {
  icon: LucideIcon;
  state: "active" | "done" | "upcoming";
  className?: string;
}

function StepIcon({ icon: Icon, state, className }: StepIconProps) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,box-shadow] duration-500",
        state === "active" &&
          "border-primary bg-primary text-primary-foreground shadow-[0_0_0_8px_color-mix(in_oklch,var(--primary)_16%,transparent)]",
        state === "done" && "border-primary/70 bg-background text-primary",
        state === "upcoming" &&
          "border-border bg-background text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-[42%]" strokeWidth={1.6} />
    </span>
  );
}

function TrustNote({ item }: { item: TrustItem }) {
  const Icon = item.icon;
  return (
    <li className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-foreground/85">
      <Icon className="size-3.5 text-primary" strokeWidth={1.75} />
      <span className="font-medium">{item.label}</span>
      <span aria-hidden="true" className="text-muted-foreground/60">
        ·
      </span>
      <span className="text-muted-foreground">{item.value}</span>
    </li>
  );
}

function stepState(index: number, active: number): StepIconProps["state"] {
  if (index === active) return "active";
  return index < active ? "done" : "upcoming";
}

function DesktopSteps({ steps, stepLabel, header }: Hero08StepsProps) {
  const reduceMotion = usePrefersReducedMotion();
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const rowRef = React.useRef<HTMLDivElement>(null);
  const width = useElementWidth(rowRef);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, SPRING);
  const complete = useMotionValue(1);
  const progress = reduceMotion ? complete : smooth;
  const drawn = useTransform(
    progress,
    [0.04, STEP_STARTS[1], STEP_STARTS[1] + 0.04, STEP_STARTS[2]],
    [0, 0.5, 0.5, 1],
  );
  const scrolledIndex = useStepIndex(progress, STEP_STARTS);
  const active = reduceMotion ? -1 : scrolledIndex;

  return (
    <div
      ref={sectionRef}
      className={cn("relative hidden md:block", !reduceMotion && "h-[200vh]")}
    >
      <div
        className={cn(
          "flex flex-col justify-start pt-[8vh]",
          !reduceMotion && "sticky top-14 h-[calc(100vh-3.5rem)]",
        )}
      >
        {header}
        <div ref={rowRef} className="relative mt-16 grid grid-cols-3 lg:mt-20">
          {width > 0 && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 overflow-visible"
              width={width}
              height={ICON_SIZE}
              viewBox={`0 0 ${width} ${ICON_SIZE}`}
              fill="none"
            >
              <path
                d={connectorPath(width)}
                className="stroke-foreground/25"
                strokeWidth={1}
                strokeDasharray="4 8"
                strokeLinecap="round"
              />
              <motion.path
                d={connectorPath(width)}
                className="stroke-primary"
                strokeWidth={1.75}
                strokeLinecap="round"
                style={{ pathLength: drawn }}
              />
            </svg>
          )}

          {steps.map((step, index) => {
            const state = reduceMotion ? "active" : stepState(index, active);
            return (
              <div
                key={step.title}
                className={cn(
                  "flex flex-col items-center px-4 text-center transition-opacity duration-500 lg:px-6",
                  state === "upcoming" && "opacity-40",
                  state === "done" && "opacity-60",
                )}
                aria-current={index === active ? "step" : undefined}
              >
                <StepIcon icon={step.icon} state={state} className="size-16" />
                <p className="mt-6 font-heading text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">
                  {stepLabel}{" "}
                  <span className="tracking-normal">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight lg:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-base leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
                <ul className="mt-5 flex flex-wrap justify-center gap-2">
                  {step.notes.map((note) => (
                    <TrustNote key={note.label} item={note} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobileSteps({ steps, stepLabel, header }: Hero08StepsProps) {
  const reduceMotion = usePrefersReducedMotion();
  const listRef = React.useRef<HTMLOListElement>(null);
  const [line, setLine] = React.useState<{
    top: number;
    length: number;
    starts: number[];
  } | null>(null);

  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const icons = Array.from(
        list.querySelectorAll<HTMLElement>("[data-step-icon]"),
      );
      if (icons.length < 2) return;
      const listTop = list.getBoundingClientRect().top;
      const centres = icons.map((icon) => {
        const box = icon.getBoundingClientRect();
        return box.top - listTop + box.height / 2;
      });
      const top = centres[0];
      const length = centres[centres.length - 1] - top;
      setLine({ top, length, starts: centres.map((c) => (c - top) / length) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 62%", "end 62%"],
  });
  const smooth = useSpring(scrollYProgress, SPRING);
  const complete = useMotionValue(1);
  const progress = reduceMotion ? complete : smooth;
  const starts = line?.starts ?? STEP_STARTS;
  const active = useStepIndex(progress, starts);

  return (
    <div className="md:hidden">
      {header}
      <ol ref={listRef} className="relative mt-10 flex flex-col gap-12">
        {line && (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-0 overflow-visible"
            style={{ top: line.top }}
            width={48}
            height={line.length}
            viewBox={`0 0 48 ${line.length}`}
            fill="none"
          >
            <path
              d={`M 24 0 V ${line.length}`}
              className="stroke-foreground/25"
              strokeWidth={1}
              strokeDasharray="4 8"
            />
            <motion.path
              d={`M 24 0 V ${line.length}`}
              className="stroke-primary"
              strokeWidth={1.75}
              strokeLinecap="round"
              style={{ pathLength: progress }}
            />
          </svg>
        )}
        {steps.map((step, index) => {
          const state = reduceMotion ? "active" : stepState(index, active);
          return (
            <li
              key={step.title}
              className={cn(
                "relative flex gap-5 transition-opacity duration-500",
                state === "upcoming" && "opacity-45",
              )}
              aria-current={index === active ? "step" : undefined}
            >
              <span data-step-icon className="relative z-10 self-start">
                <StepIcon icon={step.icon} state={state} className="size-12" />
              </span>
              <div className="min-w-0 pt-1">
                <p className="font-heading text-[11px] font-medium tracking-[0.25em] text-muted-foreground uppercase">
                  {stepLabel}{" "}
                  <span className="tracking-normal">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {step.notes.map((note) => (
                    <TrustNote key={note.label} item={note} />
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** How renting works: a connector draws between the steps as you scroll. */
export function Hero08Steps(props: Hero08StepsProps) {
  return (
    <>
      <DesktopSteps {...props} />
      <MobileSteps {...props} />
    </>
  );
}
