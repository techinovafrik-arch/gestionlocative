import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ElementNotification } from "@/components/notifications/notification-item";

// RG-N01 : centre de notifications interne, propre à chaque utilisateur.
export default async function PageNotifications() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const notifications = await prisma.notification.findMany({
    where: { utilisateurId: session.user.id },
    orderBy: { date: "desc" },
  });

  const nonLues = notifications.filter((n) => !n.lue).length;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">
        Notifications ({notifications.length}){nonLues > 0 && ` — ${nonLues} non lue(s)`}
      </h1>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <ElementNotification
            key={notification.id}
            notification={{
              id: notification.id,
              type: notification.type,
              titre: notification.titre,
              message: notification.message,
              lue: notification.lue,
              date: notification.date.toISOString(),
            }}
          />
        ))}
        {notifications.length === 0 && (
          <p className="text-sm text-slate-500">Aucune notification.</p>
        )}
      </div>
    </div>
  );
}
