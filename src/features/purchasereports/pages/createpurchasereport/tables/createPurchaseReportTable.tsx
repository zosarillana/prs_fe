import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  quantity: string; // now string
  unit?: string;
  description?: string;
  tag?: string;
  remarks?: string;
};

type Props = {
  items: Item[];
  uoms: { id: string; description: string }[];
  tags: { id: string; description: string }[];
  tagsLoading?: boolean;
  handleChange: (index: number, field: keyof Item, value: any) => void;
  removeRow: (index: number) => void;
};

export function CreatePurchaseRequestTable({
  items,
  uoms,
  tags,
  tagsLoading = false,
  handleChange,
  removeRow,
}: Props) {
  return (
    <Table className="border-separate border-spacing-0 w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[70px]">Item</TableHead>
          <TableHead className="w-[70px]">Quantity</TableHead>
          <TableHead className="w-[70px]">Unit</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Tag</TableHead>
          <TableHead>Remarks</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.length > 0 ? (
          items.map((item, i) => (
            <TableRow key={i}>
              <TableCell>{i + 1}</TableCell>

              <TableCell>
                <Input
                  type="number"
                  min={1}
                  className="w-[70px]"
                  value={item.quantity}
                  onChange={(e) =>
                    handleChange(i, "quantity", e.target.value)
                  }
                />
              </TableCell>

              <TableCell>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-[120px] justify-between"
                    >
                      {item.unit
                        ? uoms.find((uom) => uom.description === item.unit)
                            ?.description
                        : "Select unit..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[120px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search unit..." />
                      <CommandList>
                        <CommandEmpty>No unit found.</CommandEmpty>
                        <CommandGroup>
                          {uoms.map((uom) => (
                            <CommandItem
                              key={uom.id}
                              value={uom.description}
                              onSelect={() =>
                                handleChange(i, "unit", uom.description)
                              }
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  item.unit === uom.description
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {uom.description}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </TableCell>

              <TableCell>
                <Input
                  placeholder="Enter description"
                  value={item.description}
                  onChange={(e) =>
                    handleChange(i, "description", e.target.value)
                  }
                />
              </TableCell>

              <TableCell>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      disabled={tagsLoading}
                    >
                      {item.tag
                        ? tags.find((tag) => String(tag.id) === item.tag)
                            ?.description
                        : "Select tag..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search tag..." />
                      <CommandList>
                        <CommandEmpty>No tag found.</CommandEmpty>
                        <CommandGroup>
                          {tags.map((tag) => (
                            <CommandItem
                              key={tag.id}
                              value={tag.description ?? ""}
                              onSelect={() =>
                                handleChange(i, "tag", String(tag.id))
                              }
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  item.tag === String(tag.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {tag.description}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </TableCell>

              <TableCell>
                <Input
                  placeholder="Remarks"
                  value={item.remarks}
                  onChange={(e) =>
                    handleChange(i, "remarks", e.target.value)
                  }
                />
              </TableCell>

              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeRow(i)}
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-500">
              No Purchase Requests.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
