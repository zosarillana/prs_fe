import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/skeleton";

interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({ rows = 5 }: TableSkeletonProps) {
  const placeholders = Array.from({ length: rows });

  return (
    <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
      <Table className="border-separate border-spacing-0 w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px] border-b">Series Number</TableHead>
            <TableHead className="border-b">Purpose</TableHead>
            <TableHead className="border-b">Department</TableHead>
            <TableHead className="border-b">Submitted By</TableHead>
            <TableHead className="border-b">Date Needed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {placeholders.map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-36" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
