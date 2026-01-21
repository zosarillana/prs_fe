import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { CreatePurchaseReportDialog } from "../../components/create/createPurchaseReportDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { TableSkeletonPrInput } from "@/components/ui/skeletons/purchasereports/tableSkeletonPrInput";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth/authStore";

import { useCreatePurchaseReport } from "../../hooks/useCreatePurchaseReport";
import { useTags } from "@/features/users/hooks/useTags";

import logo from "@/assets/images/logosidebar.png";

import { CreatePurchaseRequestTable } from "./tables/createPurchaseReportTable";
import { initializeReportData, addBlankRow, removeRowByIndex } from "../createpurchasereport/utils/createPurchaseReport";

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
    initializeReportData({
      copyFromData,
      editDraft,
      draftData,
      user,
      setReportData,
      setItems,
      setRows,
    });
  }, [copyFromData, editDraft, draftData, user, setReportData, setItems, setRows]);

  // Use helper for adding/removing rows
  const addRow = () => addBlankRow(setItems, setRows);
  const removeRow = (index: number) => removeRowByIndex(index, setItems, setRows);
  
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
              <CreatePurchaseRequestTable
                items={items}
                uoms={uoms.map((uom) => ({ ...uom, id: uom.id.toString() }))}
                tags={tags.map((tag) => ({
                  id: tag.id.toString(),
                  description: tag.description ?? "", // ✅ fallback to empty string
                }))}
                tagsLoading={tagsLoading}
                handleChange={handleChange}
                removeRow={removeRow}
              />

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
