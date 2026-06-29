import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { itemService } from "../itemService";
import { vendorService } from "../vendorService";
import { itemPriceService } from "../itemPriceService";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";

interface ItemPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemPrice?: {
    id: number;
    item_id: number;
    vendor_id: number;
    unit_price: number;
    item?: { id:number, name: string };
    vendor?: { id:number, name: string };
  }; // undefined = CREATE, defined = EDIT
  onSuccess?: () => void;
}

export function ItemPriceDialog({
  open,
  onOpenChange,
  itemPrice,
  onSuccess,
}: ItemPriceDialogProps) {
  const [items, setItems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [itemId, setItemId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);

  const isEditing = !!itemPrice;

  // Prefill on edit
  useEffect(() => {
    if (itemPrice) {
      // console.log("itemPrice received:", itemPrice);
      // Extract IDs from nested objects if they exist
      const extractedItemId = itemPrice.item_id || itemPrice.item?.id || "";
      const extractedVendorId =
        itemPrice.vendor_id || itemPrice.vendor?.id || "";

      setItemId(String(extractedItemId));
      setVendorId(String(extractedVendorId));
      setUnitPrice(String(itemPrice.unit_price).replace(/,/g, "")); // Remove commas from formatted numbers

      // console.log("Extracted itemId:", extractedItemId);
      // console.log("Extracted vendorId:", extractedVendorId);
    } else {
      setItemId("");
      setVendorId("");
      setUnitPrice("");
    }
  }, [itemPrice, open]);

  // Load items & vendors (only when creating)
  useEffect(() => {
    if (!open || isEditing) return;

    const loadData = async () => {
      try {
        const [itemsRes, vendorsRes] = await Promise.all([
          itemService.getAll({ pageNumber: 1, pageSize: 1000 }),
          vendorService.getAll({ pageNumber: 1, pageSize: 1000 }),
        ]);

        setItems(itemsRes.items);
        setVendors(vendorsRes.items);
      } catch {
        toast.error("Failed to load items or vendors");
      }
    };

    loadData();
  }, [open, isEditing]);

  const handleSubmit = async () => {
    if (!unitPrice) {
      toast.error("Unit price is required");
      return;
    }

    if (!isEditing && (!itemId || !vendorId)) {
      toast.error("Item and vendor are required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        item_id: isEditing ? Number(itemId) : Number(itemId),
        vendor_id: isEditing ? Number(vendorId) : Number(vendorId),
        unit_price: Number(unitPrice),
      };

      // console.log("Submitting payload:", payload);
      // console.log("itemId state:", itemId);
      // console.log("vendorId state:", vendorId);

      if (itemPrice) {
        await itemPriceService.update(itemPrice.id, payload);
        toast.success("Item price updated");
      } else {
        await itemPriceService.create(payload);
        toast.success("Item price created");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = items.find((item) => String(item.id) === itemId);
  const selectedVendor = vendors.find(
    (vendor) => String(vendor.id) === vendorId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Item Price" : "Add Item Price"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the unit price for this item-vendor combination."
              : "Set the price for an item and vendor."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {isEditing ? (
            <>
              {/* Item (Read-only) */}
              <div className="space-y-2">
                <Label>Item</Label>
                <div className="px-3 py-2 border rounded-md bg-muted text-sm">
                  {itemPrice?.item?.name ?? "Unknown Item"}
                </div>
              </div>

              {/* Vendor (Read-only) */}
              <div className="space-y-2">
                <Label>Vendor</Label>
                <div className="px-3 py-2 border rounded-md bg-muted text-sm">
                  {itemPrice?.vendor?.name ?? "Unknown Vendor"}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Item (Searchable) */}
              <div className="space-y-2">
                <Label>Item</Label>
                <Popover open={itemOpen} onOpenChange={setItemOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={itemOpen}
                      className="w-full justify-between"
                    >
                      {selectedItem ? selectedItem.item_name : "Select item"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[380px] p-0">
                    <Command>
                      <CommandInput placeholder="Search items..." />
                      <CommandList>
                        <CommandEmpty>No item found.</CommandEmpty>
                        <CommandGroup>
                          {items.map((item) => (
                            <CommandItem
                              key={item.id}
                              value={item.item_name}
                              onSelect={() => {
                                setItemId(String(item.id));
                                setItemOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  itemId === String(item.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              {item.item_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Vendor (Searchable) */}
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Popover open={vendorOpen} onOpenChange={setVendorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={vendorOpen}
                      className="w-full justify-between"
                    >
                      {selectedVendor
                        ? selectedVendor.vendor_name
                        : "Select vendor"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[380px] p-0">
                    <Command>
                      <CommandInput placeholder="Search vendors..." />
                      <CommandList>
                        <CommandEmpty>No vendor found.</CommandEmpty>
                        <CommandGroup>
                          {vendors.map((vendor) => (
                            <CommandItem
                              key={vendor.id}
                              value={vendor.vendor_name}
                              onSelect={() => {
                                setVendorId(String(vendor.id));
                                setVendorOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  vendorId === String(vendor.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              {vendor.vendor_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          {/* Price (Always editable) */}
          <div className="space-y-2">
            <Label>Unit Price</Label>
            <Input
              type="number"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="0.00"
              autoFocus={isEditing}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={loading}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
