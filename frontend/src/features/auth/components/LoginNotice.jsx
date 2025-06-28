"use client";

import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { useTheme } from "../../../components/ThemeProvider";

export default function LoginNotice({ type, message, isVisible }) {
  const { theme } = useTheme();

  if (!isVisible || !message) return null;

  const getNoticeConfig = () => {
    if (theme === "dark") {
      switch (type) {
        case "success":
          return {
            bg: "bg-green-500/10 border-green-500",
            text: "text-green-400",
            icon: CheckCircle2,
            iconColor: "text-green-500",
          };
        case "error":
          return {
            bg: "bg-red-500/10 border-red-500",
            text: "text-red-400",
            icon: XCircle,
            iconColor: "text-red-500",
          };
        case "warning":
          return {
            bg: "bg-yellow-500/10 border-yellow-500",
            text: "text-yellow-400",
            icon: AlertCircle,
            iconColor: "text-yellow-500",
          };
        default:
          return {
            bg: "bg-blue-500/10 border-blue-500",
            text: "text-blue-400",
            icon: AlertCircle,
            iconColor: "text-blue-500",
          };
      }
    } else {
      // Light theme configs (existing)
      switch (type) {
        case "success":
          return {
            bg: "bg-green-50 border-green-200",
            text: "text-green-800",
            icon: CheckCircle2,
            iconColor: "text-green-500",
          };
        case "error":
          return {
            bg: "bg-red-50 border-red-200",
            text: "text-red-800",
            icon: XCircle,
            iconColor: "text-red-500",
          };
        case "warning":
          return {
            bg: "bg-yellow-50 border-yellow-200",
            text: "text-yellow-800",
            icon: AlertCircle,
            iconColor: "text-yellow-500",
          };
        default:
          return {
            bg: "bg-blue-50 border-blue-200",
            text: "text-blue-800",
            icon: AlertCircle,
            iconColor: "text-blue-500",
          };
      }
    }
  };

  const config = getNoticeConfig();
  const IconComponent = config.icon;

  return (
    <div
      className={`${config.bg} border rounded-lg p-3 flex items-center gap-2`}
    >
      <IconComponent className={`h-4 w-4 ${config.iconColor} flex-shrink-0`} />
      <span className={`text-sm ${config.text}`}>{message}</span>
    </div>
  );
}
