import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { CreatePurchaseReportDialog } from "../components/createPurchaseReportDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { TableSkeletonPrInput } from "@/components/ui/skeletons/purchasereports/tableSkeletonPrInput";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth/authStore";

import { useCreatePurchaseReport } from "../hooks/useCreatePurchaseReport";
import { useTags } from "@/features/users/hooks/useTags";

import logo from "@/assets/images/logosidebar.png";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreatePurchaseReport() {
  const location = useLocation();
  const copyFromData = location.state?.copyFrom;
  const { editDraft, draftData } = location.state || {};
  const {
    rows,
    setRows,
    reportData,
    setReportData,
    items,
    setItems,
    handleChange,
    handleSubmit,
    loading,
    uoms,
  } = useCreatePurchaseReport({ editDraft, draftData });

  const { user } = useAuthStore();
  const { tags, loading: tagsLoading } = useTags();

  useEffect(() => {
    if (copyFromData) {
      console.log("📋 Copy mode - Original dates:", {
        date_submitted: copyFromData.date_submitted,
        date_needed: copyFromData.date_needed,
      });

      // Parse dates properly
      const dateSubmitted = copyFromData.date_submitted
        ? new Date(copyFromData.date_submitted + "T00:00:00")
        : undefined;

      const dateNeeded = copyFromData.date_needed
        ? new Date(copyFromData.date_needed + "T00:00:00")
        : undefined;

      console.log("📅 Converted dates:", {
        dateSubmitted,
        dateNeeded,
        isValidSubmitted:
          dateSubmitted instanceof Date && !isNaN(dateSubmitted.getTime()),
        isValidNeeded:
          dateNeeded instanceof Date && !isNaN(dateNeeded.getTime()),
      });

      setReportData({
        purpose: copyFromData.pr_purpose,
        department: user?.department?.[0] ?? copyFromData.department, // ✅ Get first element from array
        date_submitted: dateSubmitted,
        date_needed: dateNeeded,
        amount: copyFromData.quantity.length,
        series_no: copyFromData.series_no ?? "",
        user_id: user?.id ?? copyFromData.user.id,
      });

      const copiedItems = copyFromData.quantity.map(
        (_: any, index: number) => ({
          quantity: copyFromData.quantity[index]?.toString() || "",
          unit: copyFromData.unit[index] || "",
          description: copyFromData.item_description[index] || "",
          tag:
            typeof copyFromData.tag[index] === "object"
              ? copyFromData.tag[index]?.id?.toString() || ""
              : copyFromData.tag[index]?.toString() || "",
          remarks: copyFromData.remarks[index] || "",
        })
      );

      setItems(copiedItems);
      setRows(copiedItems.length);

      toast.info(`Copied to new request (Series #${copyFromData.series_no})`);
      window.history.replaceState({}, document.title);
    } else if (editDraft && draftData) {
      // --- EDIT DRAFT MODE ---
      const dateSubmitted = draftData.date_submitted
        ? new Date(draftData.date_submitted + "T00:00:00")
        : undefined;

      const dateNeeded = draftData.date_needed
        ? new Date(draftData.date_needed + "T00:00:00")
        : undefined;

      setReportData({
        user_id: user?.id ?? draftData.user.id,
        series_no: draftData.series_no,
        purpose: draftData.pr_purpose,
        department: user?.department?.[0] ?? draftData.department, // ✅ Get first element from array
        date_submitted: dateSubmitted,
        date_needed: dateNeeded,
        amount: draftData.quantity.length,
      });

      setItems(
        draftData.item_description.map((desc: string, i: number) => ({
          quantity: draftData.quantity[i]?.toString() || "",
          unit: draftData.unit[i] || "",
          description: desc || "",
          tag:
            typeof draftData.tag[i] === "object"
              ? draftData.tag[i].id?.toString() || ""
              : draftData.tag[i]?.toString() || "",
          remarks: draftData.remarks[i] || "",
        }))
      );

      setRows(draftData.item_description.length);
      toast.info(`Loaded draft: ${draftData.series_no}`);
      window.history.replaceState({}, document.title);
    }
  }, [
    copyFromData,
    editDraft,
    draftData,
    user,
    setReportData,
    setItems,
    setRows,
  ]);

  // ✅ add new blank row
  const addRow = () => {
    setItems((prev) => [
      ...prev,
      { quantity: "", unit: "", description: "", tag: "", remarks: "" },
    ]);
    setRows((r) => r + 1);
  };

  // ✅ remove a row by index
  const removeRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setRows((r) => (r > 0 ? r - 1 : 0));
  };

  return (
    <div className="p-6 -mt-4">
      <div className="flex flex-row justify-between items-center mb-6">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-3xl font-bold">
            {copyFromData ? "Copy Purchase Request" : "Create Purchase Request"}
          </h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/prs/purchase-reports">
                  Purchase Requests
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {copyFromData ? "Copy" : "Create"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex flex-row gap-2">
          <CreatePurchaseReportDialog
            onSubmit={(data) => {
              setRows(data.amount);
              setReportData(data);
              // ✅ initialize blank items for editing
              setItems(
                Array.from({ length: data.amount }, () => ({
                  quantity: "",
                  unit: "",
                  description: "",
                  tag: "",
                  remarks: "",
                }))
              );
            }}
          />
        </div>
      </div>

      {/* Card with table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col items-center mb-12">
            <div className="flex flex-col items-center mb-5">
              <img src={logo} className="h-32 -mb-12" />
              <p className="text-sm font-light mt-3">
                Upper Quinokol, Brgy. Darong, Sta. Cruz, Davao Del Sur.
              </p>
            </div>

            <p className="mt-3 text-lg text-center font-semibold mb-2">
              PURCHASE REQUISITION SLIP
            </p>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Form fields */}
          <div className="flex flex-row justify-between mb-4">
            <div className="flex flex-col gap-4 w-1/2">
              <div className="flex items-center gap-2">
                <Label htmlFor="purpose" className="text-sm text-right">
                  Purpose:
                </Label>
                <Input
                  id="purpose"
                  placeholder="Purpose"
                  value={reportData?.purpose ?? ""}
                  onChange={(e) =>
                    setReportData((prev: any) => ({
                      ...prev,
                      purpose: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="department" className="text-sm text-right">
                  Department:
                </Label>
                <Input
                  id="department"
                  placeholder="Department"
                  value={reportData?.department ?? ""}
                  disabled
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="-mt-12 flex items-center gap-2">
                <Label
                  htmlFor="series_no"
                  className="text-sm text-right whitespace-nowrap"
                >
                  Series No.:
                </Label>
                <Input
                  id="series_no"
                  placeholder="Series No."
                  value={reportData?.series_no ?? ""}
                  disabled
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="date" className="text-sm text-right">
                    Date:
                  </Label>
                  <Input
                    id="date"
                    placeholder="Date"
                    value={
                      reportData?.date_submitted instanceof Date &&
                      !isNaN(reportData.date_submitted.getTime())
                        ? reportData.date_submitted.toLocaleDateString()
                        : ""
                    }
                    disabled
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="date_needed"
                  className="text-sm text-right whitespace-nowrap"
                >
                  Date Needed:
                </Label>
                <Input
                  id="date_needed"
                  placeholder="Date Needed"
                  value={
                    reportData?.date_needed instanceof Date &&
                    !isNaN(reportData.date_needed.getTime())
                      ? reportData.date_needed.toLocaleDateString()
                      : ""
                  }
                  disabled
                />
              </div>
            </div>
          </div>

          {loading ? (
            <TableSkeletonPrInput rows={3} />
          ) : (
            <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
              <Table className="border-separate border-spacing-0 w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px]">Item</TableHead>
                    <TableHead className="w-[70px]">Quantity</TableHead>
                    <TableHead className="w-[70px]">Unit</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {items.length > 0 ? (
                    items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            className="w-[70px]"
                            value={item.quantity}
                            onChange={(e) =>
                              handleChange(i, "quantity", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-[120px] justify-between"
                              >
                                {item.unit
                                  ? uoms.find(
                                      (uom) => uom.description === item.unit
                                    )?.description
                                  : "Select unit..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[120px] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput placeholder="Search unit..." />
                                <CommandList>
                                  <CommandEmpty>No unit found.</CommandEmpty>
                                  <CommandGroup>
                                    {uoms.map((uom) => (
                                      <CommandItem
                                        key={uom.id}
                                        value={uom.description}
                                        onSelect={() => {
                                          handleChange(
                                            i,
                                            "unit",
                                            uom.description
                                          );
                                          // Popover closes automatically
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            item.unit === uom.description
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {uom.description}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </TableCell>

                        <TableCell>
                          <Input
                            placeholder="Enter description"
                            value={item.description}
                            onChange={(e) =>
                              handleChange(i, "description", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                                disabled={tagsLoading}
                              >
                                {item.tag
                                  ? tags.find(
                                      (tag) => String(tag.id) === item.tag
                                    )?.description
                                  : "Select tag..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-full p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput placeholder="Search tag..." />
                                <CommandList>
                                  <CommandEmpty>No tag found.</CommandEmpty>
                                  <CommandGroup>
                                    {tags.map((tag) => (
                                      <CommandItem
                                        key={tag.id}
                                        value={tag.description ?? ""}
                                        onSelect={() => {
                                          handleChange(
                                            i,
                                            "tag",
                                            String(tag.id)
                                          );
                                          // The popover will close automatically on select
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            item.tag === String(tag.id)
                                              ? "opacity-100"
                                              : "opacity-0"
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
                        <TableCell>
                          <Input
                            placeholder="Remarks"
                            value={item.remarks}
                            onChange={(e) =>
                              handleChange(i, "remarks", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeRow(i)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-gray-500"
                      >
                        No Purchase Requests.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {rows > 0 && (
                <div className="flex justify-between items-center my-6 mx-2">
                  <Button type="button" variant="outline" onClick={addRow}>
                    + Add Row
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      className="w-32 text-white"
                      onClick={() => handleSubmit(false)} // normal submit
                    >
                      Submit
                    </Button>

                    <Button
                      type="button"
                      className="w-32 bg-gray-900 hover:bg-gray-900 text-white"
                      onClick={() => handleSubmit(true)} // 👈 draft submit
                    >
                      Save as Draft
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
