import React from "react";
import { HashIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface PurchaseOrderTableProps {
  data: any;
  fetching: boolean;
  user: any;
  handleView: (id: number) => void;
  updateDeliveryStatus: (args: { id: number; delivery_status: "pending" | "partial" | "delivered" }) => void;
}

export const PurchaseOrderTable: React.FC<PurchaseOrderTableProps> = ({
  data,
  fetching,
  user,
  handleView,
  updateDeliveryStatus,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[140px] border-b">PR Number</TableHead>
          <TableHead className="border-b">PR Created</TableHead>
          <TableHead className="border-b">PO Number</TableHead>
          <TableHead className="border-b">PO Status</TableHead>
          <TableHead className="border-b">PO Created</TableHead>
          <TableHead className="border-b">PO Approved Date</TableHead>
          <TableHead className="border-b">PO Approval (Days)</TableHead>
          <TableHead className="border-b"># of Days On Hold for PO</TableHead>
          <TableHead className="border-b">Delivery Status</TableHead>
          <TableHead className="border-b">Purchasing Associate</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody className="cursor-pointer">
        {fetching && (
          <TableRow>
            <TableCell colSpan={10} className="py-0 px-0">
              <div className="w-full">
                <Progress indeterminate className="w-full" />
              </div>
            </TableCell>
          </TableRow>
        )}

        {data?.items?.map((item: any) => (
          <TableRow key={item.id} onClick={() => handleView(item.id)}>
            {/* PR Number */}
            <TableCell className="font-medium capitalize">
              <div className="flex flex-row gap-2">
                <HashIcon className="h-4 w-5 my-1" />
                <p className="my-1">{item.series_no}</p>
              </div>
            </TableCell>

            {/* PR Created */}
            <TableCell>{item.pr_created ?? "n/a"}</TableCell>

            {/* PO Number */}
            <TableCell className="font-medium capitalize">
              <div className="flex flex-row gap-2">
                <HashIcon className="h-4 w-5 my-1" />
                <p className="my-1">{item.po_no ?? "n/a"}</p>
              </div>
            </TableCell>

            {/* PO Status */}
            <TableCell className="capitalize">
              {item.po_status === "For_approval"
                ? "For Approval"
                : item.po_status === "canceled"
                ? "Cancelled"
                : item.po_status ?? "n/a"}
            </TableCell>

            {/* PO Created */}
            <TableCell className="capitalize">
              {item.po_created_date
                ? new Date(item.po_created_date).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  }).replace(/\//g, "-")
                : "n/a"}
            </TableCell>

            {/* PO Approved Date */}
            <TableCell className="capitalize">
              {item.po_approved_date
                ? new Date(item.po_approved_date).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  }).replace(/\//g, "-")
                : "n/a"}
            </TableCell>

            {/* PO Approval Days */}
            <TableCell className="capitalize">
              {(() => {
                const poCreatedDate = item.po_created_date ? new Date(item.po_created_date) : null;
                const poApprovedDate = item.po_approved_date ? new Date(item.po_approved_date) : null;

                if (!poCreatedDate) return "N/A";
                if (!poApprovedDate) return "Pending approval";

                const diffDays = Math.floor((poApprovedDate.getTime() - poCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) return "Invalid date sequence";
                if (diffDays === 0) return "Within the day";
                return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
              })()}
            </TableCell>

            {/* Days on Hold */}
            <TableCell>
              {(() => {
                const hodDate = item.hod_signed_at ? new Date(item.hod_signed_at) : null;
                const trDate = item.tr_signed_at ? new Date(item.tr_signed_at) : null;
                const poCreatedDate = item.po_created_date ? new Date(item.po_created_date) : null;

                let latestApprovalDate: Date | null = null;
                if (hodDate && trDate) latestApprovalDate = hodDate > trDate ? hodDate : trDate;
                else if (hodDate) latestApprovalDate = hodDate;
                else if (trDate) latestApprovalDate = trDate;

                if (!latestApprovalDate || !poCreatedDate) return "N/A";

                const diffDays = Math.floor((poCreatedDate.getTime() - latestApprovalDate.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) return "Invalid date sequence";
                return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
              })()}
            </TableCell>

            {/* Delivery Status */}
            <TableCell className="capitalize" onClick={(e) => e.stopPropagation()}>
              <Select
                disabled={
                  !(user?.role
                    ? Array.isArray(user.role)
                      ? user.role.includes("admin") || user.role.includes("user") || user.role.includes("purchasing")
                      : user.role === "admin" || user.role === "purchasing"
                    : false) || item.po_status !== "approved"
                }
                defaultValue={
                  Array.isArray(item.delivery_status)
                    ? "pending"
                    : (item.delivery_status as "pending" | "partial" | "delivered") ?? "pending"
                }
                onValueChange={(value: "pending" | "partial" | "delivered") =>
                  updateDeliveryStatus({ id: item.id, delivery_status: value })
                }
              >
                <SelectTrigger className="w-[140px] capitalize">
                  <SelectValue placeholder={item.delivery_status ?? "pending"} className="capitalize" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>

            {/* Purchasing Associate */}
            <TableCell className="capitalize">{item.purchaser_id?.name ?? "n/a"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
