import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import {
  getCategory,
  getListing,
  getReviewsForListing,
  getUser,
  listings,
} from "@/lib/mock/data";
import { formatDate, thb } from "@/lib/format";
import {
  Avatar,
  Rating,
  SectionHeading,
  StatusChip,
  VerifiedBadge,
} from "@/components/chao/primitives";
import { ProductGallery } from "@/components/chao/product-gallery";
import { BookingWidget } from "@/components/chao/booking-widget";
import { ProductCard } from "@/components/chao/product-card";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();

  const category = getCategory(listing.categoryId);
  const owner = getUser(listing.ownerId);
  const reviews = getReviewsForListing(listing.id);
  const related = listings
    .filter((l) => l.categoryId === listing.categoryId && l.id !== listing.id)
    .slice(0, 4);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">หน้าแรก</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/explore" className="hover:text-foreground">ค้นหา</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{category?.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: gallery + info */}
        <div className="min-w-0 space-y-8">
          <ProductGallery seeds={listing.imageSeeds} iconName={category?.icon} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip
                tone={listing.status === "available" ? "success" : "warning"}
              >
                {listing.status === "available" ? "พร้อมให้เช่า" : "จองแล้ว"}
              </StatusChip>
              <span className="text-sm text-muted-foreground">{category?.name}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {listing.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <Rating value={listing.rating} count={listing.reviewCount} />
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {listing.location}
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <CalendarDays className="h-4 w-4" /> ว่างตั้งแต่{" "}
                {formatDate(listing.availableFrom)}
              </span>
            </div>
          </div>

          {/* Key facts */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="ค่าเช่า/วัน" value={thb(listing.pricePerDay)} />
            <Fact label="ค่ามัดจำ" value={thb(listing.deposit)} />
            <Fact label="สภาพสินค้า" value={listing.condition} />
            <Fact label="คะแนน" value={`${listing.rating} ★`} />
          </div>

          {/* Description */}
          <section>
            <h2 className="mb-2 text-lg font-semibold">รายละเอียดสินค้า</h2>
            <p className="leading-relaxed text-muted-foreground">
              {listing.description}
            </p>
          </section>

          {/* Terms */}
          <section>
            <h2 className="mb-2 text-lg font-semibold">เงื่อนไขการเช่า</h2>
            <ul className="space-y-2">
              {listing.terms.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-info" />
                  {t}
                </li>
              ))}
            </ul>
          </section>

          {/* Lender card */}
          {owner && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">ข้อมูลผู้ให้เช่า</h2>
              <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
                <Avatar seed={owner.avatarColor} initials={owner.initials} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{owner.name}</p>
                    <VerifiedBadge kyc={owner.kyc} />
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                    <Rating value={owner.rating} count={owner.reviewCount} />
                    <span>ตอบกลับ {owner.responseRate}%</span>
                    <span>เข้าร่วมปี {owner.joinedYear}</span>
                  </div>
                </div>
                <Link
                  href="/renter/chat"
                  className="hidden shrink-0 rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted sm:block"
                >
                  แชท
                </Link>
              </div>
            </section>
          )}

          {/* Reviews */}
          <section>
            <SectionHeading title={`รีวิว (${reviews.length})`} />
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => {
                  const author = getUser(r.authorId);
                  return (
                    <div key={r.id} className="rounded-xl border bg-card p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        {author && (
                          <Avatar
                            seed={author.avatarColor}
                            initials={author.initials}
                            size={40}
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{author?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(r.date)}
                          </p>
                        </div>
                        <Rating value={r.productRating} />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {r.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right: booking widget */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <BookingWidget listing={listing} />
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <SectionHeading title="สินค้าที่คล้ายกัน" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((l) => (
              <ProductCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}
