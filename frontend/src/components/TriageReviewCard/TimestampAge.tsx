import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  submittedAt: string;
  locale: string;
}

function ageMinutes(submittedAt: string): number {
  return Math.floor((Date.now() - new Date(submittedAt).getTime()) / 60_000);
}

export default function TimestampAge({ submittedAt, locale }: Props) {
  const { t } = useTranslation("triage");
  const [minutes, setMinutes] = useState(() => ageMinutes(submittedAt));

  useEffect(() => {
    const id = setInterval(() => setMinutes(ageMinutes(submittedAt)), 60_000);
    return () => clearInterval(id);
  }, [submittedAt]);

  const colorClass =
    minutes < 60 ? "text-green-600" : minutes < 240 ? "text-amber-500" : "text-red-600";

  const label =
    minutes < 1
      ? t("ui.justNow")
      : minutes < 60
        ? t("ui.minutesAgo", { count: minutes })
        : t("ui.hoursAgo", { count: Math.floor(minutes / 60) });

  const fullDate = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(submittedAt));

  return (
    <span className={`text-sm font-medium ${colorClass}`} title={fullDate}>
      {label}
    </span>
  );
}
