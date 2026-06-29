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
import { useGetItemsHook } from "../hooks/useGetItem";
import { ItemDialog } from "../components/itemDialog";
import { toast } from "sonner";
import { itemService } from "../itemService";
import { useAuthStore } from "@/store/auth/authStore";

export default function Items() {
  const {
    tableQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
  } = useGetItemsHook();

  const items = tableQuery.data?.items ?? [];
  const totalPages = tableQuery.data?.totalPages ?? 1;
  const user = useAuthStore((state) => state.user);
  const canManagePrices =
    user?.role?.includes("admin") || user?.role?.includes("purchasing");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

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
      "Are you sure you want to delete this item?"
    );

    if (!confirmed) return;

    try {
      await itemService.delete(id);
      toast.success("Item deleted");
      tableQuery.refetch();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete item");
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Items</h1>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items..."
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
                setEditingItem(null);
                setModalOpen(true);
              }}
            >
              Add Item
            </Button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-lg border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
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

            {!tableQuery.isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No data found
                </TableCell>
              </TableRow>
            )}

            {items.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.item_name}</TableCell>
                <TableCell>
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {item.updated_at
                    ? new Date(item.updated_at).toLocaleDateString()
                    : "-"}
                </TableCell>
                {canManagePrices && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingItem(item);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
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
      <ItemDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        item={editingItem}
        onSuccess={() => tableQuery.refetch()}
      />
    </div>
  );
}
