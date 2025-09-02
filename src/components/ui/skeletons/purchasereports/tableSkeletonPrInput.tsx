import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeletons/skeleton";

interface TableSkeletonPrInputProps {
  rows?: number;
}

export function TableSkeletonPrInput({
  rows = 5,
}: TableSkeletonPrInputProps) {
  const placeholders = Array.from({ length: rows });

  return (
    <div className="overflow-hidden rounded-lg border text-card-foreground shadow">
      <Table className="border-separate border-spacing-0 w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[70px] border-b">Item</TableHead>
            <TableHead className="w-[70px] border-b">Quantity</TableHead>
            <TableHead className="w-[70px] border-b">Unit</TableHead>
            <TableHead className="border-b">Description</TableHead>
            <TableHead className="border-b">Tag</TableHead>
            <TableHead className="border-b">Remarks</TableHead>
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
