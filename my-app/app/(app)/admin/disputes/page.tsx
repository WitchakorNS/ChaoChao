import { getDisputes, getAllUsers } from "@/lib/db";
import {
  AdminDisputesClient,
  type DisputeView,
} from "@/components/chao/admin-disputes-client";

export default async function AdminDisputesPage() {
  const [disputes, users] = await Promise.all([getDisputes(), getAllUsers()]);
  const usersById = new Map(users.map((u) => [u.id, u]));
  const initial: DisputeView[] = disputes.map((d) => ({
    ...d,
    openerName: usersById.get(d.openedById)?.name,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">ข้อพิพาท</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        จัดการข้อพิพาทระหว่างผู้เช่าและผู้ให้เช่า
      </p>
      <AdminDisputesClient initial={initial} />
    </div>
  );
}
