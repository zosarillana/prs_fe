import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";

interface VendorPaymentViewPrsPoTableProps {
  report: any;
}

export function SetMultiplePurchaseReportTable({
  report,
}: VendorPaymentViewPrsPoTableProps) {
  const truncate = (text: string | undefined, length = 40) => {
    if (!text) return "none";
    return text.length > length ? text.slice(0, length) + "…" : text;
  };

  return (
    <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
      <Table className="border-separate border-spacing-0 w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>PO #</TableHead>
            <TableHead>PO Status</TableHead>
            <TableHead>PO Create Date</TableHead>
            <TableHead>PO Approve Date</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {report.item_description?.map((desc: string, idx: number) => {
            const po = report.item_pos?.find((p: any) => p.item_index === idx);
            return (
              <TableRow key={idx}>
                <TableCell className="font-semibold"># {idx + 1}</TableCell>
                <TableCell className="w-72">{desc}</TableCell>
                <TableCell>{report.quantity?.[idx] ?? ""}</TableCell>
                <TableCell>{report.unit?.[idx] ?? ""}</TableCell>
                <TableCell>{report.tag?.[idx]?.description ?? ""}</TableCell>
                <TableCell className="capitalize">
                  {truncate(report.remarks?.[idx], 40)}
                </TableCell>
                <TableCell className="capitalize">
                  {(report.item_status?.[idx] ?? "pending").replace(/_/g, " ")}
                </TableCell>

                <TableCell>{po?.po_number ?? "—"}</TableCell>
                <TableCell className="capitalize">
                  {(po?.status ?? "—").replace(/_/g, " ")}
                </TableCell>

                <TableCell>
                  {po?.po_created_at
                    ? new Date(po.po_created_at).toISOString().split("T")[0]
                    : "—"}
                </TableCell>
                <TableCell>
                  {po?.po_approved_at
                    ? new Date(po.po_approved_at).toISOString().split("T")[0]
                    : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
