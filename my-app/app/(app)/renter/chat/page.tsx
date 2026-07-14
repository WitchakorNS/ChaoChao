"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Info, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/store";
import { getListing, getUser, getCategory } from "@/lib/mock/data";
import { formatTime } from "@/lib/format";
import { Avatar, PlaceholderImage } from "@/components/chao/primitives";

export default function ChatPage() {
  const { chats, sendMessage, userId } = useDemo();
  const [activeId, setActiveId] = useState<string | null>(chats[0]?.id ?? null);
  const [text, setText] = useState("");
  const [mobileRoomOpen, setMobileRoomOpen] = useState(false);

  const active = chats.find((c) => c.id === activeId);
  const activeUser = active ? getUser(active.participantId) : undefined;
  const activeListing = active ? getListing(active.listingId) : undefined;

  const send = () => {
    if (!active || !text.trim()) return;
    sendMessage(active.id, text.trim());
    setText("");
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">แชท</h1>
      <div className="grid h-[calc(100vh-13rem)] overflow-hidden rounded-2xl border bg-card shadow-sm md:grid-cols-[300px_1fr]">
        {/* Room list */}
        <div
          className={cn(
            "flex-col border-r md:flex",
            mobileRoomOpen ? "hidden" : "flex",
          )}
        >
          <div className="border-b p-3 text-sm font-semibold text-muted-foreground">
            ห้องแชท ({chats.length})
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto">
            {chats.map((c) => {
              const u = getUser(c.participantId);
              const l = getListing(c.listingId);
              const cat = l ? getCategory(l.categoryId) : undefined;
              const lastMsg = c.messages[c.messages.length - 1];
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveId(c.id);
                    setMobileRoomOpen(true);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 border-b p-3 text-left transition hover:bg-muted/40",
                    activeId === c.id && "bg-muted/60",
                  )}
                >
                  <PlaceholderImage
                    seed={l?.imageSeeds[0] ?? c.id}
                    iconName={cat?.icon}
                    className="h-11 w-11 shrink-0"
                    rounded="rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {lastMsg?.text ?? "รูปภาพ"}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {c.bookingId.replace("BK-", "")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active room */}
        <div
          className={cn(
            "flex-col md:flex",
            mobileRoomOpen ? "flex" : "hidden",
          )}
        >
          {active && activeUser ? (
            <>
              <div className="flex items-center gap-3 border-b p-3">
                <button
                  onClick={() => setMobileRoomOpen(false)}
                  className="md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar seed={activeUser.avatarColor} initials={activeUser.initials} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{activeUser.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {activeListing?.title}
                  </p>
                </div>
                <Link
                  href={`/renter/bookings/${active.bookingId}`}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  <Info className="h-3.5 w-3.5" /> รายการเช่า
                </Link>
              </div>

              <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
                {active.messages.map((m) => {
                  const mine = m.senderId === userId;
                  return (
                    <div
                      key={m.id}
                      className={cn("flex", mine ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                          mine
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-background",
                        )}
                      >
                        {m.imageSeed && (
                          <PlaceholderImage
                            seed={m.imageSeed}
                            className="mb-1.5 h-32 w-44"
                            rounded="rounded-lg"
                          />
                        )}
                        {m.text}
                        <span
                          className={cn(
                            "mt-1 block text-right text-[10px]",
                            mine ? "text-primary-foreground/70" : "text-muted-foreground",
                          )}
                        >
                          {formatTime(m.time)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-center gap-2 border-t p-3"
              >
                <button
                  type="button"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  aria-label="แนบรูป"
                >
                  <ImagePlus className="h-5 w-5" />
                </button>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="พิมพ์ข้อความ..."
                  className="h-10 flex-1 rounded-full border bg-background px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/30"
                />
                <button
                  type="submit"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
                  disabled={!text.trim()}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              เลือกห้องแชทเพื่อเริ่มสนทนา
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
