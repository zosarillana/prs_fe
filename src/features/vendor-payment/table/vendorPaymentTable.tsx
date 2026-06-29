import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { VendorPaymentTableProps } from "../types/vendorPaymentTypes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Eye,
  MoreVertical,
  Trash,
  Loader2,
  Calendar,
} from "lucide-react"; // 🔹 add loader
import { useVendorPayments } from "../hooks/useVendorPayment";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function VendorPaymentTable({
  payments,
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  getVisiblePages,
  onView,
  onViewPrPo,
  onEdit,
  user,
  onServeDate,
  deletePayment,
  loading = false, // 🔹 new loading prop
}: VendorPaymentTableProps & { loading?: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border shadow relative">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SL #</TableHead>
            <TableHead>PO #</TableHead>
            <TableHead>Vendor Name</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead>Cheque Status</TableHead>
            <TableHead>Invoice Number</TableHead>
            <TableHead>Cheque Number</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date Served</TableHead>
            {user?.role?.includes("treasury") && (
              <TableHead className="text-center">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody className="cursor-pointer">
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={user?.role?.includes("treasury") ? 10 : 9}
                className="p-0"
              >
                <div className="w-full">
                  <Progress indeterminate />
                </div>
              </TableCell>
            </TableRow>
          ) : payments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={user?.role?.includes("treasury") ? 10 : 9}
                className="text-center py-6"
              >
                No data found
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow
                key={payment.id}
                className="hover:bg-gray-50"
                onClick={() => onView(payment)}
              >
                <TableCell className="font-medium w-120">
                  {payment.srl_no}
                </TableCell>
                <TableCell className="font-medium w-120">
                  {payment.po_no}
                </TableCell>
                <TableCell className="font-medium w-120">
                  {payment.vendor_name}
                </TableCell>
                <TableCell className="font-medium">
                  {payment.created_at
                    ? new Date(payment.created_at).toLocaleDateString()
                    : "-"}
                </TableCell>

                <TableCell>
                  <Badge
                    className={`
      rounded-full px-3 py-1 text-sm font-medium
      ${
        payment.status === "closed"
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : payment.status === "on_process"
            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
            : payment.status === "available"
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }
      cursor-pointer
    `}
                  >
                    {payment.status
                      ? payment.status
                          .replace(/_/g, " ")
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")
                      : "-"}
                  </Badge>
                </TableCell>

                <TableCell>{payment.inv_no || "—"}</TableCell>
                <TableCell>{payment.cheque_number}</TableCell>
                <TableCell>
                  ₱{" "}
                  {Number(payment.amount).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>

                <TableCell>
                  {payment.date_served
                    ? new Date(payment.date_served).toLocaleDateString()
                    : "-"}
                </TableCell>

                {(user?.role?.includes("treasury") ||
                  user?.role?.includes("admin")) && (
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="start"
                        className="w-34 animate-in fade-in-0 zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewPrPo?.(payment.prs_id);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> View PR - PO
                        </DropdownMenuItem>

                        {(["available", "on_process"].includes(
                          payment.status,
                        ) ||
                          user?.role?.includes("admin")) && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onServeDate?.(payment);
                            }}
                          >
                            <Calendar className="mr-2 h-4 w-4" /> Serve Date
                          </DropdownMenuItem>
                        )}

                        {(["available", "on_process"].includes(
                          payment.status,
                        ) ||
                          user?.role?.includes("admin")) && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit?.(payment);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}

                        {(["available", "on_process"].includes(
                          payment.status,
                        ) ||
                          user?.role?.includes("admin")) && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePayment(payment.id);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4 text-red-500" />
                            <p className="text-red-500">Delete</p>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* PAGINATION */}
      <div className="flex items-center justify-between w-full border-t p-4">
        <div className="text-sm text-muted-foreground">
          Showing {payments.length} of {payments.length}
        </div>

        <div className="flex items-center gap-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && setPage(page - 1)}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {getVisiblePages().map((p, i) =>
                typeof p === "number" ? (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={page === p}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ) : (
                  <span key={i} className="px-2 text-muted-foreground">
                    ...
                  </span>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages && setPage(page + 1)}
                  className={
                    page === totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
