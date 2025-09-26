import { useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import {
  CheckCircle,
  Edit,
  Eye,
  FileDigit,
  Loader,
  MoreVertical,
  Plus,
  Search,
  Trash,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { TableSkeleton } from "@/components/ui/skeletons/purchasereports/tableSkeleton";
import { ViewPurchaseReportDialog } from "../components/viewPurchaseReportDialog";
import { usePurchaseReports } from "../hooks/usePurchaseReports";
import { SetPoDialog } from "../components/setPoDialog";
import { EditPurchaseReportDialog } from "../components/editPurchaseReportDialog";
import { DrApproveDialog } from "../components/drApproveDialog";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function PurchaseReport() {
  const [searchParams] = useSearchParams();
  const ownCreated = searchParams.get("ownCreated") === "true";
  const completedTr = searchParams.get("completedTr") === "true";
  const forCeoApproval = searchParams.get("forCeoApproval") === "true";
  const approvedPo = searchParams.get("approvedPo") === "true";
  // const completedHod = searchParams.get("completedHod") === "true";
  const statusFromUrl = searchParams.get("statusTerm") || "";
  const {
    user,
    data,
    loading,
    fetching,
    page,
    setPage,
    pageSize,
    setPageSize,
    open,
    setOpen,
    viewId,
    searchTerm,
    setSearchTerm,
    handleView,
    handleEdit,
    editOpen,
    setEditOpen,
    editId,
    handleDelete,
    refetch,
    handleSetPo,
    poDialogOpen,
    setPoDialogOpen,
    poTargetId,
    approvePoMutation,
    setApproveDialogOpen,
    setApproveTargetId,
    approveDialogOpen,
    approveTargetId,
    // ✅ Add these to your hook if not already there
    statusTerm,
    setStatusTerm,
    cancelPoMutation,
  } = usePurchaseReports();

  const statusMap: Record<string, string> = {
    for_approval: "For Purchase Order Creation",
    on_hold: "For Approval",
  };

  useEffect(() => {
    if (statusFromUrl && statusFromUrl !== statusTerm) {
      setStatusTerm(statusFromUrl);
    }
  }, [statusFromUrl, statusTerm, setStatusTerm]);

  let heading: string;

  if (statusTerm === "on_hold") {
    heading = "For HOD Approval"; // ✅ override
  } else if (statusTerm === "on_hold_tr") {
    heading = "For TR Approval"; // ✅ override
  } else if (completedTr === true) {
    heading = "Completed TR";
  } else if (statusTerm === "closed") {
    heading = "Closed Pr";
  } else if (statusTerm === "for_approval") {
    heading = "For PO Creation";
  } else if (forCeoApproval === true) {
    heading = "For CEO Approval";
  } else if (approvedPo === true) {
    heading = "Approved POs";
  } else if (user?.role?.includes("hod")) {
    heading = "Approve PRs";
  } else if (user?.role?.includes("technical_reviewer")) {
    heading = "Review Items";
  } else {
    heading = "Purchase Requests";
  }

  if (loading) {
    return (
      <div className="p-6 -mt-4">
        <h1 className="text-3xl font-bold mb-6">{heading}</h1>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="p-6 -mt-4">
      {/* header */}
      <div className="flex flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-6">{heading}</h1>

        <div className="flex flex-row gap-2 items-center">
          {/* ✅ Status Filter Dropdown */}
          <Select
            value={statusTerm || "all"}
            onValueChange={(value) =>
              setStatusTerm(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              {/* HOD can see all statuses */}
              {user?.role?.includes("hod") ? (
                <>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="on_hold_tr">For TR Approval</SelectItem>
                  <SelectItem value="on_hold">For HOD Approval</SelectItem>
                  <SelectItem value="for_approval">
                    For Purchase Order Creation
                  </SelectItem>
                </>
              ) : user?.role?.includes("tr") ? (
                <>
                  {/* TR sees only specific statuses */}
                  <SelectItem value="on_hold_tr">For TR Approval</SelectItem>
                  <SelectItem value="for_approval">
                    For Purchase Order Creation
                  </SelectItem>
                </>
              ) : user?.role?.includes("purchasing") ? (
                <>
                  {/* TR sees only specific statuses */}
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="for_approval">
                    For Purchase Order Creation
                  </SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </>
              ) : (
                <>
                  {/* Default options for other roles */}
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="on_hold">For HOD Approval</SelectItem>
                  <SelectItem value="on_hold_tr">For TR Approval</SelectItem>
                  <SelectItem value="for_approval">
                    For Purchase Order Creation
                  </SelectItem>

                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          {/* Search Box */}
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Create Button */}
          {!(
            user?.role?.includes("hod") ||
            user?.role?.includes("technical_reviewer") ||
            user?.role?.includes("purchasing")
          ) && (
            <Button asChild>
              <Link to="/purchase-reports/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Purchase Request
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
        <Table className="border-separate border-spacing-0 w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px] border-b">PR Number</TableHead>
              <TableHead className="w-[140px] border-b">PR Created</TableHead>
              <TableHead className="border-b">Purpose</TableHead>
              <TableHead className="border-b">Department</TableHead>
              <TableHead className="border-b">Submitted By</TableHead>
              <TableHead className="border-b">Status</TableHead>
              <TableHead className="border-b">PO Status</TableHead>
              <TableHead className="border-b">Date Needed</TableHead>
              <TableHead className="border-b"># of Days On Hold</TableHead>
              <TableHead className="w-[100px] border-b">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="cursor-pointer">
            {fetching && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Updating reports...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!fetching &&
              data?.items
                .filter((item) => {
                  // Own Created filter for normal users
                  if (user?.role?.includes("user") && ownCreated) {
                    return item.user.id === user.id;
                  }

                  // Completed TR filter for admin / technical_reviewer
                  if (completedTr) {
                    return (
                      item.tr_user_id != null // must have TR assigned
                    );
                  }
                  if (forCeoApproval) {
                    return item.po_status === "For_approval";
                  }
                  if (approvedPo) {
                    return item.po_status === "approved";
                  }

                  return true; // default show all
                })
                .map((item) => (
                  <TableRow key={item.id} onClick={() => handleView(item.id)}>
                    <TableCell className="font-medium">
                      {item.series_no}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.pr_created}
                    </TableCell>
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
                    <TableCell className="capitalize">
                      {item.user.name}
                    </TableCell>
                    <TableCell className="capitalize">
                      {item.pr_status === "on_hold"
                        ? "For HOD Approval"
                        : item.pr_status === "on_hold_tr"
                        ? "For TR Approval"
                        : statusMap[item.pr_status] || item.pr_status}
                    </TableCell>
                    <TableCell className="capitalize">
                      {item.po_status === "For_approval"
                        ? "For CEO Approval"
                        : item.po_status ?? "n/a"}
                    </TableCell>
                    <TableCell>{item.date_needed}</TableCell>
                    <TableCell>
                      {(() => {
                        const createdDate = new Date(item.pr_created);
                        const hodDate = item.hod_signed_at
                          ? new Date(item.hod_signed_at)
                          : null;
                        const trDate = item.tr_signed_at
                          ? new Date(item.tr_signed_at)
                          : null;

                        let latestDate: Date;
                        if (hodDate && trDate)
                          latestDate = hodDate > trDate ? hodDate : trDate;
                        else if (hodDate) latestDate = hodDate;
                        else if (trDate) latestDate = trDate;
                        else latestDate = new Date();

                        const diffDays = Math.floor(
                          (latestDate.getTime() - createdDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        return `${diffDays} days`;
                      })()}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="start"
                          className="w-34 animate-in fade-in-0 zoom-in-95"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(item.id);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>

                          {(user?.role?.includes("admin") ||
                            user?.role?.includes("maker")) && (
                            <>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(item.id);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item);
                                }}
                              >
                                <Trash className="mr-2 h-4 w-4 text-red-500" />
                                <span className="text-red-500">Delete</span>
                              </DropdownMenuItem>
                            </>
                          )}

                          {user?.role?.includes("purchasing") && (
                            <>
                              {item.pr_status === "for_approval" && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetPo(item.id);
                                  }}
                                >
                                  <FileDigit className="mr-2 h-4 w-4" /> Set PO
                                  Number
                                </DropdownMenuItem>
                              )}

                              {item.po_status === "For_approval" && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setApproveTargetId(item.id);
                                    setApproveDialogOpen(true);
                                  }}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" /> DR
                                  Approve
                                </DropdownMenuItem>
                              )}

                              {(item.pr_status === "for_approval" ||
                                item.po_status === "for_approval") && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast("Cancel PO?", {
                                      description: `Are you sure you want to cancel the PO for #${item.series_no}?`,
                                      action: {
                                        label: "Confirm",
                                        onClick: () =>
                                          cancelPoMutation(item.id),
                                      },
                                    });
                                  }}
                                >
                                  <X className="mr-2 h-4 w-4" /> Cancel PO
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {/* pagination footer */}
        <div className="flex items-center justify-end w-full border-t p-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && setPage(page - 1)}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: data?.totalPages ?? 0 }, (_, i) => (
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

          {/* page size selector */}
          <div className="flex items-center gap-2 w-[200px]">
            <span className="text-sm text-muted-foreground w-full">
              Rows per page:
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
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

      {/* dialogs */}
      <ViewPurchaseReportDialog
        open={open}
        onOpenChange={setOpen}
        prId={viewId}
        onSuccess={refetch}
      />
      <EditPurchaseReportDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        prId={editId}
      />
      <SetPoDialog
        open={poDialogOpen}
        onOpenChange={setPoDialogOpen}
        reportId={poTargetId}
        onSuccess={refetch}
      />
      <DrApproveDialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        onConfirm={({ date, status }) => {
          if (approveTargetId !== null) {
            approvePoMutation.mutate({ id: approveTargetId, date, status });
          }
        }}
      />
    </div>
  );
}
