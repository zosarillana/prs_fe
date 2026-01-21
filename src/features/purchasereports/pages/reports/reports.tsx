import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
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
import { Search, Hash, Loader, Printer, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/skeletons/purchasereports/tableSkeleton";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import logo from "@/assets/images/logo.png";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// 🆕 Import your new hook here
import { useReportGetHook } from "../../hooks/useReportGetHook";
import { purchaseReportService } from "../../purchaseReportService";
import { Progress } from "@/components/ui/progress";

export default function Reports() {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // 🧩 Use your new custom data-fetching hook
  const {
    data,
    loading,
    fetching,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    refetch,
    handleClearFilters,
  } = useReportGetHook();

  /** Helper: Compute difference in days between two dates */
  const diffDays = (start: Date | null, end: Date | null): string => {
    if (!start) return "N/A";
    if (!end) return "N/A";

    const diff = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff < 0) return "Invalid date sequence";
    if (diff === 0) return "Within the day";
    return `${diff} day${diff !== 1 ? "s" : ""}`;
  };

  /** Helper: Find the latest of two approval dates */
  const latestApprovalDate = (
    hod: Date | null,
    tr: Date | null
  ): Date | null => {
    if (hod && tr) return hod > tr ? hod : tr;
    return hod || tr || null;
  };

  /** Generate PDF with proper table pagination */
  /** Generate PDF with ALL data (not just current page) */
  const handlePrint = async () => {
    try {
      setIsGeneratingPDF(true);

      // 🔥 Fetch ALL data for printing with current filters applied
      // If filtered result is 8 items, we fetch all 8
      // If no filter and total is 16, we fetch all 16
      const allDataParams = {
        pageNumber: 1,
        pageSize: data?.totalItems ?? 999999, // ✅ Use actual total from current query
        searchTerm: searchTerm,
        fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
        toDate: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
        // Include any other active filters from your hook
      };

      // Call the appropriate service method based on user role
      const allData = await purchaseReportService.getTableReports(
        allDataParams
      );

      if (!allData?.items || allData.items.length === 0) {
        toast.error("No data to print");
        return;
      }

      const pdf = new jsPDF("l", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      // 🎯 Use ALL items from the fetched data
      const tableData = allData.items.map((item) => {
        const prCreated = item.pr_created ? new Date(item.pr_created) : null;
        const hodApproved = item.hod_signed_at
          ? new Date(item.hod_signed_at)
          : null;
        const trApproved = item.tr_signed_at
          ? new Date(item.tr_signed_at)
          : null;
        const poCreated = item.po_created_date
          ? new Date(item.po_created_date)
          : null;
        const poApproved = item.po_approved_date
          ? new Date(item.po_approved_date)
          : null;
        const latestApproval = latestApprovalDate(hodApproved, trApproved);

        return [
          item.series_no ?? "N/A",
          item.pr_created ?? "N/A",
          item.po_no ?? "N/A",
          item.po_created_date ?? "N/A",
          item.pr_purpose ?? "N/A",
          item.department ?? "N/A",
          item.user?.name ?? "N/A",
          diffDays(prCreated, hodApproved),
          diffDays(hodApproved, trApproved),
          diffDays(latestApproval, poCreated),
          diffDays(poCreated, poApproved),
          diffDays(prCreated, poApproved),
          item.purchaser_id?.name ?? "N/A",
        ];
      });

      autoTable(pdf, {
        head: [
          [
            "PR Number",
            "PR Created",
            "PO Number",
            "PO Created",
            "Purpose",
            "Department",
            "Submitted By",
            "HOD Approval (Days)",
            "TR Approval (Days)",
            "PO Creation (Days)",
            "PO Approval (Days)",
            "ToT",
            "Purchasing Associate",
          ],
        ],
        body: tableData,
        theme: "grid",
        margin: { top: 40, left: margin, right: margin, bottom: 15 },
        styles: {
          fontSize: 7.5,
          cellPadding: 3,
          overflow: "linebreak",
          valign: "middle",
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [248, 250, 252],
          textColor: [71, 85, 105],
          fontStyle: "bold",
          halign: "left",
          fontSize: 8,
          cellPadding: 3,
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
          0: { cellWidth: 18, fontStyle: "bold" },
          1: { cellWidth: 20 },
          2: { cellWidth: 22 },
          3: { cellWidth: 20 },
          4: { cellWidth: 30 },
          5: { cellWidth: 25 },
          6: { cellWidth: 25 },
          7: { cellWidth: 18 },
          8: { cellWidth: 18 },
          9: { cellWidth: 18 },
          10: { cellWidth: 18 },
          11: { cellWidth: 18 },
          12: { cellWidth: 25 },
        },
        didDrawPage: (data) => {
          const totalPages = (pdf.internal as any).getNumberOfPages();
          const currentPage = (pdf.internal as any).getCurrentPageInfo()
            .pageNumber;

          const logoHeight = 15;
          const logoWidth = 40;
          pdf.addImage(logo, "PNG", margin, margin, logoWidth, logoHeight);

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(16);
          pdf.text(
            "PR to PO Conversion Reports",
            margin + logoWidth + 5,
            margin + logoHeight / 2,
            { baseline: "middle" }
          );

          // 🎯 Show total items being printed in "X/X" format
          const totalItems = allData.totalItems ?? allData.items.length;

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.text(
            `Total Records: ${totalItems}/${totalItems} | PDF Page ${currentPage}/${totalPages} | ${new Date().toLocaleDateString()}`,
            pageWidth - margin,
            margin + logoHeight / 2,
            { align: "right", baseline: "middle" }
          );

          const headerBottom = margin + logoHeight + 5;
          pdf.setLineWidth(0.5);
          pdf.line(margin, headerBottom, pageWidth - margin, headerBottom);

          const footerY = pageHeight - 10;
          pdf.setFontSize(8);
          pdf.setTextColor(100);
          pdf.text(
            `Page ${currentPage} of ${totalPages}`,
            pageWidth - margin,
            footerY,
            { align: "right" }
          );
        },
      });

      pdf.save(
        `Purchase-Reports-All-${new Date().toISOString().split("T")[0]}.pdf`
      );
      toast.success(`PDF with ${allData.items.length} records downloaded!`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 -mt-4">
        <h1 className="text-3xl font-bold mb-6">Reports</h1>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="p-6 -mt-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-6">Reports</h1>

        <div className="flex items-center gap-3">
          {/* From Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="justify-start w-[150px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "MMM d, yyyy") : "From date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate || undefined}
                onSelect={(date) => setFromDate(date ?? null)}
              />
            </PopoverContent>
          </Popover>

          {/* To Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="justify-start w-[150px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "MMM d, yyyy") : "To date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate || undefined}
                onSelect={(date) => setToDate(date ?? null)}
              />
            </PopoverContent>
          </Popover>

          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="ml-2"
          >
            Apply
          </Button>
          <Button
            onClick={() => handleClearFilters()}
            variant="outline"
            size="sm"
            className="ml-2"
          >
            Clear Filters
          </Button>

          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // ✅ Add this line to reset to page 1 when searching
              }}
            />
          </div>

          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            disabled={isGeneratingPDF}
          >
            <Printer className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? "Generating PDF..." : "Print PDF"}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div ref={printRef} className="overflow-hidden rounded-lg border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PR Number</TableHead>
              <TableHead>PR Created</TableHead>
              <TableHead>PO Number</TableHead>
              <TableHead>PO Created</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>HOD Approval (Days)</TableHead>
              <TableHead>TR Approval (Days)</TableHead>
              <TableHead>PO Creation (Days)</TableHead>
              <TableHead>PO Approval (Days)</TableHead>
              <TableHead>ToT (PR → PO Approval)</TableHead>
              <TableHead>Purchasing Associate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetching && (
              <TableRow>
                <TableCell colSpan={13} className="py-0 px-0">
                  <div className="w-full">
                    <Progress indeterminate className="w-full" />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {data?.items?.map((item) => {
              const prCreated = item.pr_created
                ? new Date(item.pr_created)
                : null;
              const hodApproved = item.hod_signed_at
                ? new Date(item.hod_signed_at)
                : null;
              const trApproved = item.tr_signed_at
                ? new Date(item.tr_signed_at)
                : null;
              const poCreated = item.po_created_date
                ? new Date(item.po_created_date)
                : null;
              const poApproved = item.po_approved_date
                ? new Date(item.po_approved_date)
                : null;
              const latestApproval = latestApprovalDate(
                hodApproved,
                trApproved
              );

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      {item.series_no ?? "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>{item.pr_created ?? "N/A"}</TableCell>
                  <TableCell>{item.po_no ?? "N/A"}</TableCell>
                  <TableCell>{item.po_created_date ?? "N/A"}</TableCell>
                  <TableCell>{item.pr_purpose ?? "N/A"}</TableCell>
                  <TableCell>
                    {item.department
                      .split("_")
                      .map((word) =>
                        word.toLowerCase() === "it"
                          ? "IT"
                          : word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </TableCell>
                  <TableCell>{item.user?.name ?? "N/A"}</TableCell>
                  <TableCell>{diffDays(prCreated, hodApproved)}</TableCell>
                  <TableCell>{diffDays(hodApproved, trApproved)}</TableCell>
                  <TableCell>{diffDays(latestApproval, poCreated)}</TableCell>
                  <TableCell>{diffDays(poCreated, poApproved)}</TableCell>
                  <TableCell>
                    {poCreated ? diffDays(prCreated, poApproved) : "N/A"}
                  </TableCell>
                  <TableCell>{item.purchaser_id?.name ?? "N/A"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {/* Pagination */}
        <div className="flex items-center justify-between w-full border-t p-4">
          {/* Left side: Showing X of Y */}
          <div className="text-sm text-muted-foreground">
            Showing {data?.items?.length ?? 0} of {data?.totalItems ?? 0}
          </div>

          {/* Right side: Pagination and page size */}
          <div className="flex items-center gap-6">
            <Pagination>
              <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => page > 1 && setPage(page - 1)}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {/* Dynamic Pagination with Ellipsis */}
                {(() => {
                  const total = data?.totalPages ?? 0;
                  const visiblePages: (number | string)[] = [];

                  if (total <= 7) {
                    // If few pages, show all
                    for (let i = 1; i <= total; i++) visiblePages.push(i);
                  } else {
                    const firstPage = 1;
                    const lastPage = total;
                    const startRange = Math.max(2, page - 1);
                    const endRange = Math.min(total - 1, page + 1);

                    visiblePages.push(firstPage);

                    if (startRange > 2) visiblePages.push("...");

                    for (let i = startRange; i <= endRange; i++)
                      visiblePages.push(i);

                    if (endRange < total - 1) visiblePages.push("...");

                    visiblePages.push(lastPage);
                  }

                  return visiblePages.map((p, i) =>
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
                      <PaginationItem key={i}>
                        <span className="px-2 text-muted-foreground">...</span>
                      </PaginationItem>
                    )
                  );
                })()}

                {/* Next Button */}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      data && page < data.totalPages && setPage(page + 1)
                    }
                    className={
                      data && page === data.totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            {/* Page size selector */}
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
                  {[5, 10, 20, 30, 50].map((size) => (
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
    </div>
  );
}
