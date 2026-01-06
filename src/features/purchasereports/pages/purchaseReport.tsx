import { useEffect, useState } from "react";
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
  ArrowLeftCircle,
  BadgeCheckIcon,
  CalendarIcon,
  CheckCircle,
  CircleXIcon,
  Copy,
  Edit,
  Eye,
  File,
  FileDigit,
  HashIcon,
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { StatusFilterDropdown } from "../filters/statusFilterDropdown";
import { TagFilterDropdown } from "../filters/tagFilterDropdown";
export default function PurchaseReport() {
  const [searchParams] = useSearchParams();
  const ownCreated = searchParams.get("ownCreated") === "true";
  const ownDepartment = searchParams.get("ownDepartment") === "true";
  const completedOwnDeptFromUrl = searchParams.get("ownDepartment") === "true";
  const completedTr = searchParams.get("completedTr") === "true";
  const completedTrFromUrl = searchParams.get("completedTr") === "true";
  const forCeoApproval = searchParams.get("forCeoApproval") === "true";
  const forPoApproval = searchParams.get("forPoApproval") === "true";
  const approvedPo = searchParams.get("approvedPo") === "true";
  // const completedHod = searchParams.get("completedHod") === "true";
  const statusFromUrl = searchParams.get("statusTerm") || "";
  const prStatusFromUrl = searchParams.get("prStatusTerm") || "";
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
    prStatusTerm, // ✅ get pr_status filter
    setPrStatusTerm, // ✅ get pr_status setter
    setStatusTerm,
    setCompletedTr,
    setOwnDepartment,
    cancelPoMutation,
    returnPoMutation,
    handleCopyToNew,
    handleViewDraft,
    tagDescription,
    setTagDescription,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    handleClearFilters,
  } = usePurchaseReports();

  const statusMap: Record<string, string> = {
    for_approval: "For Purchase Order Creation",
    on_hold: "For Approval",
  };

  useEffect(() => {
    setCompletedTr(completedTrFromUrl);
  }, [completedTrFromUrl]);

  useEffect(() => {
    setOwnDepartment(completedOwnDeptFromUrl);
  }, [completedOwnDeptFromUrl]);

  // ✅ Handle statusTerm from URL
  useEffect(() => {
    if (statusFromUrl && statusFromUrl !== statusTerm) {
      setStatusTerm(statusFromUrl);
    }
  }, [statusFromUrl, statusTerm, setStatusTerm]);

  // ✅ NEW: Handle prStatusTerm from URL
  useEffect(() => {
    if (prStatusFromUrl && prStatusFromUrl !== prStatusTerm) {
      setPrStatusTerm(prStatusFromUrl);
    }
  }, [prStatusFromUrl, prStatusTerm, setPrStatusTerm]);

  let heading: string;

  if (prStatusTerm === "on_hold") {
    heading = "For HOD Approval";
  } else if (prStatusTerm === "on_hold_tr") {
    heading = "For TR Approval";
  } else if (prStatusTerm === "returned") {
    heading = "Returned PR";
  } else if (prStatusTerm === "Rejected") {
    heading = "Rejected PR";
  } else if (statusTerm === "approved") {
    heading = "Approved Purchase Orders";
  } else if (completedTr === true) {
    heading = "Completed TR";
  } else if (ownDepartment === true) {
    heading = "Department Total PRs";
  } else if (prStatusTerm === "closed") {
    // ✅ Check prStatusTerm for closed
    heading = "Closed PRs";
  } else if (statusTerm === "for_approval" || prStatusTerm === "for_approval") {
    heading = "For Purchase Order Creation";
  } else if (forCeoApproval === true) {
    heading = "For PO Approval";
  } else if (forPoApproval === true) {
    heading = "For Purchase Order Creation";
  } else if (approvedPo === true) {
    heading = "Approved POs";
  } else if (user?.role?.includes("hod")) {
    heading = "Purchase Requests";
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-2 items-center">
            {/* ✅ Status Filter Dropdown */}
            <StatusFilterDropdown
              statusTerm={statusTerm}
              prStatusTerm={prStatusTerm}
              setStatusTerm={setStatusTerm}
              setPrStatusTerm={setPrStatusTerm}
              setPage={setPage}
              user={user}
            />

            <TagFilterDropdown
              tagDescription={tagDescription}
              setTagDescription={setTagDescription}
              setPage={setPage}
            />

            {/* Search Box */}
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
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
        <Table>
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
              {(user?.role?.includes("user") ||
                user?.role?.includes("admin") ||
                user?.role?.includes("hod")) && (
                <TableHead className="border-b">
                  # of Days On Hold for PR
                </TableHead>
              )}
              {(user?.role?.includes("purchasing") ||
                user?.role?.includes("admin") ||
                user?.role?.includes("user") ||
                user?.role?.includes("hod")) && (
                <TableHead className="border-b">
                  # of Days On Hold for PO
                </TableHead>
              )}

              <TableHead className="w-[100px] border-b">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="cursor-pointer">
            {/* ✅ Optional subtle progress bar that shows while fetching */}
            {fetching && (
              <TableRow>
                <TableCell colSpan={11} className="py-0 px-0">
                  <div className="w-full">
                    <Progress indeterminate className="w-full" />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* ✅ Keep rendering data rows regardless of fetching */}
            {data?.items
              ?.filter((item) => {
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
                  <TableCell
                    className="flex gap-2 font-semi
                  bold"
                  >
                    <HashIcon className="h-4 w-5 my-1" />
                    <p className="my-1">{item.series_no}</p>
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.pr_created}
                  </TableCell>
                  <TableCell className="capitalize">
                    {item.pr_purpose
                      .toLowerCase()
                      .replace(/^\w/, (c) => c.toUpperCase())}
                  </TableCell>

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
                  <TableCell className="capitalize">
                    {item.pr_status === "on_hold"
                      ? "For HOD Approval"
                      : item.pr_status === "on_hold_tr"
                      ? "For TR Approval"
                      : statusMap[item.pr_status] || item.pr_status}
                  </TableCell>
                  <TableCell className="capitalize">
                    {item.po_status === "For_approval"
                      ? "For Approval"
                      : item.po_status === "Cancelled" ||
                        item.po_status === "cancelled"
                      ? "Cancelled"
                      : item.po_status ?? "n/a"}
                  </TableCell>
                  <TableCell>{item.date_needed}</TableCell>
                  {(user?.role?.includes("user") ||
                    user?.role?.includes("admin") ||
                    user?.role?.includes("hod")) && (
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

                        // ✅ Clamp to avoid negative results
                        const diffDays = Math.max(
                          0,
                          Math.floor(
                            (latestDate.getTime() - createdDate.getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        );

                        return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
                      })()}
                    </TableCell>
                  )}
                  {(user?.role?.includes("purchasing") ||
                    user?.role?.includes("admin") ||
                    user?.role?.includes("user") ||
                    user?.role?.includes("hod")) && (
                    <TableCell>
                      {(() => {
                        const hodDate = item.hod_signed_at
                          ? new Date(item.hod_signed_at + "T00:00:00")
                          : null;
                        const trDate = item.tr_signed_at
                          ? new Date(item.tr_signed_at + "T00:00:00")
                          : null;

                        // Get latest approval date
                        let latestApprovalDate;
                        if (hodDate && trDate) {
                          latestApprovalDate =
                            hodDate > trDate ? hodDate : trDate;
                        } else if (hodDate) {
                          latestApprovalDate = hodDate;
                        } else if (trDate) {
                          latestApprovalDate = trDate;
                        } else {
                          return "0 days";
                        }

                        // If PO created → count until PO date
                        // If not → count until TODAY
                        const endDate = item.po_created_date
                          ? new Date(item.po_created_date + "T00:00:00")
                          : new Date(); // today

                        let diffDays = Math.floor(
                          (endDate.getTime() - latestApprovalDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        );

                        if (diffDays < 0) diffDays = 0;

                        return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
                      })()}
                    </TableCell>
                  )}
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
                        {/* Always show View button */}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(item.id);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>

                        {/* Only show other options if user is NOT both hod and purchasing */}
                        {!(
                          user?.role?.includes("hod") &&
                          user?.role?.includes("purchasing")
                        ) && (
                          <>
                            {user?.role?.includes("admin") && (
                              <>
                                {/* Edit */}
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(item.id);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                {/* Drafted */}
                                {item.pr_status == "drafted" && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDraft(item.id);
                                    }}
                                  >
                                    <File className="mr-2 h-4 w-4" /> View Draft
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyToNew(item.id);
                                  }}
                                >
                                  <Copy className="mr-2 h-4 w-4" /> Copy To New
                                </DropdownMenuItem>
                              </>
                            )}

                            {user?.role?.includes("user") &&
                              !user?.role?.includes("admin") && (
                                <>
                                  {/* Drafted */}
                                  {item.pr_status === "drafted" && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewDraft(item.id);
                                      }}
                                    >
                                      <File className="mr-2 h-4 w-4" /> View
                                      Draft
                                    </DropdownMenuItem>
                                  )}

                                  {/* Edit */}
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(item.id);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>

                                  {/* Copy To New */}
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyToNew(item.id);
                                    }}
                                  >
                                    <Copy className="mr-2 h-4 w-4" /> Copy To
                                    New
                                  </DropdownMenuItem>

                                  {/* Cancel PR Maker*/}
                                  <DropdownMenuItem
                                    disabled={
                                      item.pr_status === "for_approval" ||
                                      item.pr_status === "Closed"
                                    }
                                    onClick={(e) => {
                                      if (item.pr_status === "for_approval")
                                        return;
                                      e.stopPropagation();
                                      toast("Cancel PR?", {
                                        description: `Are you sure you want to cancel PR for #${item.series_no}?`,
                                        action: {
                                          label: "Confirm",
                                          onClick: () =>
                                            cancelPoMutation(item.id),
                                        },
                                      });
                                    }}
                                    className="text-red-500 hover:text-red-600 focus:text-red-600"
                                  >
                                    <X />
                                    <span>Cancel PR</span>
                                  </DropdownMenuItem>
                                </>
                              )}

                            {(user?.role?.includes("purchasing") ||
                              user?.role?.includes("admin")) && (
                              <>
                                {/* Set PO Number (only if PR is for approval) */}
                                {item.pr_status === "for_approval" && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetPo(item.id);
                                    }}
                                  >
                                    <FileDigit className="mr-2 h-4 w-4" /> Set
                                    PO Number
                                  </DropdownMenuItem>
                                )}
                                {item.pr_status === "for_approval" && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toast("Return PR?", {
                                        description: `Are you sure you want to return PR for #${item.series_no}?`,
                                        action: {
                                          label: "Confirm",
                                          onClick: () =>
                                            returnPoMutation(item.id),
                                        },
                                      });
                                    }}
                                  >
                                    <ArrowLeftCircle className="mr-2 h-4 w-4 text-amber-500" />{" "}
                                    <span className="text-amber-500">
                                      Return PR
                                    </span>
                                  </DropdownMenuItem>
                                )}
                                {/* Date Approve + Return PR (only if PO is for approval) */}
                                {item.po_status === "For_approval" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setApproveTargetId(item.id);
                                        setApproveDialogOpen(true);
                                      }}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />{" "}
                                      Date Approve
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {/* Cancel PO ADMIN */}
                                {(item.pr_status === "Closed" ||
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
                                    <X className="mr-2 h-4 w-4 text-red-500" />{" "}
                                    <span className="text-red-500">
                                      Cancel PO
                                    </span>
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            {/* Delete */}

                            {user?.role?.includes("admin") && (
                              <>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item);
                                  }}
                                >
                                  <Trash className="mr-2 h-4 w-4 text-red-500" />
                                  <span className="text-red-500">Delete</span>
                                </DropdownMenuItem>
                                {/* Cancel PR ADMIN */}
                                {(item.pr_status === "for_approval" ||
                                  item.pr_status === "on_hold" ||
                                  item.pr_status === "on_hold_tr") && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toast("Cancel PO?", {
                                        description: `Are you sure you want to cancel PR for #${item.series_no}?`,
                                        action: {
                                          label: "Confirm",
                                          onClick: () =>
                                            cancelPoMutation(item.id),
                                        },
                                      });
                                    }}
                                  >
                                    <CircleXIcon className="mr-2 h-4 w-4 text-red-500" />{" "}
                                    <span className="text-red-500">
                                      Cancel PR
                                    </span>
                                  </DropdownMenuItem>
                                )}
                              </>
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
