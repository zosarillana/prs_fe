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
  handleEdit: (id: number) => void;
  handleDelete: (item: any) => void;
  handleSetPo: (id: number) => void;
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
  handleCopyToNew,
  handleViewDraft,
  cancelPoMutation,
  returnPoMutation,
  setApproveDialogOpen,
  setApproveTargetId,
}: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[140px] border-b text-gray-500">
            PR Number
          </TableHead>
          <TableHead className="border-b">SAP ID</TableHead>
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
          <TableHead className="w-[100px] border-b">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody className="cursor-pointer">
        {fetching && (
          <TableRow>
            <TableCell colSpan={12} className="p-0">
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
              <TableCell className="flex gap-2 font-semibold text-gray-500">
                <HashIcon className="h-4 w-4 mt-1" />
                {item.series_no}
              </TableCell>

              <TableCell>—</TableCell>
              <TableCell className="capitalize">{item.pr_purpose}</TableCell>
              <TableCell>{item.department}</TableCell>
              <TableCell>{item.user.name}</TableCell>

              <TableCell>
                {statusMap[item.pr_status] ?? item.pr_status}
              </TableCell>

              <TableCell>{item.po_status ?? "n/a"}</TableCell>
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
                        (1000 * 60 * 60 * 24)
                    );

                    if (diffDays < 0) diffDays = 0;

                    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
                  })()}
                </TableCell>
              )}
              <TableCell>{item.purchaser_id?.name ?? "n/a"}</TableCell>

              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleView(item.id)}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>

                    {user?.role?.includes("admin") && (
                      <>
                        <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleCopyToNew(item.id)}
                        >
                          <Copy className="mr-2 h-4 w-4" /> Copy
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleDelete(item)}>
                          <Trash className="mr-2 h-4 w-4 text-red-500" />
                          <span className="text-red-500">Delete</span>
                        </DropdownMenuItem>
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
