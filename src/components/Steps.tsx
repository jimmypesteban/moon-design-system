import React from "react";
import { Check } from "../icons";

export interface StepItem {
  title: string;
  description?: string;
}

export interface StepsProps {
  items: StepItem[];
  /** Index of the current (in-progress) step */
  current: number;
  className?: string;
}

type StepStatus = "finish" | "process" | "wait";

function statusFor(index: number, current: number): StepStatus {
  if (index < current) return "finish";
  if (index === current) return "process";
  return "wait";
}

const CIRCLE_CLASSES: Record<StepStatus, string> = {
  finish: "border-mo-blue bg-mo-blue text-mo-white",
  process: "border-mo-blue bg-mo-blue text-mo-white",
  wait: "border-mo-black/20 bg-white text-mo-black/40",
};

const TITLE_CLASSES: Record<StepStatus, string> = {
  finish: "text-mo-black",
  process: "text-mo-black",
  wait: "text-mo-black/40",
};

const TAIL_CLASSES: Record<StepStatus, string> = {
  finish: "bg-mo-blue",
  process: "bg-mo-black/15",
  wait: "bg-mo-black/15",
};

/**
 * Steps — horizontal numbered progress indicator for multi-step flows
 * (e.g. onboarding, a wizard).
 *
 * @example
 * ```tsx
 * <Steps current={1} items={[{ title: 'Account' }, { title: 'Profile' }, { title: 'Confirm' }]} />
 * ```
 */
export function Steps({ items, current, className = "" }: StepsProps) {
  return (
    // Below 520px a three-step row with titles and descriptions genuinely does
    // not fit — it needs ~490px — so it stacks instead of squeezing. Squeezing
    // was tried first and was worse than the overflow it fixed: the titles are
    // whitespace-nowrap, so letting the columns shrink made them overlap the
    // next step's badge. A horizontal-overflow check cannot see overlapping
    // text, so that version passed CI while looking broken.
    //
    // @container, so it responds to the space it is actually given rather than
    // the viewport. Thresholds are written out literally because Tailwind only
    // emits classes it finds in the source — a template-built variant compiles
    // to nothing.
    // Two elements on purpose: `container-type` applies to an element's
    // DESCENDANTS, so a div cannot query the container it declares itself. With
    // both on one element the @min-[520px] variants silently never matched on
    // the root while still matching on its children — the row stayed stacked
    // while the connector lines appeared.
    <div className={["@container w-full", className].filter(Boolean).join(" ")}>
      <div className="flex w-full flex-col gap-4 font-body @min-[520px]:flex-row @min-[520px]:items-start @min-[520px]:gap-0">
        {items.map((item, index) => {
          const status = statusFor(index, current);
          const isLast = index === items.length - 1;
          return (
            <div
              key={index}
              className={
                isLast
                  ? "flex w-full flex-col items-start @min-[520px]:w-auto"
                  : "flex w-full flex-col items-start @min-[520px]:w-auto @min-[520px]:flex-1"
              }
            >
              <div className="flex w-full items-center gap-2">
                <span
                  className={[
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                    CIRCLE_CLASSES[status],
                  ].join(" ")}
                >
                  {status === "finish" ? <Check size={16} /> : index + 1}
                </span>
                <span
                  className={[
                    "whitespace-nowrap text-mo-body",
                    TITLE_CLASSES[status],
                  ].join(" ")}
                >
                  {item.title}
                </span>
                {!isLast && (
                  <span
                    className={[
                      "hidden h-px flex-1 @min-[520px]:block",
                      TAIL_CLASSES[status],
                    ].join(" ")}
                  />
                )}
              </div>
              {item.description && (
                <p className="mt-1 w-full pl-10 text-sm text-mo-black/50 @min-[520px]:max-w-40">
                  {item.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
