"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

import { cn } from "@/lib/utils";
import type { TrustItem } from "@/hooks/use-trust-items";

interface Point {
  x: number;
  y: number;
}

interface RoadSize {
  width: number;
  height: number;
  isDesktop: boolean;
}

/** Vertical position of each milestone, as a fraction of the road height. */
const MILESTONE_Y = [0.15, 0.37, 0.59, 0.81] as const;
/** Desktop road x at each milestone: the road swings away from its card. */
const DESKTOP_ROAD_X = [0.62, 0.38, 0.62, 0.38] as const;
const MOBILE_ROAD_X = 22;
const DESKTOP_QUERY = "(min-width: 768px)";

function roadPoints({ width, height, isDesktop }: RoadSize): Point[] {
  const start = isDesktop ? { x: width / 2, y: 0 } : { x: MOBILE_ROAD_X, y: 0 };
  const milestones = MILESTONE_Y.map((y, i) => ({
    x: isDesktop ? DESKTOP_ROAD_X[i] * width : MOBILE_ROAD_X,
    y: y * height,
  }));
  return [start, ...milestones, { x: width / 2, y: height }];
}

/** Smooth cubic path through the points, vertical at every point. */
function roadPath(points: Point[]): string {
  const [first, ...rest] = points;
  let d = `M ${first.x} ${first.y}`;
  let previous = first;
  for (const point of rest) {
    const bend = (point.y - previous.y) * 0.55;
    d += ` C ${previous.x} ${previous.y + bend} ${point.x} ${point.y - bend} ${point.x} ${point.y}`;
    previous = point;
  }
  return d;
}

/** Fraction of the path length at which the road first reaches each y. */
function lengthFractionsAt(path: SVGPathElement, ys: number[]): number[] {
  const total = path.getTotalLength();
  const samples = 400;
  return ys.map((targetY) => {
    for (let i = 0; i <= samples; i++) {
      if (path.getPointAtLength((i / samples) * total).y >= targetY) {
        return i / samples;
      }
    }
    return 1;
  });
}

function countReached(thresholds: number[], progress: number): number {
  return thresholds.filter((threshold) => progress + 0.004 >= threshold).length;
}

function useRoadSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = React.useState<RoadSize | null>(null);

  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = window.matchMedia(DESKTOP_QUERY);
    const measure = () =>
      setSize({
        width: element.clientWidth,
        height: element.clientHeight,
        isDesktop: media.matches,
      });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    media.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", measure);
    };
  }, [ref]);

  return size;
}

function useDrawProgress(target: React.RefObject<HTMLElement | null>) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start 62%", "end 62%"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 32,
    mass: 0.5,
    restDelta: 0.0005,
  });
  const complete = useMotionValue(1);
  return reduceMotion ? complete : smooth;
}

function useTipTransform(
  progress: MotionValue<number>,
  pathRef: React.RefObject<SVGPathElement | null>,
  pathData: string | null,
) {
  const lengthRef = React.useRef(0);

  React.useLayoutEffect(() => {
    lengthRef.current = pathRef.current?.getTotalLength() ?? 0;
  }, [pathRef, pathData]);

  return useTransform(progress, (p) => {
    const path = pathRef.current;
    if (!path || lengthRef.current === 0) return "translate(-100px, -100px)";
    const tip = path.getPointAtLength(
      Math.min(Math.max(p, 0), 1) * lengthRef.current,
    );
    return `translate(${tip.x}px, ${tip.y}px)`;
  });
}

interface RoadMilestoneProps {
  item: TrustItem;
  detail: string;
  index: number;
  reached: boolean;
}

function RoadMilestone({ item, detail, index, reached }: RoadMilestoneProps) {
  const reduceMotion = useReducedMotion();
  const cardOnLeft = index % 2 === 0;
  const Icon = item.icon;

  return (
    <motion.div
      className={cn(
        "absolute right-4 left-14 -translate-y-1/2 md:w-[min(22rem,30%)]",
        cardOnLeft
          ? "md:right-[calc(38%+3.5rem)] md:left-auto md:text-right"
          : "md:right-auto md:left-[calc(38%+3.5rem)]",
      )}
      style={{ top: `${MILESTONE_Y[index] * 100}%` }}
      initial={false}
      animate={
        reached || reduceMotion
          ? { opacity: 1, x: 0, filter: "blur(0px)" }
          : { opacity: 0, x: cardOnLeft ? -20 : 20, filter: "blur(4px)" }
      }
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          cardOnLeft && "md:flex-row-reverse",
        )}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
          <Icon className="size-[18px]" strokeWidth={1.75} />
        </span>
        <span className="font-heading text-xs font-medium tracking-wide text-muted-foreground tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
        {item.label}
      </h3>
      <p className="text-sm font-medium text-foreground/75">{item.value}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
        {detail}
      </p>
    </motion.div>
  );
}

