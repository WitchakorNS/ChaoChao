import { notFound } from "next/navigation";
import { getListing } from "@/lib/mock/data";
import { ListingForm } from "@/components/chao/listing-form";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();
  return <ListingForm existing={listing} />;
}
