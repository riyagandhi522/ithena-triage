import { useTranslation } from "react-i18next";

type Confidence = "low" | "medium" | "high";

const CONFIG: Record<Confidence, { colorClass: string; icon: string }> = {
  high: { colorClass: "bg-green-100 text-green-700 border-green-300", icon: "✓" },
  medium: { colorClass: "bg-amber-100 text-amber-700 border-amber-300", icon: "ℹ" },
  low: { colorClass: "bg-red-100 text-red-700 border-red-300", icon: "⚠" },
};

export default function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const { t } = useTranslation("triage");
  const { colorClass, icon } = CONFIG[confidence];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${colorClass}`}
    >
      <span aria-hidden="true">{icon}</span>
      {t(`confidence.${confidence}`)}
    </span>
  );
}
