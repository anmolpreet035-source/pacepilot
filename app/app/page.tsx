"use client";

import { useEffect, useState } from "react";

type PaceStatus = "On Track" | "Overspending" | "Underspending";
type OnboardingStep = 1 | 2;

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

const currencyOptions = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "INR", label: "Indian Rupee" },
  { code: "JPY", label: "Japanese Yen" },
];

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

function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function getDefaultCurrency(locale: string) {
  if (locale.startsWith("en-GB")) return "GBP";
  if (locale.startsWith("en-IN")) return "INR";
  if (locale.startsWith("ja")) return "JPY";
  if (locale.startsWith("fr") || locale.startsWith("de") || locale.startsWith("it") || locale.startsWith("es") || locale.startsWith("nl") || locale.startsWith("pt")) return "EUR";
  if (locale.startsWith("en-CA") || locale.startsWith("fr-CA")) return "CAD";
  if (locale.startsWith("en-AU")) return "AUD";
  return "USD";
}

function getCurrencySymbol(locale: string, currency: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
    })
      .formatToParts(1000)
      .find((part) => part.type === "currency")?.value || currency;
  } catch {
    return currency;
  }
}

function parseBudgetValue(value: string) {
  const cleaned = value.replace(/,/g, "").trim();
  return Number(cleaned) || 0;
}

