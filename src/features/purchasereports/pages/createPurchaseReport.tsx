import React, { useEffect, useState } from "react";
import { PaginatedResponse } from "@/types/paginator";
import { purchaseReportService } from "../purchaseReportService";
import type { PurchaseReport } from "../types";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

import { IssuePurchaseReportDialog } from "../components/createPurchaseReportDialog";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-label";
import { TableSkeleton } from "@/components/ui/tableSkeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CreatePurchaseReport() {
  const [rows, setRows] = useState<number>(0);
  const [reportData, setReportData] = useState<{
    series_no: string;
    purpose: string;
    department: string;
    date_submitted?: Date;
    date_needed?: Date;
    amount: number;
  } | null>(null);

  const [items, setItems] = useState<
    {
      quantity: string;
      unit: string;
      description: string;
      tag: string;
      remarks: string;
    }[]
  >([]);

  const [data, setData] = useState<PaginatedResponse<PurchaseReport> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await purchaseReportService.getTable({
          pageNumber: 1,
          pageSize: 10,
        });
        setData(res);
      } catch (error) {
        console.error("Failed to fetch purchase reports", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // 🔹 Sync items array when rows change
  useEffect(() => {
    setItems(
      Array.from({ length: rows }, () => ({
        quantity: "",
        unit: "",
        description: "",
        tag: "",
        remarks: "",
      }))
    );
  }, [rows]);

  const handleChange = (index: number, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async () => {
  if (!reportData) return;

  const payload = {
    user_id: 1, // later: use real user id from auth store
    series_no: reportData.series_no,
    pr_purpose: reportData.purpose,
    department: reportData.department,
    date_submitted: reportData.date_submitted?.toISOString().split("T")[0],
    date_needed: reportData.date_needed?.toISOString().split("T")[0],
    quantity: items.map((item) => Number(item.quantity) || 0),
    unit: items.map((item) => item.unit),
    item_description: items.map((item) => item.description),
    tag: items.map((item) => item.tag),
    remarks: items.map((item) => item.remarks),
  };

  try {
    console.log("🚀 Sending Payload:", payload);
    await purchaseReportService.create(payload);

    toast.success("Purchase report submitted successfully!", {
      style: { background: "white", color: "black" }, // ✅ black text
    });

    // optional: reset form after submit
    setItems([]);
    setRows(0);
    setReportData(null);
  } catch (error) {
    console.error("❌ Failed to submit purchase report:", error);
    toast.error("Failed to submit purchase report. Please try again.", {
      style: { background: "white", color: "black" },
    });
  }
};

  return (
    <div className="p-6 -mt-4">
      <div className="flex flex-row justify-between items-center mb-6">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-3xl font-bold">Create Purchase Report</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/purchase-reports">
                  Purchase Reports
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex flex-row gap-2">
          <IssuePurchaseReportDialog
            onSubmit={(data) => {
              setRows(data.amount);
              setReportData(data);
              console.log("Purchase Report Data:", data);
            }}
          />
        </div>
      </div>

      {/* ✅ Card with table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col items-center mb-12">
            <div className="flex flex-col items-center">
              <p className="text-4xl font-semibold tracking-widest">
                AGRI EXIM
              </p>
              <p className="text-lg font-semibold tracking-wider">
                GLOBAL PHILIPPINES, INC.
              </p>
              <p className="text-md font-light tracking-wide">
                Upper Quinokol, Brgy. Darong, Sta. Cruz, Davao Del Sur.
              </p>
            </div>
            <p className="mt-5 text-lg font-semibold tracking-wider italic mb-2">
              PURCHASE REQUISITION SLIP
            </p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row justify-between  mb-4">
            <div className="flex flex-col gap-4 w-1/2">
              <div className="flex items-center gap-2 ">
                <Label htmlFor="purpose" className="text-sm text-right">
                  Purpose:
                </Label>
                <Input
                  id="purpose"
                  placeholder="Purpose"
                  value={reportData?.purpose ?? ""}
                  disabled
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
            <div className="flex flex-col gap-4 ">
              <div className="-mt-12 flex items-center gap-2">
                <Label
                  htmlFor="series_no"
                  className="text-sm text-right whitespace-nowrap"
                >
                  Series No.:
                </Label>
                <Input
                  id="series_no"
                  placeholder="Series Number"
                  value={reportData?.series_no ?? ""} // ✅ bind value
                  disabled
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="date" className="text-sm text-right">
                  Date:
                </Label>
                <Input
                  id="date"
                  placeholder="Date"
                  value={reportData?.date_submitted?.toLocaleDateString() ?? ""}
                  disabled
                />
              </div>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="date_needed"
                  className=" text-sm text-right whitespace-nowrap"
                >
                  Date Needed:
                </Label>
                <Input
                  id="date_needed"
                  placeholder="Date Needed"
                  value={reportData?.date_needed?.toLocaleDateString() ?? ""}
                  disabled
                />
              </div>
            </div>
          </div>

          {loading ? (
            <TableSkeleton rows={3} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px]">Item</TableHead>
                    <TableHead className="w-[70px]">Quantity</TableHead>
                    <TableHead className="w-[70px]">Unit</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Remarks</TableHead>
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
                            placeholder="0"
                            className="w-[70px]"
                            value={item.quantity}
                            onChange={(e) =>
                              handleChange(i, "quantity", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(value) =>
                              handleChange(i, "unit", value)
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">Kg</SelectItem>
                              <SelectItem value="pcs">Pcs</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <Select
                            onValueChange={(value) =>
                              handleChange(i, "tag", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Tag" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="it_department">
                                IT Department
                              </SelectItem>
                              <SelectItem value="hr_department">
                                HR Department
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Enter Remarks"
                            value={item.remarks}
                            onChange={(e) =>
                              handleChange(i, "remarks", e.target.value)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-gray-500"
                      >
                        No purchase reports.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {rows > 0 && (
                <div className="flex justify-end mt-6">
                  <Button type="button" onClick={handleSubmit}>
                    Submit
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
