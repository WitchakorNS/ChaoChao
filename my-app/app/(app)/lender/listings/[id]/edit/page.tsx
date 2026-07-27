import { notFound } from "next/navigation";
import { getListingById } from "@/lib/db";
import { ListingForm } from "@/components/chao/listing-form";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();
  return <ListingForm existing={listing} />;
}
