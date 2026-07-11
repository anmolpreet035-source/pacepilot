"use client";

import { useState } from "react";

type PaceStatus = "On Track" | "Overspending" | "Underspending";

type CalculationResult = {
  budgetRemaining: number;
  daysRemaining: number;
  recommendedDailySpend: number;
  expectedSpendByToday: number;
  paceStatus: PaceStatus;
  difference: number;
  averageDailySpend: number;
  projectedEndOfMonthSpend: number;
  projectedDifference: number;
};

type IconProps = {
  className?: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function SparklesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
      <path d="M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" />
    </svg>
  );
}

function CurrencyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 3v18" />
      <path d="M16.5 6.5c0-1.9-1.5-3.5-3.5-3.5h-1A3.5 3.5 0 0 0 8.5 6.5c0 1.3.7 2.4 1.8 3" />
      <path d="M7.5 13.5C7.5 15.4 8.9 17 10.8 17h.7c1.8 0 3.2-1.5 3.2-3.3 0-1.1-.5-2.1-1.3-2.7" />
    </svg>
  );
}

function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default function Home() {
  const [monthlyBudget, setMonthlyBudget] = useState("10000");
  const [amountSpent, setAmountSpent] = useState("2500");
  const [currentDay, setCurrentDay] = useState("10");
  const [totalDays, setTotalDays] = useState("30");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleCalculate = () => {
    const budget = Number(monthlyBudget) || 0;
    const spent = Number(amountSpent) || 0;
    const day = Number(currentDay) || 0;
    const total = Number(totalDays) || 0;

    const budgetRemaining = budget - spent;
    const daysRemaining = Math.max(total - day, 0);
    const recommendedDailySpend = daysRemaining > 0 ? budgetRemaining / daysRemaining : 0;
    const expectedSpendByToday = total > 0 ? (budget / total) * day : 0;
    const difference = spent - expectedSpendByToday;
    const averageDailySpend = day > 0 ? spent / day : 0;
    const projectedEndOfMonthSpend = averageDailySpend * total;
    const projectedDifference = projectedEndOfMonthSpend - budget;

    const expectedSpendByNow = total > 0 ? budget * (day / total) : 0;

    let paceStatus: PaceStatus = "Underspending";
    if (Math.abs(difference) <= expectedSpendByToday * 0.05) {
      paceStatus = "On Track";
    } else if (difference > 0) {
      paceStatus = "Overspending";
    }

    setResult({
      budgetRemaining,
      daysRemaining,
      recommendedDailySpend,
      expectedSpendByToday,
      paceStatus,
      difference,
      averageDailySpend,
      projectedEndOfMonthSpend,
      projectedDifference,
    });
  };

  const statusClasses = {
    "On Track": "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Overspending: "bg-rose-50 text-rose-700 ring-rose-200",
    Underspending: "bg-amber-50 text-amber-700 ring-amber-200",
  };

  const statusBanner = result
    ? result.paceStatus === "Overspending"
      ? {
          title: "Overspending",
          description: "You are spending faster than your planned pacing.",
          tone: "bg-rose-50 text-rose-700 ring-rose-200",
        }
      : result.paceStatus === "Underspending"
        ? {
            title: "Underspending",
            description: "You are spending slower than planned.",
            tone: "bg-amber-50 text-amber-700 ring-amber-200",
          }
        : {
            title: "On Pace",
            description: "Your spending is tracking according to plan.",
            tone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
          }
    : null;

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8 lg:py-8">
      <main className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[32px] border border-blue-100 bg-white/90 p-5 shadow-[0_25px_80px_-25px_rgba(37,99,235,0.35)] backdrop-blur sm:p-8 lg:p-10">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-blue-100">
                <SparklesIcon className="h-4 w-4" />
                AI-ready pacing insights
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-200">
                  PacePilot
                </p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Google Ads Budget Pacing Tool
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-300">
                  Keep every campaign on target with a clear look at remaining budget,
                  days left, and the daily spend needed to stay on pace.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200">
              <p className="font-medium text-white">Smart pacing overview</p>
              <p className="mt-1 text-slate-300">Measure spend before it slips off course.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-5 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-blue-600/10 p-2 text-blue-600">
                <CurrencyIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Budget inputs</h2>
                <p className="text-sm text-slate-500">Enter your monthly plan and current spend</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Monthly Budget</span>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <span className="mr-2 text-sm font-semibold text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={monthlyBudget}
                    onChange={(event) => setMonthlyBudget(event.target.value)}
                    className="w-full bg-transparent text-base text-slate-900 outline-none"
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Amount Spent</span>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <span className="mr-2 text-sm font-semibold text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={amountSpent}
                    onChange={(event) => setAmountSpent(event.target.value)}
                    className="w-full bg-transparent text-base text-slate-900 outline-none"
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Current Day</span>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={currentDay}
                    onChange={(event) => setCurrentDay(event.target.value)}
                    className="w-full bg-transparent text-base text-slate-900 outline-none"
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Total Days in Month</span>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={totalDays}
                    onChange={(event) => setTotalDays(event.target.value)}
                    className="w-full bg-transparent text-base text-slate-900 outline-none"
                  />
                </div>
              </label>
            </div>

            <button
              onClick={handleCalculate}
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Calculate pacing
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Pacing Summary</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">Results</h2>
              </div>
              {statusBanner ? (
                <span className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ${statusBanner.tone}`}>
                  {statusBanner.title}
                </span>
              ) : null}
            </div>

            <div className="mt-6 space-y-5">
              {statusBanner ? (
                <div className={`rounded-[24px] border border-slate-200/80 p-5 shadow-sm ${statusBanner.tone}`}>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-70">Status</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">{statusBanner.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-6">{statusBanner.description}</p>
                </div>
              ) : null}

              <div className="rounded-[24px] border border-slate-200/80 bg-slate-950 p-6 text-white shadow-sm">
                <p className="text-sm font-medium text-slate-300">Today’s Recommended Spend</p>
                <p className="mt-3 text-4xl font-semibold tracking-tight">
                  {result ? currencyFormatter.format(result.recommendedDailySpend) : "—"}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-[20px] border border-slate-200/80 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Budget Remaining</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {result ? currencyFormatter.format(result.budgetRemaining) : "—"}
                  </p>
                </div>
                <div className="rounded-[20px] border border-slate-200/80 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Days Remaining</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {result ? `${result.daysRemaining}` : "—"}
                  </p>
                </div>
                <div className="rounded-[20px] border border-slate-200/80 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Forecasted End-of-Month Spend</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {result ? currencyFormatter.format(result.projectedEndOfMonthSpend) : "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
                  <span className="font-medium">Budget Progress</span>
                  <span>
                    {Number(monthlyBudget) > 0
                      ? `${Math.min(100, (Number(amountSpent) / Number(monthlyBudget)) * 100).toFixed(0)}% used`
                      : "No data"}
                  </span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      Number(monthlyBudget) <= 0
                        ? "w-0 bg-slate-400"
                        : (Number(amountSpent) / Number(monthlyBudget)) * 100 < 80
                          ? "bg-emerald-500"
                          : (Number(amountSpent) / Number(monthlyBudget)) * 100 < 100
                            ? "bg-amber-500"
                            : "bg-rose-500"
                    }`}
                    style={{ width: `${Number(monthlyBudget) > 0 ? Math.min(100, (Number(amountSpent) / Number(monthlyBudget)) * 100) : 0}%` }}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
                  <span>Budget Used %</span>
                  <span className="font-medium text-slate-900">
                    {Number(monthlyBudget) > 0 ? `${Math.min(100, (Number(amountSpent) / Number(monthlyBudget)) * 100).toFixed(0)}%` : "0%"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-600">
                  <span>Budget Remaining %</span>
                  <span className="font-medium text-slate-900">
                    {Number(monthlyBudget) > 0 ? `${Math.max(0, 100 - Math.min(100, (Number(amountSpent) / Number(monthlyBudget)) * 100)).toFixed(0)}%` : "0%"}
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowDetails((value) => !value)}
                  className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  {showDetails ? "Hide details" : "View details"}
                </button>
              </div>

              {showDetails ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] border border-slate-200/80 bg-white p-4">
                    <p className="text-sm text-slate-500">Expected Spend</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {result ? currencyFormatter.format(result.expectedSpendByToday) : "—"}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-slate-200/80 bg-white p-4">
                    <p className="text-sm text-slate-500">Actual Spend</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {result ? currencyFormatter.format(Number(amountSpent) || 0) : "—"}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-slate-200/80 bg-white p-4">
                    <p className="text-sm text-slate-500">Difference</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {result ? `${Number(amountSpent) >= result.expectedSpendByToday ? "+" : "-"}${currencyFormatter.format(Math.abs(Number(amountSpent) - result.expectedSpendByToday))}` : "—"}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-slate-200/80 bg-white p-4">
                    <p className="text-sm text-slate-500">Average Daily Spend</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {result ? currencyFormatter.format(result.averageDailySpend) : "—"}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-slate-200/80 bg-white p-4">
                    <p className="text-sm text-slate-500">Forecast Difference</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {result ? `${result.projectedDifference >= 0 ? "+" : "-"}${currencyFormatter.format(Math.abs(result.projectedDifference))}` : "—"}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-slate-200/80 bg-white p-4">
                    <p className="text-sm text-slate-500">Budget Used</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {result ? currencyFormatter.format(Number(amountSpent) || 0) : "—"}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-center border-t border-slate-200 pt-4 text-sm text-slate-500">
          Built by Anmolpreet Singh
        </footer>
      </main>
    </div>
  );
}
