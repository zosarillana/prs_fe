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
import { useEffect, useState } from "react";
import { vendorService } from "../vendorService";
import { toast } from "sonner";

interface VendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: {
    id: number;
    vendor_name: string;
    description?: string;
  };
  onSuccess?: () => void;
}

export function VendorDialog({
  open,
  onOpenChange,
  vendor,
  onSuccess,
}: VendorDialogProps) {
  const [vendorName, setVendorName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vendor) {
      setVendorName(vendor.vendor_name);
      setDescription(vendor.description ?? "");
    } else {
      setVendorName("");
      setDescription("");
    }
  }, [vendor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorName.trim()) {
      toast.error("Vendor name is required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vendor_name: vendorName,
        description,
      };

      if (vendor) {
        await vendorService.update(vendor.id, payload);
        toast.success("Vendor updated");
      } else {
        await vendorService.create(payload);
        toast.success("Vendor created");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>
            {vendor ? "Edit Vendor" : "Add Vendor"}
          </DialogTitle>
          <DialogDescription>
            Enter vendor details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Vendor Name</Label>
            <Input
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="Vendor name"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {vendor ? "Update" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
