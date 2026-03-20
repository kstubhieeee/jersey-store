import { notFound } from "next/navigation";
import { getJerseyById } from "@/lib/catalog";
import { formatInrFromPaise } from "@/lib/catalog-shared";
import { SectionHeader } from "@/components/section-header";
import { ProductActions } from "@/components/product-actions";
import { JerseyGallery } from "@/components/jersey-gallery";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const jersey = await getJerseyById(id);
  if (!jersey) return { title: "Product Not Found" };
  return { title: `${jersey.name} | ClassicKit` };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const jersey = await getJerseyById(id);

  if (!jersey) notFound();

  const priceLabel = `₹${formatInrFromPaise(jersey.pricePaise)}`;

  return (
    <div className="min-h-screen bg-background">
      <SectionHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          <JerseyGallery images={jersey.images} productName={jersey.name} />
          <div className="flex flex-col">
            <span className="mb-2 text-xs text-muted-foreground">
              {jersey.years || "Vintage"}
            </span>
            <h1 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">{jersey.name}</h1>
            {jersey.description ? (
              <p className="mb-4 text-sm text-muted-foreground">{jersey.description}</p>
            ) : null}
            <p className="mb-6 text-3xl font-semibold text-primary">{priceLabel}</p>
            <ProductActions
              jerseyId={String(jersey._id)}
              sizes={jersey.sizes}
              piecesInStock={jersey.piecesInStock}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