export default function Home() {
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [amountSpent, setAmountSpent] = useState("");
  const [currentDay, setCurrentDay] = useState("");
  const [totalDays, setTotalDays] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(1);
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);
  const [budgetError, setBudgetError] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [currencyLocale, setCurrencyLocale] = useState("en-US");
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const browserLocale = window.navigator.language || "en-US";
    const savedPreferences = window.localStorage.getItem("pacepilot-user-preferences");
    const onboardingComplete = window.localStorage.getItem("pacepilot-onboarding-complete");
    const demoMode = window.localStorage.getItem("pacepilot-demo-mode");

    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        if (parsed.monthlyBudget) {
          setMonthlyBudget(String(parsed.monthlyBudget));
        }
        if (parsed.currency) {
          setCurrency(parsed.currency);
        }
      } catch {
        // Ignore malformed saved preferences.
      }
    }

    setCurrencyLocale(browserLocale);
    setCurrency((current) => current || getDefaultCurrency(browserLocale));

    if (demoMode === "true") {
      setIsDemoMode(true);
      setMonthlyBudget("50000");
      setAmountSpent("18000");
      setCurrentDay("12");
      setTotalDays("30");
      setResult(null);
    }

    if (!onboardingComplete) {
      setIsOnboardingVisible(true);
    }
  }, []);

  const handleCalculate = () => {
    const budget = parseBudgetValue(monthlyBudget) || 0;
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

  const handleBudgetInputChange = (value: string) => {
    const cleaned = value.replace(/[^\d,\.]/g, "");
    setMonthlyBudget(cleaned);

    if (!cleaned.trim()) {
      setBudgetError("Enter a monthly budget greater than 0.");
      return;
    }

    const parsedValue = parseBudgetValue(cleaned);
    setBudgetError(parsedValue > 0 ? "" : "Enter a monthly budget greater than 0.");
  };

  const persistPreferences = (budgetValue: string, selectedCurrency: string, demoModeValue = false) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("pacepilot-onboarding-complete", "true");
    window.localStorage.setItem("pacepilot-demo-mode", demoModeValue ? "true" : "false");
    window.localStorage.setItem(
      "pacepilot-user-preferences",
      JSON.stringify({
        monthlyBudget: budgetValue,
        currency: selectedCurrency,
      })
    );
  };

  const closeOnboarding = () => {
    setIsTransitioningOut(true);
    window.setTimeout(() => {
      setIsOnboardingVisible(false);
      setIsTransitioningOut(false);
    }, 240);
  };

  const handleGetStarted = () => {
    setOnboardingStep(2);
    setBudgetError("");
  };

  const handleBudgetContinue = () => {
    const parsedValue = parseBudgetValue(monthlyBudget);
    if (parsedValue <= 0) {
      setBudgetError("Enter a monthly budget greater than 0.");
      return;
    }

    persistPreferences(monthlyBudget, currency, false);
    setIsDemoMode(false);
    closeOnboarding();
  };

  const handleExploreDemo = () => {
    setMonthlyBudget("50000");
    setAmountSpent("18000");
    setCurrentDay("12");
    setTotalDays("30");
    setIsDemoMode(true);
    persistPreferences("50000", currency, true);
    closeOnboarding();
  };

  const handleResetOnboarding = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("pacepilot-onboarding-complete");
      window.localStorage.removeItem("pacepilot-user-preferences");
      window.localStorage.removeItem("pacepilot-demo-mode");
    }

    setMonthlyBudget("");
    setAmountSpent("");
    setCurrentDay("");
    setTotalDays("");
    setResult(null);
    setCurrency("USD");
    setCurrencyLocale(typeof window !== "undefined" ? window.navigator.language || "en-US" : "en-US");
    setOnboardingStep(1);
    setBudgetError("");
    setIsDemoMode(false);
  };

  const handleReopenOnboarding = () => {
    setOnboardingStep(1);
    setBudgetError("");
    setIsTransitioningOut(false);
    setIsOnboardingVisible(true);
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

  const currencyFormatter = new Intl.NumberFormat(currencyLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });

  const currencySymbol = getCurrencySymbol(currencyLocale, currency);

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] px-3 py-4 text-slate-900 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      {isOnboardingVisible ? (
        <div className={`fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-slate-950/70 px-3 py-3 backdrop-blur-sm transition duration-300 ${isTransitioningOut ? "opacity-0" : "opacity-100"}`}>
          <div className={`flex max-h-[calc(100vh-1.5rem)] w-full max-w-5xl flex-col justify-center overflow-hidden rounded-[32px] border border-slate-200/80 bg-white p-4 shadow-[0_24px_70px_-24px_rgba(15,23,42,0.36)] transition-all duration-300 sm:p-6 lg:p-8 ${isTransitioningOut ? "translate-y-2 scale-[0.98]" : "translate-y-0 scale-100"}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-600/10 p-2 text-blue-600">
                  <SparklesIcon className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-slate-500">{onboardingStep === 1 ? "Budget Pacing Tracker" : "Monthly Budget"}</p>
              </div>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${(onboardingStep / 2) * 100}%` }} />
              </div>
            </div>

            {onboardingStep === 1 ? (
              <div className="mt-5 flex flex-1 flex-col justify-center gap-5">
                <div className="mx-auto max-w-2xl text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
                    <CurrencyIcon className="h-7 w-7" />
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    Stay ahead of your budget.
                  </h2>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    PacePilot helps you understand your spending pace so you always know how much you can safely spend today.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleGetStarted}
                      className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                    >
                      Get Started
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleExploreDemo}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition duration-200 hover:border-slate-300 hover:text-slate-900"
                    >
                      Explore Demo
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      title: "Daily Safe Spending",
                      description: "Know exactly how much you can safely spend today.",
                      icon: <CurrencyIcon className="h-5 w-5" />,
                    },
                    {
                      title: "Budget Pace",
                      description: "See whether you're spending ahead or behind your ideal budget pace.",
                      icon: <CalendarIcon className="h-5 w-5" />,
                    },
                    {
                      title: "Smart Insights",
                      description: "Receive simple recommendations to stay on track.",
                      icon: <SparklesIcon className="h-5 w-5" />,
                    },
                  ].map((card, index) => (
                    <div
                      key={card.title}
                      className="rounded-[22px] border border-slate-200/80 bg-slate-50 p-4 transition duration-200 hover:-translate-y-0.5 hover:bg-white"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-blue-600/10 p-2 text-blue-600">
                          {card.icon}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{card.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {onboardingStep === 2 ? (
              <div className="mt-8 max-w-2xl">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  What&apos;s your monthly budget?
                </h2>
                <p className="mt-2 text-base leading-7 text-slate-600">
                  We’ll use this to personalize your pacing from the very first moment.
                </p>

                <div className="mt-6 rounded-[24px] border border-slate-200/80 bg-slate-50 p-4 sm:p-5">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Monthly budget</span>
                    <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 transition duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                      <span className="mr-2 text-sm font-semibold text-slate-400">{currencySymbol}</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={monthlyBudget}
                        onChange={(event) => handleBudgetInputChange(event.target.value)}
                        placeholder="50,000"
                        className="w-full bg-transparent text-lg font-semibold text-slate-900 outline-none"
                      />
                    </div>
                  </label>

                  <p className="mt-3 text-sm text-slate-500">You can change this anytime in Settings.</p>

                  {budgetError ? (
                    <p className="mt-3 text-sm font-medium text-rose-600">{budgetError}</p>
                  ) : null}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setOnboardingStep(1);
                      setBudgetError("");
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition duration-200 hover:border-slate-300 hover:text-slate-900"
                  >
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleBudgetContinue}
                    className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Continue
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <main className="mx-auto flex max-w-6xl flex-col gap-5 rounded-[28px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_16px_50px_-24px_rgba(15,23,42,0.28)] backdrop-blur sm:gap-6 sm:p-6 lg:gap-7 lg:p-8">
        {isDemoMode ? (
          <div className="rounded-[20px] border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-800">
            You&apos;re viewing demo data. Start your own budget anytime.
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[24px] bg-slate-950 p-5 text-white sm:p-7 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-blue-100">
                <SparklesIcon className="h-4 w-4" />
                AI-ready pacing insights
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-200">
                  PacePilot
                </p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.35rem]">
                  Google Ads Budget Pacing Tool
                </h1>
                <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-[0.95rem]">
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

        <section className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
          <div className="space-y-4 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm sm:p-5">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-blue-600/10 p-2 text-blue-600">
                <CurrencyIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Budget inputs</h2>
                <p className="text-sm text-slate-500">Enter your monthly plan and current spend</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Monthly Budget</span>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 transition duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <span className="mr-2 text-sm font-semibold text-slate-400">{currencySymbol}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={monthlyBudget}
                    onChange={(event) => handleBudgetInputChange(event.target.value)}
                    placeholder="50,000"
                    className="w-full bg-transparent text-base text-slate-900 outline-none"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    <span className="font-medium">Currency</span>
                    <select
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value)}
                      className="bg-transparent font-medium text-slate-900 outline-none"
                    >
                      {currencyOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.code}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="text-sm text-slate-500">{budgetError || "Your preferences are saved automatically."}</p>
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Amount Spent</span>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 transition duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <span className="mr-2 text-sm font-semibold text-slate-400">{currencySymbol}</span>
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
                <span className="text-sm font-medium text-slate-700">Days Lapsed</span>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 transition duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
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
                <span className="text-sm font-medium text-slate-700">Flight Duration (in days)</span>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 transition duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
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

          <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm sm:p-5">
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

            <div className="mt-5 space-y-4">
              {statusBanner ? (
                <div className={`rounded-[20px] border border-slate-200/80 p-4 ${statusBanner.tone}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">Status</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">{statusBanner.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6">{statusBanner.description}</p>
                </div>
              ) : null}

              <div className="rounded-[20px] bg-slate-950 p-5 text-white">
                <p className="text-sm font-medium text-slate-300">Today’s Recommended Spend</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {result ? currencyFormatter.format(result.recommendedDailySpend) : "—"}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-[18px] border border-slate-200/80 bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Budget Remaining</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {result ? currencyFormatter.format(result.budgetRemaining) : "—"}
                  </p>
                </div>
                <div className="rounded-[18px] border border-slate-200/80 bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Days Remaining</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {result ? `${result.daysRemaining}` : "—"}
                  </p>
                </div>
                <div className="rounded-[18px] border border-slate-200/80 bg-slate-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Forecasted End-of-Month Spend</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {result ? currencyFormatter.format(result.projectedEndOfMonthSpend) : "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-[20px] border border-slate-200/80 bg-slate-50 p-4">
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
                    className={`h-full rounded-full transition-all duration-200 ease-out ${
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
                  className="text-sm font-semibold text-blue-600 transition duration-200 hover:text-blue-700"
                >
                  {showDetails ? "Hide details" : "View details"}
                </button>
              </div>

              {showDetails ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] border border-slate-200/80 bg-white p-3">
                    <p className="text-sm text-slate-500">Expected Spend</p>
                    <p className="mt-2 text-base font-semibold text-slate-950">
                      {result ? currencyFormatter.format(result.expectedSpendByToday) : "—"}
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-slate-200/80 bg-white p-3">
                    <p className="text-sm text-slate-500">Actual Spend</p>
                    <p className="mt-2 text-base font-semibold text-slate-950">
                      {result ? currencyFormatter.format(Number(amountSpent) || 0) : "—"}
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-slate-200/80 bg-white p-3">
                    <p className="text-sm text-slate-500">Difference</p>
                    <p className="mt-2 text-base font-semibold text-slate-950">
                      {result ? `${Number(amountSpent) >= result.expectedSpendByToday ? "+" : "-"}${currencyFormatter.format(Math.abs(Number(amountSpent) - result.expectedSpendByToday))}` : "—"}
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-slate-200/80 bg-white p-3">
                    <p className="text-sm text-slate-500">Average Daily Spend</p>
                    <p className="mt-2 text-base font-semibold text-slate-950">
                      {result ? currencyFormatter.format(result.averageDailySpend) : "—"}
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-slate-200/80 bg-white p-3">
                    <p className="text-sm text-slate-500">Forecast Difference</p>
                    <p className="mt-2 text-base font-semibold text-slate-950">
                      {result ? `${result.projectedDifference >= 0 ? "+" : "-"}${currencyFormatter.format(Math.abs(result.projectedDifference))}` : "—"}
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-slate-200/80 bg-white p-3">
                    <p className="text-sm text-slate-500">Budget Used</p>
                    <p className="mt-2 text-base font-semibold text-slate-950">
                      {result ? currencyFormatter.format(Number(amountSpent) || 0) : "—"}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-200 pt-3 text-sm text-slate-500">
          <span>Built by Anmolpreet Singh</span>
          <button
            type="button"
            onClick={handleReopenOnboarding}
            className="text-sm font-medium text-blue-600 transition duration-200 hover:text-blue-700"
          >
            Reopen welcome
          </button>
          <button
            type="button"
            onClick={handleResetOnboarding}
            className="text-sm font-medium text-blue-600 transition duration-200 hover:text-blue-700"
          >
            Reset onboarding
          </button>
        </footer>
      </main>
    </div>
  );
}
