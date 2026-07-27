// The app uses string ids (p1, u2, BK-3); the DB uses integers.
//
// Item ids align 1:1 with the mock scheme (DB item_id N <-> "pN").
// User ids are offset: the demo user is DB user_id 1 but the app calls it
// "u_me", the admin is DB user_id 7 ("u_admin"), and the named users shift by
// one (DB user_id 2 -> "u1", 3 -> "u2", ...). These helpers keep DB rows and
// the mock catalog referring to the same people so mock fallback lookups stay
// correct.

export const itemNum = (id: string) => Number(id.replace(/^p/, ""));
export const orderNum = (id: string) => Number(id.replace(/^BK-/, ""));

// DB user_id -> app user id
export function uid(n: number): string {
  if (n === 1) return "u_me";
  if (n === 7) return "u_admin";
  return `u${n - 1}`;
}

// app user id -> DB user_id
export function userNum(id: string): number {
  if (id === "u_me") return 1;
  if (id === "u_admin") return 7;
  return Number(id.replace(/^u/, "")) + 1;
}
