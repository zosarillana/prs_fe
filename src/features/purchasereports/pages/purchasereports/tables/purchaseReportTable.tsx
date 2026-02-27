import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  Edit,
  Copy,
  File,
  FileDigit,
  X,
  Trash,
  CheckCircle,
  ArrowLeftCircle,
  CircleXIcon,
  HashIcon,
} from "lucide-react";
import { toast } from "sonner";

type Props = {
  data: any;
  fetching: boolean;
  user: any;
  ownCreated: boolean;
  completedTr: boolean;
  forCeoApproval: boolean;
  approvedPo: boolean;
  statusMap: Record<string, string>;

  handleView: (id: number) => void;
  handleViewMultiple: (id: number) => void;
  handleEdit: (id: number) => void;
  handleDelete: (item: any) => void;
  handleSetPo: (id: number) => void;
  handleSetSap: (id: number) => void;
  handleCopyToNew: (id: number) => void;
  handleViewDraft: (id: number) => void;

  cancelPoMutation: (id: number) => void;
  returnPoMutation: (id: number) => void;

  setApproveDialogOpen: (open: boolean) => void;
  setApproveTargetId: (id: number) => void;
};

export function PurchaseReportTable({
  data,
  fetching,
  user,
  ownCreated,
  completedTr,
  forCeoApproval,
  approvedPo,
  statusMap,
  handleView,
  handleEdit,
  handleDelete,
  handleSetPo,
  handleSetSap,
  handleCopyToNew,
  handleViewDraft,
  handleViewMultiple,
  cancelPoMutation,
  returnPoMutation,
  setApproveDialogOpen,
  setApproveTargetId,
}: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px] border-b text-gray-500">
            SL #
          </TableHead>
          <TableHead className="w-[100px] border-b text-start">
            SAP - PR
          </TableHead>
          <TableHead className="border-b">Purpose</TableHead>
          <TableHead className="border-b">Department</TableHead>
          <TableHead className="border-b">Submitted By</TableHead>
          <TableHead className="border-b">Status</TableHead>
          <TableHead className="border-b">PO Status</TableHead>
          <TableHead className="border-b">PR Created</TableHead>
          <TableHead className="border-b">Date Needed</TableHead>

          {(user?.role?.includes("user") ||
            user?.role?.includes("admin") ||
            user?.role?.includes("hod")) && (
            <TableHead className="border-b"># of Days On Hold for PR</TableHead>
          )}

          {(user?.role?.includes("purchasing") ||
            user?.role?.includes("admin") ||
            user?.role?.includes("user") ||
            user?.role?.includes("hod")) && (
            <TableHead className="border-b"># of Days On Hold for PO</TableHead>
          )}

          <TableHead className="border-b">Purchasing Associate</TableHead>
          <TableHead className="w-[100px] text-center border-b">
            Action
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody className="cursor-pointer">
        {fetching && (
          <TableRow>
            <TableCell colSpan={13} className="p-0">
              <Progress indeterminate />
            </TableCell>
          </TableRow>
        )}

        {data?.items
          ?.filter((item: any) => {
            if (user?.role?.includes("user") && ownCreated) {
              return item.user.id === user.id;
            }
            if (completedTr) return item.tr_user_id != null;
            if (forCeoApproval) return item.po_status === "For_approval";
            if (approvedPo) return item.po_status === "approved";
            return true;
          })
          .map((item: any) => (
            <TableRow key={item.id} onClick={() => handleView(item.id)}>
              <TableCell className="font-semibold text-gray-500">
                <p className="flex gap-1">
                  <span>
                    <HashIcon className="h-4 w-4" />
                  </span>{" "}
                  {item.series_no}
                </p>
              </TableCell>

              <TableCell className="text-start flex items-center gap-2 mt-2.5">
                {item.sap_id ? (
                  <>
                    <span
                      className="w-2 h-2 bg-green-500 rounded-full"
                      title="Online"
                    ></span>
                    <span>{item.sap_id}</span>
                  </>
                ) : (
                  "—"
                )}
              </TableCell>

              <TableCell className="capitalize">
                {item.pr_purpose ? item.pr_purpose.toLowerCase() : "N/A"}
              </TableCell>

              <TableCell>
                {item.department
                  .split("_")
                  .map((word: string) =>
                    word.toLowerCase() === "it"
                      ? "IT"
                      : word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase(),
                  )
                  .join(" ")}
              </TableCell>

              <TableCell>{item.user.name}</TableCell>
              <TableCell className="capitalize">
                {item.pr_status === "on_hold"
                  ? "For HOD Approval"
                  : item.pr_status === "on_hold_return"
                    ? "On Hold For Edit"
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
                    : (item.po_status ?? "n/a")}
              </TableCell>

              <TableCell>{item.pr_created}</TableCell>
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

                    const diffDays = Math.max(
                      0,
                      Math.floor(
                        (latestDate.getTime() - createdDate.getTime()) /
                          (1000 * 60 * 60 * 24),
                      ),
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

                    let latestApprovalDate;
                    if (hodDate && trDate)
                      latestApprovalDate = hodDate > trDate ? hodDate : trDate;
                    else if (hodDate) latestApprovalDate = hodDate;
                    else if (trDate) latestApprovalDate = trDate;
                    else return "0 days";

                    const endDate = item.po_created_date
                      ? new Date(item.po_created_date + "T00:00:00")
                      : new Date();

                    let diffDays = Math.floor(
                      (endDate.getTime() - latestApprovalDate.getTime()) /
                        (1000 * 60 * 60 * 24),
                    );

                    if (diffDays < 0) diffDays = 0;

                    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
                  })()}
                </TableCell>
              )}
              <TableCell>{item.purchaser_id?.name ?? "n/a"}</TableCell>

              <TableCell className="text-center">
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
                                  <File className="mr-2 h-4 w-4" /> View Draft
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
                                <Copy className="mr-2 h-4 w-4" /> Copy To New
                              </DropdownMenuItem>

                              {/* Cancel PR Maker*/}
                              <DropdownMenuItem
                                disabled={
                                  item.pr_status === "for_approval" ||
                                  item.pr_status === "Closed"
                                }
                                onClick={(e) => {
                                  if (item.pr_status === "for_approval") return;
                                  e.stopPropagation();
                                  toast("Cancel PR?", {
                                    description: `Are you sure you want to cancel PR for #${item.series_no}?`,
                                    action: {
                                      label: "Confirm",
                                      onClick: () => cancelPoMutation(item.id),
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
                            {/* Set SAP PR */}
                            {item.sap_id == null &&
                              item.pr_status === "for_approval" && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetSap(item.id);
                                  }}
                                >
                                  <FileDigit className="mr-2 h-4 w-4" /> Set SAP
                                  - PR
                                </DropdownMenuItem>
                              )}

                            {/* Temporary SAP PR */}
                            {item.sap_id !== null && (
                              <DropdownMenuItem
                                title="This is only temporary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetSap(item.id);
                                }}
                              >
                                <FileDigit className="mr-2 h-4 w-4" /> Edit SAP
                                - PR
                              </DropdownMenuItem>
                            )}

                            {/* Set PO Number */}
                            {item.sap_id !== null &&
                              item.pr_status === "for_approval" &&
                              item.po_status !== "po_partial" && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetPo(item.id);
                                  }}
                                >
                                  <FileDigit className="mr-2 h-4 w-4" />
                                  Set PO Number
                                </DropdownMenuItem>
                              )}

                            {/* Edit PO Number */}
                            {item.sap_id !== null &&
                              item.pr_status === "Closed" && (
                                <DropdownMenuItem
                                  title="This is only temporary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetPo(item.id);
                                  }}
                                >
                                  <FileDigit className="mr-2 h-4 w-4" /> Edit PO
                                  Number
                                </DropdownMenuItem>
                              )}
                            {/* Multiple PO */}
                            {item.sap_id !== null && (
                              <DropdownMenuItem
                                // disabled={true}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewMultiple(item.id);
                                }}
                              >
                                <FileDigit className="mr-2 h-4 w-4" />
                                Multiple PO
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
                                      onClick: () => returnPoMutation(item.id),
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
                            {/* Date Approve (only if PO is for approval and not partial) */}
                            {item.po_status === "For_approval" &&
                              item.po_status !== "po_partial" && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setApproveTargetId(item.id);
                                    setApproveDialogOpen(true);
                                  }}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Date Approve
                                </DropdownMenuItem>
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
                                      onClick: () => cancelPoMutation(item.id),
                                    },
                                  });
                                }}
                              >
                                <X className="mr-2 h-4 w-4 text-red-500" />{" "}
                                <span className="text-red-500">Cancel PO</span>
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
                                      onClick: () => cancelPoMutation(item.id),
                                    },
                                  });
                                }}
                              >
                                <CircleXIcon className="mr-2 h-4 w-4 text-red-500" />{" "}
                                <span className="text-red-500">Cancel PR</span>
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
  );
}
