import { InvoiceDetailView } from "@/features/invoices/InvoiceDetailView";
import { invoiceService } from "@/services";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const invoice = await invoiceService.getById(id);
  return {
    title: invoice
      ? `${invoice.supplierName} · ${invoice.invoiceNumber} — FlowLedger`
      : "Invoice Details — FlowLedger",
  };
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params;
  return <InvoiceDetailView id={id} />;
}
