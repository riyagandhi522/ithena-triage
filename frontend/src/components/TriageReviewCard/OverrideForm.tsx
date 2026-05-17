import { useState } from "react";
import { useTranslation } from "react-i18next";

const PRIORITIES = ["low", "medium", "high", "critical"] as const;

const CATEGORIES = [
  "Mechanical Failure",
  "Electrical",
  "Hydraulic",
  "Software/Controls",
  "Preventive Maintenance",
  "Unknown",
] as const;

const CATEGORY_KEY: Record<string, string> = {
  "Mechanical Failure": "mechanicalFailure",
  Electrical: "electrical",
  Hydraulic: "hydraulic",
  "Software/Controls": "softwareControls",
  "Preventive Maintenance": "preventiveMaintenance",
  Unknown: "unknown",
};

const CHIP_KEYS = [
  "machineTypeNotRecognized",
  "localContextApplies",
  "slaEscalation",
  "technicianError",
  "other",
] as const;

export interface OverrideState {
  enabled: boolean;
  priority: string;
  category: string;
  reason: string;
}

interface Props {
  override: OverrideState;
  onOverrideChange: (override: OverrideState) => void;
  onSubmit: () => void;
  isSubmitted: boolean;
}

export default function OverrideForm({ override, onOverrideChange, onSubmit, isSubmitted }: Props) {
  const { t } = useTranslation("triage");
  const [showValidation, setShowValidation] = useState(false);

  function patch(fields: Partial<OverrideState>) {
    onOverrideChange({ ...override, ...fields });
  }

  function handleSubmit() {
    if (!override.reason.trim()) {
      setShowValidation(true);
      return;
    }
    onSubmit();
  }

  return (
    <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200 border-t-2 border-t-slate-300 space-y-4">
      {/* Reason chips */}
      <div className="flex flex-wrap gap-2">
        {CHIP_KEYS.map((key) => {
          const label = t(`override.chips.${key}`);
          const selected = override.reason === label;
          return (
            <button
              key={key}
              type="button"
              onClick={() => patch({ reason: label })}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Reason textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("override.reason")}
        </label>
        <textarea
          value={override.reason}
          onChange={(e) => patch({ reason: e.target.value })}
          placeholder={t("override.reasonPlaceholder")}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {showValidation && !override.reason.trim() && (
          <p className="mt-1 text-sm text-red-600">{t("override.reasonRequired")}</p>
        )}
      </div>

      {/* Priority + Category dropdowns */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("override.priority")}
          </label>
          <select
            value={override.priority}
            onChange={(e) => patch({ priority: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRIORITIES.map((p) => (
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
            onChange={(e) => patch({ category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`category.${CATEGORY_KEY[c]}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitted}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("override.submit")}
        </button>
        <button
          type="button"
          onClick={() => patch({ enabled: false })}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
        >
          {t("override.cancel")}
        </button>
      </div>
    </div>
  );
}
