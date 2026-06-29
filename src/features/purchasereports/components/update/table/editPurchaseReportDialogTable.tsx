"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import {
  Edit,
  MoreVertical,
  Trash2Icon,
  CheckCircle,
  X,
  ArrowDownRight,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { PurchaseReport } from "@/features/purchasereports/types";
import { Tag } from "@/features/tags/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  items: PurchaseReport;
  uoms: { id: number; description: string }[];
  tags: Tag[];
  user: any;
  report?: any;
  bulkAction: (action: "approve" | "remove", indices: number[]) => void;
  onChange: (
    index: number,
    field: "quantity" | "unit" | "item_description" | "remarks" | "tag",
    value: string,
  ) => void;
  onApproveEdit: (index: number) => void;
  onRemoveRow: (index: number) => void;
}

export function EditPurchaseReportDialogTable({
  items,
  uoms,
  tags,
  onChange,
  onApproveEdit,
  onRemoveRow,
  user,
  report,
  bulkAction,
}: Props) {
  const [selectedItems, setSelectedItems] = React.useState<number[]>([]);

  React.useEffect(() => {
    setSelectedItems([]);
  }, [items]);

  const isSelectableStatus = (status?: string) =>
    status === "return" || status === "returned";

  const selectableIndices = useMemo(() => {
    return (
      items.item_status
        ?.map((status, idx) => (isSelectableStatus(status) ? idx : null))
        .filter((idx): idx is number => idx !== null) ?? []
    );
  }, [items.item_status]);

  const totalSelectable = selectableIndices.length;

  const allSelected =
    totalSelectable > 0 &&
    selectableIndices.every((i) => selectedItems.includes(i));

  const isIndeterminate = selectedItems.length > 0 && !allSelected;

  const toggleAll = (checked: boolean) => {
    setSelectedItems(checked ? selectableIndices : []);
  };

  const toggleItem = (idx: number, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, idx] : prev.filter((i) => i !== idx),
    );
  };

  const uniqueTags = useMemo(() => {
    const seen = new Set<number>();
    return tags.filter((tag) => {
      if (seen.has(tag.id)) return false;
      seen.add(tag.id);
      return true;
    });
  }, [tags]);

  return (
    <Table className="border-separate border-spacing-0 w-full [&_td]:p-3 [&_th]:p-3">
      <TableHeader>
        <TableRow>
          <TableHead className="border-b w-12 print:hidden">
            <div className="flex items-center justify-start">
              <Checkbox
                checked={
                  allSelected ? true : isIndeterminate ? "indeterminate" : false
                }
                onCheckedChange={(checked) => toggleAll(checked === true)}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded hover:bg-muted transition p-1"
                  >
                    <ArrowDownRight className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem
                    onClick={() => bulkAction("approve", selectedItems)}
                    disabled={selectedItems.length === 0}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Selected
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => bulkAction("remove", selectedItems)}
                    disabled={selectedItems.length === 0}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TableHead>

          <TableHead className="w-5 border-b text-center">#</TableHead>
          <TableHead className="w-24 border-b text-center">Qty</TableHead>
          <TableHead className="w-32 border-b">Unit</TableHead>
          <TableHead className="w-64 border-b">Description</TableHead>
          <TableHead className="w-40 border-b">Tag</TableHead>
          <TableHead className="w-28 border-b text-center">Status</TableHead>
          <TableHead className="w-48 border-b">Remarks</TableHead>
          <TableHead className="w-20 border-b text-center">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.item_description?.map((_, idx) => {
          const status = items.item_status?.[idx] ?? "pending";
          const isPrivilegedRole =
            user?.role?.includes("admin") || user?.role?.includes("hod");
          const isReturned =
            ["return", "returned"].includes(status) || isPrivilegedRole;
          const isRejected = status === "rejected" || status === "rejected_tr";
          const canEditRow = isReturned || isRejected;

          const currentTag = items.tag?.[idx];
          const tagId =
            typeof currentTag === "object"
              ? String(currentTag.id)
              : String(currentTag ?? "");

          return (
            <TableRow key={idx}>
              <TableCell className="text-start">
                <Checkbox
                  checked={selectedItems.includes(idx)}
                  disabled={!canEditRow}
                  onCheckedChange={(checked) => {
                    if (!canEditRow) return;
                    toggleItem(idx, checked === true);
                  }}
                />
              </TableCell>

              <TableCell className="text-center">{idx + 1}</TableCell>

              <TableCell>
                {isReturned ? (
                  <Input
                    type="number"
                    min={1}
                    value={items.quantity?.[idx] ?? ""}
                    onChange={(e) => onChange(idx, "quantity", e.target.value)}
                  />
                ) : (
                  items.quantity?.[idx]
                )}
              </TableCell>

              <TableCell>
                {isReturned ? (
                  <Select
                    value={items.unit?.[idx] ?? ""}
                    onValueChange={(val) => onChange(idx, "unit", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {uoms.map((uom) => (
                        <SelectItem key={uom.id} value={uom.description}>
                          {uom.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  items.unit?.[idx]
                )}
              </TableCell>

              <TableCell>
                {isReturned ? (
                  <Input
                    value={items.item_description?.[idx] ?? ""}
                    onChange={(e) =>
                      onChange(idx, "item_description", e.target.value)
                    }
                  />
                ) : (
                  items.item_description?.[idx]
                )}
              </TableCell>

              <TableCell>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {currentTag?.description ?? "Select tag..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search tag..." />
                      <CommandList>
                        <CommandEmpty>No tag found.</CommandEmpty>
                        <CommandGroup>
                          {tags.map((tag) => (
                            <CommandItem
                              key={tag.id}
                              value={tag.description ?? ""}
                              onSelect={() =>
                                onChange(idx, "tag", String(tag.id))
                              }
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  String(currentTag?.id) === String(tag.id)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {tag.description}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </TableCell>

              <TableCell className="text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs capitalize ${
                    status === "approved" || status === "approved_tr"
                      ? "bg-green-100 text-green-800"
                      : isRejected
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {status}
                </span>
              </TableCell>

              {/* <TableCell>{items.remarks?.[idx] ?? "none"}</TableCell> */}
              <TableCell>
                {" "}
                {isReturned ? (
                  <Input
                    value={items.remarks?.[idx] ?? ""}
                    onChange={(e) => onChange(idx, "remarks", e.target.value)}
                  />
                ) : (
                  items.remarks?.[idx]
                )}
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <DropdownMenuItem
                          disabled={!canEditRow}
                          onSelect={(e) => {
                            e.preventDefault();
                            if (canEditRow) onApproveEdit(idx);
                          }}
                          className={`${
                            canEditRow
                              ? "cursor-pointer hover:bg-muted"
                              : "opacity-50 cursor-not-allowed pointer-events-none"
                          }`}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Approve Edit
                        </DropdownMenuItem>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-64 text-sm">
                        Approve this item's changes and move it back to pending
                        status.
                      </HoverCardContent>
                    </HoverCard>

                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        if (canEditRow) onRemoveRow(idx);
                      }}
                      className={`text-red-600 ${
                        canEditRow
                          ? "hover:text-red-800 cursor-pointer"
                          : "opacity-50 cursor-not-allowed pointer-events-none"
                      }`}
                    >
                      <Trash2Icon className="mr-2 h-4 w-4" />
                      Remove Row
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}