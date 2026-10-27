"use client";

import {
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

interface Peak {
  cx: number;
  cy: number;
  rings: number;
  firstRadius: number;
  step: number;
  phase: number;
}

// Two hills far enough apart that their contour rings never cross.
const PEAKS: Peak[] = [
  { cx: 1180, cy: 230, rings: 15, firstRadius: 34, step: 36, phase: 0 },
  { cx: 170, cy: 760, rings: 8, firstRadius: 28, step: 34, phase: 2.1 },
];

const SAMPLES = 64;
const INDEX_CONTOUR_EVERY = 5;

function ringPoints(peak: Peak, ring: number): [number, number][] {
  const radius = peak.firstRadius + ring * peak.step;
  const drift = ring * 0.12;
  return Array.from({ length: SAMPLES }, (_, i) => {
    const angle = (i / SAMPLES) * Math.PI * 2;
    const wobble =
      1 +
      0.07 * Math.sin(2 * angle + peak.phase + drift) +
      0.045 * Math.sin(3 * angle - peak.phase * 1.7 - drift * 0.8) +
      0.02 * Math.sin(5 * angle + peak.phase * 0.5 + drift * 1.6);
    return [
      peak.cx + Math.cos(angle) * radius * wobble * 1.18,
      peak.cy + Math.sin(angle) * radius * wobble * 0.86,
    ];
  });
}

/** Closed Catmull-Rom spline through the points, as cubic Bézier segments. */
function smoothClosedPath(points: [number, number][]): string {
  const n = points.length;
  const at = (i: number) => points[(i + n) % n];
  const f = (value: number) => value.toFixed(1);
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = at(i - 1);
    const [x1, y1] = at(i);
    const [x2, y2] = at(i + 1);
    const [x3, y3] = at(i + 2);
    d += `C${f(x1 + (x2 - x0) / 6)} ${f(y1 + (y2 - y0) / 6)} ${f(x2 - (x3 - x1) / 6)} ${f(y2 - (y3 - y1) / 6)} ${f(x2)} ${f(y2)}`;
  }
  return `${d}Z`;
}

const CONTOURS = PEAKS.flatMap((peak, peakIndex) =>
  Array.from({ length: peak.rings }, (_, ring) => ({
    key: `${peakIndex}-${ring}`,
    d: smoothClosedPath(ringPoints(peak, ring)),
    isIndex: (ring + 1) % INDEX_CONTOUR_EVERY === 0,
    order: ring,
  })),
);

interface Hero10TopographyProps {
  scrollProgress: MotionValue<number>;
}

/** Slow-drawing contour map of two hills, drifting with scroll. */
export function Hero10Topography({ scrollProgress }: Hero10TopographyProps) {
  const reduceMotion = useReducedMotion();
  const y = useTransform(scrollProgress, [0, 1], [0, reduceMotion ? 0 : 140]);
  const rotate = useTransform(
    scrollProgress,
    [0, 1],
    [0, reduceMotion ? 0 : -4],
  );

  return (
    <div
      aria-hidden
      className="hero10-topo pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <style>{`
        @keyframes hero10-drift {
          from { transform: translate3d(0, 0, 0) scale(1); }
          to { transform: translate3d(-28px, 14px, 0) scale(1.03); }
        }
        .hero10-topo .hero10-drift {
          animation: hero10-drift 38s ease-in-out infinite alternate;
          transform-origin: 60% 40%;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero10-topo .hero10-drift { animation: none; }
        }
      `}</style>
      <motion.svg
        style={{ y, rotate }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-x-0 -top-[5%] h-[115%] w-full [mask-image:radial-gradient(ellipse_55%_45%_at_50%_42%,rgb(0_0_0/0.35),black_75%)]"
        fill="none"
      >
        <g className="hero10-drift">
          {CONTOURS.map(({ key, d, isIndex, order }) => (
            <motion.path
              key={key}
              d={d}
              className={
                isIndex
                  ? "stroke-primary/35 dark:stroke-primary/30"
                  : "stroke-foreground/[0.09] dark:stroke-primary/[0.13]"
              }
              strokeWidth={isIndex ? 1.25 : 1}
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: {
                  duration: 2.8,
                  delay: 0.15 + order * 0.07,
                  ease: [0.65, 0, 0.35, 1],
                },
                opacity: { duration: 0.4, delay: 0.15 + order * 0.07 },
              }}
            />
          ))}
        </g>
      </motion.svg>
    </div>
  );
}
