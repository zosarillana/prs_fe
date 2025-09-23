import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { uomService } from "@/features/uom/uomService";
import type { Uom } from "@/features/uom/types";

// Import pagination UI components
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

export default function UomPage() {
  const [uoms, setUoms] = useState<Uom[]>([]);
  const [newUOM, setNewUOM] = useState("");
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch paged UOM data whenever page or pageSize changes
  const loadUoms = async () => {
    setLoading(true);
    try {
      const res = await uomService.getAll({
        pageNumber: page,
        pageSize: pageSize,
      });
      // Assuming res structure matches your JSON:
      // { pageNumber, pageSize, totalItems, totalPages, items: Uom[] }
      setUoms(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err) {
      console.error("Failed to fetch UOMs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUoms();
  }, [page, pageSize]);

  const handleAddUOM = async () => {
    if (!newUOM.trim()) return;
    try {
      const created = await uomService.create({ description: newUOM.trim() });
      // Option: after adding, you might want to reload or adjust pagination
      // For simplicity, fetch current page again
      await loadUoms();
      setNewUOM("");
    } catch (err) {
      console.error("Failed to create UOM:", err);
    }
  };

  const startEdit = (uom: Uom) => {
    setEditingId(uom.id);
    setEditValue(uom.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleUpdateUOM = async (id: number) => {
    if (!editValue.trim()) return;
    try {
      const updated = await uomService.update(id, { description: editValue.trim() });
      // Reload or optimistically update
      // Optimistic:
      setUoms((prev) =>
        prev.map((u) => (u.id === id ? { ...u, description: updated.description } : u))
      );
      cancelEdit();
    } catch (err) {
      console.error("Failed to update UOM:", err);
    }
  };

  const handleDeleteUOM = async (id: number) => {
    if (!confirm("Are you sure you want to delete this UOM?")) return;
    try {
      await uomService.delete(id);
      // After deletion, reload page. You might want to handle if the last item on page was deleted
      await loadUoms();
    } catch (err) {
      console.error("Failed to delete UOM:", err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col p-6 max-w-full gap-4">
        <h1 className="text-3xl font-bold mb-6">Unit Of Measurement</h1>

        <Card className="max-w-3xl rounded-2xl shadow">
          <CardHeader>
            <CardTitle>Manage UOM</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create, edit or delete Units of Measurement here.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3}>Loading...</TableCell>
                  </TableRow>
                ) : uoms.length ? (
                  uoms.map((uom) => (
                    <TableRow key={uom.id}>
                      <TableCell>{uom.id}</TableCell>
                      <TableCell>
                        {editingId === uom.id ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                          />
                        ) : (
                          uom.description
                        )}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        {editingId === uom.id ? (
                          <>
                            <Button size="sm" onClick={() => handleUpdateUOM(uom.id)}>
                              Save
                            </Button>
                            <Button size="sm" variant="secondary" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => startEdit(uom)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUOM(uom.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>No UOM found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder="UOM Description"
                value={newUOM}
                onChange={(e) => setNewUOM(e.target.value)}
              />
              <Button onClick={handleAddUOM}>Add new UOM</Button>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
              {/* Page Links */}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => page > 1 && setPage(page - 1)}
                      className={page === 1 ? "opacity-50 pointer-events-none" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === i + 1}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => page < totalPages && setPage(page + 1)}
                      className={page === totalPages ? "opacity-50 pointer-events-none" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              {/* Page size selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(val) => {
                    setPageSize(Number(val));
                    setPage(1); // reset to first when page size changes
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 30].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
