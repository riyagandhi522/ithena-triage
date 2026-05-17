import { useTranslation } from "react-i18next";
import { formatDate, type SupportedLocale } from "../../utils/locale";

type Status = "open" | "inProgress" | "resolved";

interface Props {
  status: Status;
  updatedAt: string;
  locale: SupportedLocale;
}

const STATUS_STYLE: Record<Status, string> = {
  open: "bg-blue-100 text-blue-700",
  inProgress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
};

export default function CaseStatusBadge({ status, updatedAt, locale }: Props) {
  const { t } = useTranslation("triage");

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span
        className={`px-2.5 py-0.5 rounded text-xs font-semibold ${STATUS_STYLE[status]}`}
      >
        {t(`status.${status}`)}
      </span>
      <span className="text-xs text-gray-400">
        {t("ui.updated")}: {formatDate(new Date(updatedAt), locale)}
      </span>
    </div>
  );
}
