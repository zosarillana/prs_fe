import React from "react";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { CreatePurchaseReportDialog } from "../components/createPurchaseReportDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@radix-ui/react-label";
import { TableSkeletonPrInput } from "@/components/ui/skeletons/purchasereports/tableSkeletonPrInput";
import { Button } from "@/components/ui/button";

import { useCreatePurchaseReport } from "../hooks/useCreatePurchaseReport";

export default function CreatePurchaseReport() {
  const {
    rows,
    setRows,
    reportData,
    setReportData,
    items,
    handleChange,
    handleSubmit,
    loading,
  } = useCreatePurchaseReport();

  return (
    <div className="p-6 -mt-4">
      <div className="flex flex-row justify-between items-center mb-6">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-3xl font-bold"> Create Purchase Request</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/purchase-reports">Purchase Requests</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex flex-row gap-2">
          <CreatePurchaseReportDialog
            onSubmit={(data) => {
              setRows(data.amount);
              setReportData(data);
            }}
          />
        </div>
      </div>

      {/* Card with table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col items-center mb-12">
            <div className="flex flex-col items-center">
              <p className="text-4xl font-semibold tracking-widest">AGRI EXIM</p>
              <p className="text-lg font-semibold tracking-wider">GLOBAL PHILIPPINES, INC.</p>
              <p className="text-md font-light tracking-wide">Upper Quinokol, Brgy. Darong, Sta. Cruz, Davao Del Sur.</p>
            </div>
            <p className="mt-5 text-lg font-semibold tracking-wider italic mb-2">PURCHASE REQUISITION SLIP</p>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Form fields */}
          <div className="flex flex-row justify-between mb-4">
            <div className="flex flex-col gap-4 w-1/2">
              <div className="flex items-center gap-2">
                <Label htmlFor="purpose" className="text-sm text-right">Purpose:</Label>
                <Input id="purpose" placeholder="Purpose" value={reportData?.purpose ?? ""} disabled />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="department" className="text-sm text-right">Department:</Label>
                <Input id="department" placeholder="Department" value={reportData?.department ?? ""} disabled />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="-mt-12 flex items-center gap-2">
                <Label htmlFor="series_no" className="text-sm text-right whitespace-nowrap">Series No.:</Label>
                <Input id="series_no" placeholder="Series Number" value={reportData?.series_no ?? ""} disabled />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="date" className="text-sm text-right">Date:</Label>
                <Input id="date" placeholder="Date" value={reportData?.date_submitted?.toLocaleDateString() ?? ""} disabled />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="date_needed" className="text-sm text-right whitespace-nowrap">Date Needed:</Label>
                <Input id="date_needed" placeholder="Date Needed" value={reportData?.date_needed?.toLocaleDateString() ?? ""} disabled />
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
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {items.length > 0 ? (
                    items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>
                          <Input type="number" min={1} className="w-[70px]" value={item.quantity} onChange={(e) => handleChange(i, "quantity", e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Select onValueChange={(value) => handleChange(i, "unit", value)}>
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
                          <Input placeholder="Enter description" value={item.description} onChange={(e) => handleChange(i, "description", e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Select onValueChange={(value) => handleChange(i, "tag", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Tag" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="it_department_tr">Information Technology Items</SelectItem>
                              <SelectItem value="eng_department_tr">Engineering Items</SelectItem>
                              <SelectItem value="project_department_tr">Project Related Items</SelectItem>
                              <SelectItem value="office_items">Office Items/Supplies</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input disabled placeholder="Enter Remarks" value={item.remarks} onChange={(e) => handleChange(i, "remarks", e.target.value)} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">No Purchase Requests.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {rows > 0 && (
                <div className="flex justify-end mt-6">
                  <Button type="button" onClick={handleSubmit}>Submit</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
