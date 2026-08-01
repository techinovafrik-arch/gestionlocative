"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LIBELLES_TYPE: Record<string, string> = {
  information: "Information",
  alerte: "Alerte",
  action_requise: "Action requise",
};

const COULEURS_TYPE: Record<string, string> = {
  information: "bg-blue-100 text-blue-800",
  alerte: "bg-orange-100 text-orange-800",
  action_requise: "bg-red-100 text-red-800",
};

type Notification = {
  id: string;
  type: string;
  titre: string;
  message: string;
  lue: boolean;
  date: string;
};

export function ElementNotification({ notification }: { notification: Notification }) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);

  async function marquerCommeLue() {
    setEnCours(true);
    await fetch(`/api/notifications/${notification.id}`, { method: "PATCH" });
    setEnCours(false);
    router.refresh();
  }

  return (
    <div
      className={`rounded-lg border p-4 ${notification.lue ? "border-slate-200 bg-white" : "border-blue-300 bg-blue-50"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${COULEURS_TYPE[notification.type]}`}
            >
              {LIBELLES_TYPE[notification.type]}
            </span>
            <span className="text-xs text-slate-500">
              {new Date(notification.date).toLocaleString("fr-FR")}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-900">{notification.titre}</p>
          <p className="text-sm text-slate-600">{notification.message}</p>
        </div>
        {!notification.lue && (
          <button
            onClick={marquerCommeLue}
            disabled={enCours}
            className="shrink-0 rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            {enCours ? "..." : "Marquer comme lue"}
          </button>
        )}
      </div>
    </div>
  );
}
