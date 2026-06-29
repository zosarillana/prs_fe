import React, { useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePriceMonitoringHook } from "../hooks/usePriceMonitoring";
import { useGetItemPriceHook } from "../hooks/useGetItemPrice";
import { ItemPriceDialog } from "../components/itemPriceDialog";
import { itemPriceService } from "../itemPriceService";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth/authStore";

export default function PriceMonitoring() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = usePriceMonitoringHook();
  const {
    tableQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
  } = useGetItemPriceHook();

  const items = tableQuery.data?.items ?? [];
  const totalPages = tableQuery.data?.totalPages ?? 1;
  const user = useAuthStore((state) => state.user);

  const canManagePrices =
    user?.role?.includes("admin") || user?.role?.includes("purchasing");
  const canManageImport = user?.role?.includes("admin");

  // 🧩 MODAL STATE
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItemPrice, setEditingItemPrice] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importMutation.mutate(file, {
        onSuccess: () => tableQuery.refetch(),
      });
      e.target.value = "";
    }
  };

  /** Helper: generate visible page numbers with ellipsis */
  const getVisiblePages = () => {
    const visible: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) visible.push(i);
    } else {
      visible.push(1);
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      if (start > 2) visible.push("...");
      for (let i = start; i <= end; i++) visible.push(i);
      if (end < totalPages - 1) visible.push("...");
      visible.push(totalPages);
    }
    return visible;
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item price?"
    );

    if (!confirmed) return;

    try {
      await itemPriceService.delete(id);
      toast.success("Item price deleted");
      tableQuery.refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete item price");
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Item Prices</h1>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items or vendors..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {canManagePrices && (
            <>
              <Button
                onClick={() => {
                  setEditingItemPrice(null);
                  setModalOpen(true);
                }}
              >
                Add Entry
              </Button>
              {canManageImport && (
                <>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importMutation.isPending}
                  >
                    {importMutation.isPending ? "Importing..." : "Import Excel"}
                  </Button>
                </>
              )}
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-lg border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              {canManagePrices && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {tableQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            )}

            {!tableQuery.isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No data found
                </TableCell>
              </TableRow>
            )}

            {items.map((row: any) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  {row.item?.name ?? "-"}
                </TableCell>
                <TableCell>{row.vendor?.name ?? "-"}</TableCell>
                <TableCell>{row.unit_price}</TableCell>
                <TableCell>
                  {row.created_at
                    ? new Date(row.created_at).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {row.updated_at
                    ? new Date(row.updated_at).toLocaleDateString()
                    : "-"}
                </TableCell>

                {canManagePrices && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Map the row data to match what ItemPriceDialog expects
                          setEditingItemPrice({
                            id: row.id,
                            item_id: row.item_id, // These should exist in your API response
                            vendor_id: row.vendor_id, // These should exist in your API response
                            unit_price: row.unit_price,
                            item: row.item,
                            vendor: row.vendor,
                          });
                          // console.log("Editing row:", row); // Debug: Check what's in row
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(row.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <div className="flex items-center justify-between w-full border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {items.length} of {tableQuery.data?.totalItems ?? 0}
          </div>

          <div className="flex items-center gap-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 1 && setPage(page - 1)}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
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
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => page < totalPages && setPage(page + 1)}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            {/* Page size */}
            <div className="flex items-center gap-2 w-[200px]">
              <span className="text-sm text-muted-foreground w-full">
                Rows per page:
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Rows" />
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
      </div>

      {/* 🧩 MODAL */}
      <ItemPriceDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        itemPrice={editingItemPrice}
        onSuccess={() => tableQuery.refetch()}
      />
    </div>
  );
}
