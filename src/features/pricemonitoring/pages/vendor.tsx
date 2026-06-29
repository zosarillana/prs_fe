import React, { useState } from "react";
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
import { useGetVendorsHook } from "../hooks/useGetVendors";
import { VendorDialog } from "../components/vendorDialog";
import { toast } from "sonner";
import { vendorService } from "../vendorService";
import { useAuthStore } from "@/store/auth/authStore";

export default function Vendors() {
  const {
    tableQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
  } = useGetVendorsHook();

  const vendors = tableQuery.data?.items ?? [];
  const totalPages = tableQuery.data?.totalPages ?? 1;
  const user = useAuthStore((state) => state.user);
  const canManagePrices =
    user?.role?.includes("admin") || user?.role?.includes("purchasing");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any | null>(null);

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
      "Are you sure you want to delete this vendor?"
    );

    if (!confirmed) return;

    try {
      await vendorService.delete(id);
      toast.success("Vendor deleted");
      tableQuery.refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete vendor");
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Vendors</h1>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vendors..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {canManagePrices && (
            <Button
              onClick={() => {
                setEditingVendor(null);
                setModalOpen(true);
              }}
            >
              Add Vendor
            </Button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-lg border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              {canManagePrices && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {tableQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            )}

            {!tableQuery.isLoading && vendors.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No data found
                </TableCell>
              </TableRow>
            )}

            {vendors.map((vendor: any) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">
                  {vendor.vendor_name}
                </TableCell>
                <TableCell>
                  {vendor.created_at
                    ? new Date(vendor.created_at).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {vendor.updated_at
                    ? new Date(vendor.updated_at).toLocaleDateString()
                    : "-"}
                </TableCell>
                {canManagePrices && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingVendor(vendor);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(vendor.id)}
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
            Showing {vendors.length} of {tableQuery.data?.totalItems ?? 0}
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

      {/* MODAL */}
      <VendorDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        vendor={editingVendor}
        onSuccess={() => tableQuery.refetch()}
      />
    </div>
  );
}
