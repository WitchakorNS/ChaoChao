"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  bookings as seedBookings,
  chatRooms as seedChats,
  notifications as seedNotifications,
  CURRENT_USER_ID,
  getUser,
} from "./mock/data";
import type {
  Booking,
  BookingStatus,
  ChatRoom,
  AppNotification,
  User,
} from "./mock/types";

// Which persona the demo is currently viewing as.
export type Persona = "renter" | "lender" | "admin";

interface DemoState {
  userId: string;
  me: User;
  logout: () => void;
  persona: Persona;
  setPersona: (p: Persona) => void;

  bookings: Booking[];
  notifications: AppNotification[];
  chats: ChatRoom[];
  saved: string[]; // saved listing ids

  unreadCount: number;
  savedCount: number;

  // actions
  toggleSaved: (listingId: string) => void;
  isSaved: (listingId: string) => boolean;
  markAllRead: () => void;
  markRead: (id: string) => void;
  approveBooking: (id: string) => void;
  rejectBooking: (id: string) => void;
  payBooking: (id: string) => void;
  advanceBooking: (id: string, status: BookingStatus) => void;
  sendMessage: (roomId: string, text: string) => void;
}

const DemoContext = createContext<DemoState | null>(null);

export function DemoStoreProvider({
  children,
  initialBookings,
  currentUserId,
  currentUser: currentUserProp,
}: {
  children: React.ReactNode;
  // Hydrated from the DB by the root layout; falls back to mock seed data.
  initialBookings?: Booking[];
  currentUserId?: string;
  currentUser?: User;
}) {
  const userId = currentUserId ?? CURRENT_USER_ID;
  const me = currentUserProp ?? getUser(CURRENT_USER_ID)!;
  // Persona is derived from the logged-in user's role (no manual switcher).
  const rolePersona: Persona =
    me.role === "admin" ? "admin" : me.role === "lender" ? "lender" : "renter";
  const [persona, setPersona] = useState<Persona>(rolePersona);
  // Keep persona in sync if the logged-in user changes (after router.refresh).
  useEffect(() => setPersona(rolePersona), [rolePersona]);
  const [bookings, setBookings] = useState<Booking[]>(() =>
    (initialBookings && initialBookings.length
      ? initialBookings
      : seedBookings
    ).map((b) => ({ ...b, timeline: b.timeline.map((t) => ({ ...t })) })),
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    seedNotifications.map((n) => ({ ...n })),
  );
  const [chats, setChats] = useState<ChatRoom[]>(() =>
    seedChats.map((c) => ({ ...c, messages: [...c.messages] })),
  );
  const [saved, setSaved] = useState<string[]>(["p3", "p5"]);

  // After a write the pages call router.refresh(), which re-runs the root
  // layout and hands us fresh rows from the DB. Re-sync so the store reflects
  // what was actually persisted (the DB is the source of truth).
  const bookingsKey = JSON.stringify(initialBookings ?? []);
  useEffect(() => {
    if (!initialBookings || !initialBookings.length) return;
    setBookings(
      initialBookings.map((b) => ({
        ...b,
        timeline: b.timeline.map((t) => ({ ...t })),
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingsKey]);

  const toggleSaved = useCallback((listingId: string) => {
    setSaved((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId],
    );
  }, []);

  const isSaved = useCallback(
    (listingId: string) => saved.includes(listingId),
    [saved],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const setBookingStatus = useCallback(
    (id: string, status: BookingStatus, markTimeline?: string[]) => {
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b;
          const timeline = b.timeline.map((t) =>
            markTimeline?.includes(String(t.status))
              ? { ...t, done: true }
              : t,
          );
          return { ...b, status, timeline };
        }),
      );
    },
    [],
  );

  const approveBooking = useCallback(
    (id: string) =>
      setBookingStatus(id, "awaiting_payment", ["pending", "awaiting_payment"]),
    [setBookingStatus],
  );
  const rejectBooking = useCallback(
    (id: string) => setBookingStatus(id, "cancelled"),
    [setBookingStatus],
  );
  const payBooking = useCallback(
    (id: string) => setBookingStatus(id, "confirmed", ["paid", "confirmed"]),
    [setBookingStatus],
  );
  const advanceBooking = useCallback(
    (id: string, status: BookingStatus) =>
      setBookingStatus(id, status, [String(status)]),
    [setBookingStatus],
  );

  const sendMessage = useCallback((roomId: string, text: string) => {
    if (!text.trim()) return;
    setChats((prev) =>
      prev.map((c) =>
        c.id === roomId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: `m-${Date.now()}`,
                  senderId: userId,
                  text,
                  time: new Date().toISOString(),
                },
              ],
            }
          : c,
      ),
    );
  }, [userId]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    // Full navigation so the server re-reads the (now cleared) cookie.
    window.location.href = "/login";
  }, []);

  const value = useMemo<DemoState>(
    () => ({
      userId,
      me,
      logout,
      persona,
      setPersona,
      bookings,
      notifications,
      chats,
      saved,
      unreadCount: notifications.filter((n) => !n.read).length,
      savedCount: saved.length,
      toggleSaved,
      isSaved,
      markAllRead,
      markRead,
      approveBooking,
      rejectBooking,
      payBooking,
      advanceBooking,
      sendMessage,
    }),
    [
      userId,
      me,
      logout,
      persona,
      bookings,
      notifications,
      chats,
      saved,
      toggleSaved,
      isSaved,
      markAllRead,
      markRead,
      approveBooking,
      rejectBooking,
      payBooking,
      advanceBooking,
      sendMessage,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoStoreProvider");
  return ctx;
}

/**
 * @deprecated Prefer `useDemo().me` — it reflects the logged-in user. This
 * standalone helper only returns the default demo user and can't see the cookie.
 */
export const currentUser = () => getUser(CURRENT_USER_ID)!;
