import { useState, useEffect, Suspense } from "react";
import { useTranslation } from "react-i18next";
import ConfidenceBadge from "./ConfidenceBadge";
import TimestampAge from "./TimestampAge";
import OverrideForm, { type OverrideState } from "./OverrideForm";

export interface TriageResponse {
  caseId: string;
  suggestedPriority: "low" | "medium" | "high" | "critical";
  suggestedCategory: string;
  reasoning: string;
  confidence: "low" | "medium" | "high";
}

export interface TriageCardProps {
  caseId: string;
  machineType: string;
  description: string;
  submittedAt: string;
  locale: string;
}

type TriageState = "loading" | "success" | "error";

const PRIORITY_BADGE: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border border-red-300",
  high: "bg-orange-100 text-orange-700 border border-orange-300",
  medium: "bg-amber-100 text-amber-700 border border-amber-300",
  low: "bg-green-100 text-green-700 border border-green-300",
};

const PRIORITY_LEFT_BORDER: Record<string, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-yellow-500",
  low: "border-l-green-500",
};

const CATEGORY_KEY: Record<string, string> = {
  "Mechanical Failure": "mechanicalFailure",
  Electrical: "electrical",
  Hydraulic: "hydraulic",
  "Software/Controls": "softwareControls",
  "Preventive Maintenance": "preventiveMaintenance",
  Unknown: "unknown",
};

const PANEL_BORDER: Record<string, string> = {
  high: "border border-gray-200",
  medium: "border-2 border-dashed border-amber-400",
  low: "bg-amber-50 border-2 border-amber-500",
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-l-4 border-gray-200 p-6 animate-pulse space-y-4 shadow-md">
      <div className="flex justify-between">
        <div className="space-y-1.5">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-5 bg-gray-200 rounded w-48" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
      <div className="h-28 bg-gray-100 rounded-lg" />
      <div className="flex gap-3">
        <div className="h-10 bg-gray-200 rounded flex-1" />
        <div className="h-10 bg-gray-200 rounded flex-1" />
      </div>
    </div>
  );
}

function TriageCardContent({
  caseId,
  machineType,
  description,
  submittedAt,
  locale,
}: TriageCardProps) {
  const { t, i18n } = useTranslation("triage");
  const [triageState, setTriageState] = useState<TriageState>("loading");
  const [triageResult, setTriageResult] = useState<TriageResponse | null>(null);
  const [override, setOverride] = useState<OverrideState>({
    enabled: false,
    priority: "medium",
    category: "Unknown",
    reason: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale, i18n]);

  useEffect(() => {
    fetch("http://localhost:8000/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, machineType, description, submittedAt }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<TriageResponse>;
      })
      .then((data) => {
        setTriageResult(data);
        setOverride({
          enabled: data.confidence === "low",
          priority: data.suggestedPriority,
          category: data.suggestedCategory,
          reason: "",
        });
        setTriageState("success");
      })
      .catch(() => setTriageState("error"));
  }, [caseId, machineType, description, submittedAt]);

  if (triageState === "loading") return <SkeletonCard />;

  if (triageState === "error") {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6 space-y-4 shadow-md">
        <p className="text-red-700 font-medium">{t("ui.aiUnavailable")}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("override.priority")}
            </label>
            <select
              value={override.priority}
              onChange={(e) => setOverride((prev) => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(["low", "medium", "high", "critical"] as const).map((p) => (
                <option key={p} value={p}>
                  {t(`priority.${p}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("override.category")}
            </label>
            <select
              value={override.category}
              onChange={(e) => setOverride((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[
                "Mechanical Failure",
                "Electrical",
                "Hydraulic",
                "Software/Controls",
                "Preventive Maintenance",
                "Unknown",
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  const result = triageResult!;
  const confidence = result.confidence;
  const isUnknown = result.suggestedCategory === "Unknown";

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${PRIORITY_LEFT_BORDER[result.suggestedPriority]} p-6 space-y-4 shadow-md`}
    >
      {/* Header: machine type + case ID + timestamp */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
            {t("ui.machineType")}
          </p>
          <h2 className="text-base font-semibold text-gray-900">{machineType}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Case #{caseId}</p>
        </div>
        <TimestampAge submittedAt={submittedAt} locale={locale} />
      </div>

      {/* Description with expand/collapse */}
      <div>
        <p className={`text-sm text-gray-600 leading-relaxed ${descExpanded ? "" : "line-clamp-3"}`}>
          {description}
        </p>
        <button
          type="button"
          onClick={() => setDescExpanded((v) => !v)}
          className="mt-1 text-xs text-blue-600 hover:underline"
        >
          {descExpanded ? t("ui.collapseDescription") : t("ui.expandDescription")}
        </button>
      </div>

      {/* AI suggestion panel — two-column layout */}
      <div className={`rounded-lg p-4 ${PANEL_BORDER[confidence]}`}>
        <div className="grid grid-cols-2 gap-4">
          {/* Left: priority + category stacked */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                {t("override.priority")}
              </p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded border text-sm font-semibold ${PRIORITY_BADGE[result.suggestedPriority]}`}
              >
                {t(`priority.${result.suggestedPriority}`)}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                {t("override.category")}
              </p>
              <span className="text-sm text-gray-800 font-medium">
                {CATEGORY_KEY[result.suggestedCategory]
                  ? t(`category.${CATEGORY_KEY[result.suggestedCategory]}`)
                  : result.suggestedCategory}
              </span>
            </div>
          </div>
          {/* Right: confidence + reasoning */}
          <div className="space-y-2">
            <ConfidenceBadge confidence={confidence} />
            {confidence === "medium" && (
              <p className="text-xs text-amber-600 font-medium">{t("ui.reviewRecommended")}</p>
            )}
            <p className="text-sm text-gray-700 italic leading-relaxed">{result.reasoning}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {!submitted ? (
        <div className="space-y-2">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              disabled={isUnknown}
              title={isUnknown ? t("ui.cannotAcceptUnknown") : undefined}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                isUnknown
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
              }`}
            >
              <span aria-hidden="true">✓</span>
              {t("ui.accept")}
            </button>
            <button
              type="button"
              onClick={() => setOverride((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <span aria-hidden="true">✏</span>
              {t("ui.override")}
            </button>
          </div>
          {isUnknown && (
            <p className="text-xs text-amber-600">{t("ui.cannotAcceptUnknown")}</p>
          )}
        </div>
      ) : (
        <p
          className="text-sm text-green-700 font-semibold"
          style={{ animation: "fade-in 0.3s ease-out forwards" }}
        >
          ✓ {t("ui.accepted")}
        </p>
      )}

      {/* Override form — pre-shown when confidence is low */}
      {override.enabled && !submitted && (
        <OverrideForm
          override={override}
          onOverrideChange={setOverride}
          onSubmit={() => setSubmitted(true)}
          isSubmitted={submitted}
        />
      )}
    </div>
  );
}

export default function TriageReviewCard(props: TriageCardProps) {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <TriageCardContent {...props} />
    </Suspense>
  );
}
