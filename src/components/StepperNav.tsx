import React from 'react';
import { Check } from '../icons';

export type StepperNavStepStatus = 'complete' | 'current' | 'upcoming';

export interface StepperNavStep {
  key: string;
  label: string;
  /** Defaults to 'current' for the active key and 'upcoming' otherwise */
  status?: StepperNavStepStatus;
  /** Whether this step can be clicked even when it isn't the current one — e.g. a completed step you can revisit. Defaults to true for 'complete' steps. */
  navigable?: boolean;
}

export interface StepperNavProps {
  steps: StepperNavStep[];
  currentKey: string;
  onNavigate?: (key: string) => void;
  className?: string;
}

/**
 * StepperNav — a row of clickable pills for navigating a multi-step wizard:
 * the current step is highlighted, completed steps are revisitable, and
 * out-of-reach steps are disabled. Distinct from `Steps`, which is a
 * purely decorative progress indicator with no click navigation — several
 * apps had already built their own version of exactly this interactive
 * pattern independently (e.g. the consumer app's `WizardStepper.tsx` for its
 * Content Lab wizard and a separate `Stepper.tsx` for class onboarding).
 *
 * @example
 * ```tsx
 * <StepperNav
 *   currentKey={step}
 *   onNavigate={setStep}
 *   steps={[
 *     { key: 'upload', label: 'Upload', status: 'complete' },
 *     { key: 'review', label: 'Review', status: 'current' },
 *     { key: 'publish', label: 'Publish' },
 *   ]}
 * />
 * ```
 */
export function StepperNav({ steps, currentKey, onNavigate, className = '' }: StepperNavProps) {
  return (
    <nav aria-label="Wizard steps" className={className}>
      <ol className="flex gap-2 overflow-x-auto">
        {steps.map((step, index) => {
          const isActive = step.key === currentKey;
          const status: StepperNavStepStatus = step.status ?? (isActive ? 'current' : 'upcoming');
          const navigable = step.navigable ?? status === 'complete';
          const isDisabled = !isActive && !navigable;

          return (
            <li key={step.key}>
              <button
                type="button"
                disabled={isDisabled}
                aria-current={isActive ? 'step' : undefined}
                onClick={() => onNavigate?.(step.key)}
                className={[
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-body text-sm transition-colors',
                  isActive ? 'bg-mo-red font-semibold text-mo-white' : 'border border-mo-grey-3 bg-mo-grey-1 text-mo-grey-8',
                  !isActive && !isDisabled ? 'hover:text-mo-black' : '',
                  isDisabled ? 'cursor-not-allowed opacity-60' : '',
                ].join(' ')}
              >
                {status === 'complete' ? (
                  <Check size={13} />
                ) : (
                  <span className="text-mo-annotation font-semibold">{index + 1}</span>
                )}
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
