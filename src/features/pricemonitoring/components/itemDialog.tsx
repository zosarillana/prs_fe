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
import { itemService } from "../itemService";
import { toast } from "sonner";

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: {
    id: number;
    item_name: string;
    description?: string;
  };
  onSuccess?: () => void;
}

export function ItemDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: ItemDialogProps) {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setItemName(item.item_name);
      setDescription(item.description ?? "");
    } else {
      setItemName("");
      setDescription("");
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName.trim()) {
      toast.error("Item name is required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        item_name: itemName,
        description,
      };

      if (item) {
        await itemService.update(item.id, payload);
        toast.success("Item updated");
      } else {
        await itemService.create(payload);
        toast.success("Item created");
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
            {item ? "Edit Item" : "Add Item"}
          </DialogTitle>
          <DialogDescription>
            Enter item details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Item Name</Label>
            <Input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item name"
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
            {item ? "Update" : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
