import { useState, useEffect, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X, Package } from "lucide-react";

import { uomService } from "@/features/uom/uomService";
import type { Uom } from "@/features/uom/types";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  const loadUoms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await uomService.getAll({
        pageNumber: page,
        pageSize: pageSize,
      });
      setUoms(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err) {
      console.error("Failed to fetch UOMs:", err);
      toast.error("Failed to load Units of Measurement");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    loadUoms();
  }, [loadUoms]);

  const handleAddUOM = useCallback(async () => {
    if (!newUOM.trim()) {
      toast.error("Please enter a UOM description");
      return;
    }
    
    const t = toast.loading("Creating UOM...");
    try {
      await uomService.create({ description: newUOM.trim() });
      await loadUoms();
      setNewUOM("");
      toast.success("UOM created successfully", { id: t });
    } catch (err) {
      console.error("Failed to create UOM:", err);
      toast.error("Failed to create UOM", { id: t });
    }
  }, [newUOM, loadUoms]);

  const startEdit = useCallback((uom: Uom) => {
    setEditingId(uom.id);
    setEditValue(uom.description);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue("");
  }, []);

  const handleUpdateUOM = useCallback(async (id: number) => {
    if (!editValue.trim()) {
      toast.error("Please enter a UOM description");
      return;
    }
    
    const t = toast.loading("Updating UOM...");
    try {
      const updated = await uomService.update(id, { description: editValue.trim() });
      setUoms((prev) =>
        prev.map((u) => (u.id === id ? { ...u, description: updated.description } : u))
      );
      cancelEdit();
      toast.success("UOM updated successfully", { id: t });
    } catch (err) {
      console.error("Failed to update UOM:", err);
      toast.error("Failed to update UOM", { id: t });
    }
  }, [editValue, cancelEdit]);

  const handleDeleteUOM = useCallback(async (id: number) => {
    const t = toast.loading("Deleting UOM...");
    try {
      await uomService.delete(id);
      await loadUoms();
      toast.success("UOM deleted successfully", { id: t });
    } catch (err) {
      console.error("Failed to delete UOM:", err);
      toast.error("Failed to delete UOM", { id: t });
    }
  }, [loadUoms]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setPage(1);
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Unit of Measurement</h1>
        <Badge variant="secondary" className="text-sm">
          {totalItems} UOMs
        </Badge>
      </div>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New UOM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="uom-description">Description</Label>
              <Input
                id="uom-description"
                placeholder="UOM Description (e.g., kg, meters, pieces)"
                value={newUOM}
                onChange={(e) => setNewUOM(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUOM()}
              />
            </div>
            <Button 
              onClick={handleAddUOM}
              className="flex items-center gap-2"
              disabled={!newUOM.trim()}
            >
              <Plus className="h-4 w-4" />
              Add UOM
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* UOM Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            All Units of Measurement
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create, edit or delete Units of Measurement here.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: pageSize }, (_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : uoms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                <Package className="h-6 w-6" />
              </div>
              <p className="text-lg font-medium">No UOMs found</p>
              <p className="text-sm">Create your first Unit of Measurement to get started</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-32 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uoms.map((uom) => (
                    <TableRow key={uom.id}>
                      <TableCell className="font-mono text-sm">
                        <Badge variant="outline">{uom.id}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {editingId === uom.id ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="UOM Description"
                            className="max-w-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateUOM(uom.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            autoFocus
                          />
                        ) : (
                          uom.description || <span className="italic text-muted-foreground/70">No description</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {editingId === uom.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleUpdateUOM(uom.id)}
                                className="h-8 w-8 p-0"
                                disabled={!editValue.trim()}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEdit}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEdit(uom)}
                                className="h-8 w-8 p-0 hover:bg-muted"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete UOM</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{uom.description}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUOM(uom.id)}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && uoms.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => page > 1 && handlePageChange(page - 1)}
                      className={
                        page === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => page < totalPages && handlePageChange(page + 1)}
                      className={
                        page === totalPages
                          ? "opacity-50 pointer-events-none"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page:
                </span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}