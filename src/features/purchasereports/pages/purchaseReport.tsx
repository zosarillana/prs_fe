import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginatedResponse } from "@/types/paginator";
import { purchaseReportService } from "../purchaseReportService";
import type { PurchaseReport } from "../types";
import { TableSkeleton } from "@/components/ui/tableSkeleton";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MoreVertical,
  PencilLine,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export default function PurchaseReport() {
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

  if (loading) {
    return (
      <div className="p-6 -mt-4">
        <h1 className="text-3xl font-bold mb-6">Purchase Reports</h1>
        <TableSkeleton rows={5} /> {/* ✅ applied here */}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return <div className="p-6">No reports found.</div>;
  }

  return (
    <div className="p-6 -mt-4">
      <div className="flex flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Purchase Reports</h1>
        </div>
        <div className="flex flex-row gap-2">
          <div className="relative">
            <Button asChild>
              <Link to="/purchase-reports/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Purchase Report
              </Link>
            </Button>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search reports..."
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
        <Table className="border-separate border-spacing-0 w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px] border-b">
                Series Number
              </TableHead>
              <TableHead className="border-b">Purpose</TableHead>
              <TableHead className="border-b">Department</TableHead>
              <TableHead className="border-b">Submitted By</TableHead>
              <TableHead className="border-b">Date Needed</TableHead>
              <TableHead className="w-[100px] border-b">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="cursor-pointer">
            {data.items.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{item.series_no}</TableCell>
                <TableCell>{item.pr_purpose}</TableCell>
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
                <TableCell className="capitalize">{item.user.name}</TableCell>
                <TableCell>{item.date_needed}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full focus:outline-none focus:ring-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="start"
                      className="w-34 animate-in fade-in-0 zoom-in-95 "
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      <DropdownMenuItem className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                {/* <TableCell>{item.date_created}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