interface RoadNodeProps {
  point: Point;
  reached: boolean;
}

function RoadNode({ point, reached }: RoadNodeProps) {
  return (
    <motion.circle
      cx={point.x}
      cy={point.y}
      r={5}
      strokeWidth={1.5}
      className="stroke-primary"
      initial={false}
      animate={{
        fill: reached ? "var(--primary)" : "var(--background)",
        scale: reached ? 1 : 0.8,
      }}
      transition={{ duration: 0.4 }}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    />
  );
}

interface Hero04RoadProps {
  items: TrustItem[];
  details: readonly string[];
}

/** A road that draws itself as you scroll, passing one trust milestone per bend. */
export function Hero04Road({ items, details }: Hero04RoadProps) {
  const roadRef = React.useRef<HTMLDivElement>(null);
  const pathRef = React.useRef<SVGPathElement>(null);
  const size = useRoadSize(roadRef);
  const progress = useDrawProgress(roadRef);

  const points = React.useMemo(() => (size ? roadPoints(size) : null), [size]);
  const pathData = points ? roadPath(points) : null;
  const tipTransform = useTipTransform(progress, pathRef, pathData);

  const [thresholds, setThresholds] = React.useState<number[]>([]);
  const [reachedCount, setReachedCount] = React.useState(0);

  React.useLayoutEffect(() => {
    if (!pathRef.current || !points) return;
    const next = lengthFractionsAt(
      pathRef.current,
      points.slice(1, -1).map((point) => point.y),
    );
    setThresholds(next);
    setReachedCount(countReached(next, progress.get()));
  }, [points, progress]);

  useMotionValueEvent(progress, "change", (value) =>
    setReachedCount(countReached(thresholds, value)),
  );

  return (
    <div
      ref={roadRef}
      className="relative mx-auto h-[115vh] min-h-[760px] w-full max-w-6xl md:h-[140vh] md:min-h-[980px]"
    >
      {size && pathData && points && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          fill="none"
        >
          <defs>
            <filter
              id="hero04-glow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          <path
            d={pathData}
            className="stroke-foreground/[0.045]"
            strokeWidth={size.isDesktop ? 30 : 20}
            strokeLinecap="round"
          />
          <path
            d={pathData}
            className="stroke-foreground/25"
            strokeWidth={1}
            strokeDasharray="5 11"
            strokeLinecap="round"
          />
          <motion.path
            d={pathData}
            className="stroke-primary/50"
            strokeWidth={5}
            strokeLinecap="round"
            filter="url(#hero04-glow)"
            style={{ pathLength: progress }}
          />
          <motion.path
            ref={pathRef}
            d={pathData}
            className="stroke-primary"
            strokeWidth={2}
            strokeLinecap="round"
            style={{ pathLength: progress }}
          />
          <circle
            cx={points[0].x}
            cy={points[0].y}
            r={3}
            className="fill-primary"
          />
          {points.slice(1, -1).map((point, index) => (
            <RoadNode
              key={index}
              point={point}
              reached={index < reachedCount}
            />
          ))}
        </svg>
      )}

      {size && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0"
          style={{ transform: tipTransform }}
        >
          <span className="absolute -top-5 -left-5 size-10 rounded-full bg-primary/25 blur-md" />
          <span className="absolute -top-2 -left-2 size-4 rounded-full border-2 border-background bg-primary shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_25%,transparent)]" />
        </motion.div>
      )}

      <ol className="contents">
        {items.map((item, index) => (
          <li key={item.label} className="contents">
            <RoadMilestone
              item={item}
              detail={details[index]}
              index={index}
              reached={index < reachedCount}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
