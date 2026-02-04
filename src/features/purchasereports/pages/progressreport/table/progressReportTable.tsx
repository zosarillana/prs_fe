import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { HashIcon, MoreVertical } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";

interface ProgressReportTableProps {
  data: any;
  fetching: boolean;
  onOpenCalendar: (id: number) => void;
}

export const ProgressReportTable = ({
  data,
  fetching,
  onOpenCalendar,
}: ProgressReportTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SL #</TableHead>
          <TableHead>SAP - PR</TableHead>
          <TableHead>PR Created</TableHead>
          <TableHead>Purpose</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Submitted By</TableHead>
          <TableHead>Date Needed</TableHead>
          <TableHead className="w-[100px]">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {fetching && (
          <TableRow>
            <TableCell colSpan={10} className="py-0 px-0">
              <Progress indeterminate className="w-full" />
            </TableCell>
          </TableRow>
        )}

        {data?.items?.map((item: any) => (
          <TableRow
            key={item.id}
            onClick={() => onOpenCalendar(item.id)}
            className="cursor-pointer hover:bg-muted/50"
          >
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

            <TableCell>{item.pr_created}</TableCell>
            <TableCell>{item.pr_created}</TableCell>
            <TableCell>{item.pr_purpose}</TableCell>
            <TableCell>
              {item.department
                .split("_")
                .map((w: string) =>
                  w.toLowerCase() === "it"
                    ? "IT"
                    : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
                )
                .join(" ")}
            </TableCell>
            <TableCell>{item.user.name}</TableCell>
            <TableCell>{item.date_needed}</TableCell>

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
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => onOpenCalendar(item.id)}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Progress Status
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
