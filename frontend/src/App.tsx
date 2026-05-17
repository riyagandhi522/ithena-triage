import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getLocale, type SupportedLocale } from "./utils/locale";
import TriageReviewCard from "./components/TriageReviewCard";
import CaseStatusBadge from "./components/CaseStatusBadge";

const LOCALES: { code: SupportedLocale; label: string }[] = [
  { code: "en-US", label: "EN" },
  { code: "de-DE", label: "DE" },
  { code: "ja-JP", label: "JA" },
];

// submittedAt is fixed at 2 hours ago from page load — matches CLAUDE.md demo case
const demoCase = {
  caseId: "DEMO-001",
  machineType: "Industrial Hydraulic Pump",
  description:
    "Pump making loud grinding noise since morning shift start. Line 3 is operating at 40% capacity. Operators report vibration in the main coupling. No visible leaks but pressure gauge reading is fluctuating between 80-120 PSI instead of normal 140 PSI.",
  submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
};

export default function App() {
  const { t, i18n } = useTranslation("triage");
  const [locale, setLocale] = useState<SupportedLocale>(() =>
    getLocale(navigator.language),
  );

  function switchLocale(next: SupportedLocale) {
    void i18n.changeLanguage(next);
    setLocale(next);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-900 tracking-tight">
          ITHENA iSERV — AI Triage Demo
        </h1>
        <div className="flex gap-1">
          {LOCALES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => switchLocale(code)}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                locale === code
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Triage card + case status */}
      <main className="max-w-[680px] mx-auto px-4 py-6 space-y-4">
        <TriageReviewCard {...demoCase} locale={locale} />
        <div className="bg-white rounded-xl border border-gray-200 shadow-md px-6 py-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            {t("ui.caseStatus")}
          </p>
          <CaseStatusBadge
            status="inProgress"
            updatedAt={new Date(Date.now() - 30 * 60 * 1000).toISOString()}
            locale={locale}
          />
        </div>
      </main>
    </div>
  );
}
