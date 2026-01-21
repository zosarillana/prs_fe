import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Printer, Search } from "lucide-react";
import { format } from "date-fns";

type Props = {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  setPage: (n: number) => void;
  fromDate: Date | null;
  toDate: Date | null;
  setFromDate: (d: Date | null) => void;
  setToDate: (d: Date | null) => void;
  refetch: () => void;
  clearFilters: () => void;
  onPrint: () => void;
  printing: boolean;
};

export function ReportsHeader(props: Props) {
  return (
    <div className="flex justify-between mb-6">
      <h1 className="text-3xl font-bold">Reports</h1>

      <div className="flex gap-3 items-center">
        {[["From", props.fromDate, props.setFromDate],
          ["To", props.toDate, props.setToDate]].map(
          ([label, value, setter]: any, i) => (
            <Popover key={i}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(value, "MMM d, yyyy") : `${label} date`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar
                  mode="single"
                  selected={value ?? undefined}
                  onSelect={(d) => setter(d ?? null)}
                />
              </PopoverContent>
            </Popover>
          )
        )}

        <Button onClick={props.refetch} size="sm" variant="outline">
          Apply
        </Button>

        <Button onClick={props.clearFilters} size="sm" variant="outline">
          Clear
        </Button>

        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4" />
          <Input
            className="pl-8"
            placeholder="Search..."
            value={props.searchTerm}
            onChange={(e) => {
              props.setSearchTerm(e.target.value);
              props.setPage(1);
            }}
          />
        </div>

        <Button
          onClick={props.onPrint}
          disabled={props.printing}
          variant="outline"
          size="sm"
        >
          <Printer className="h-4 w-4 mr-2" />
          {props.printing ? "Generating..." : "Print PDF"}
        </Button>
      </div>
    </div>
  );
}
