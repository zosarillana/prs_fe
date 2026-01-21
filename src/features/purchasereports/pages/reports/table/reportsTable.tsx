import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Hash } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Props = {
  data: any;
  fetching: boolean;
  diffDays: (a: Date | null, b: Date | null) => string;
  latestApprovalDate: (a: Date | null, b: Date | null) => Date | null;
};

export function ReportsTable({
  data,
  fetching,
  diffDays,
  latestApprovalDate,
}: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {[
            "PR No","PR Created","PO No","PO Created","Purpose","Department",
            "Submitted","HOD","TR","PO Create","PO Approve","ToT","Purchaser"
          ].map((h) => (
            <TableHead key={h}>{h}</TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {fetching && (
          <TableRow>
            <TableCell colSpan={13}>
              <Progress indeterminate />
            </TableCell>
          </TableRow>
        )}

        {data?.items?.map((i: any) => {
          const pr = i.pr_created ? new Date(i.pr_created) : null;
          const hod = i.hod_signed_at ? new Date(i.hod_signed_at) : null;
          const tr = i.tr_signed_at ? new Date(i.tr_signed_at) : null;
          const poC = i.po_created_date ? new Date(i.po_created_date) : null;
          const poA = i.po_approved_date ? new Date(i.po_approved_date) : null;
          const latest = latestApprovalDate(hod, tr);

          return (
            <TableRow key={i.id}>
              <TableCell className="font-medium flex gap-2">
                <Hash className="h-4 w-4" />
                {i.series_no}
              </TableCell>
              <TableCell>{i.pr_created}</TableCell>
              <TableCell>{i.po_no}</TableCell>
              <TableCell>{i.po_created_date}</TableCell>
              <TableCell>{i.pr_purpose}</TableCell>
              <TableCell>{i.department}</TableCell>
              <TableCell>{i.user?.name}</TableCell>
              <TableCell>{diffDays(pr, hod)}</TableCell>
              <TableCell>{diffDays(hod, tr)}</TableCell>
              <TableCell>{diffDays(latest, poC)}</TableCell>
              <TableCell>{diffDays(poC, poA)}</TableCell>
              <TableCell>{diffDays(pr, poA)}</TableCell>
              <TableCell>{i.purchaser_id?.name}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
    