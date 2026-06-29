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
import { useState, useMemo, useEffect } from "react";

import { useVendorOptions } from "../hooks/useVendorOption";
import { usePurchaseReportOptions } from "../hooks/usePurchaseReportOption";
import { useVendorPaymentForm } from "../hooks/useVendorPaymentForm";
import { useFlattenedPoOptions } from "../hooks/useFlattenedOptions";
import { useVendorPayments } from "../hooks/useVendorPayment";

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

interface EditVendorPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: any;
  payments: any[];
  onSuccess?: () => void;
}

export function EditVendorPaymentDialog({
  open,
  onOpenChange,
  payment,
  payments,
  onSuccess,
}: EditVendorPaymentDialogProps) {
  const [selectedPr, setSelectedPr] = useState<any | null>(null);

  const { data: vendors = [], isLoading: vendorsLoading } = useVendorOptions();
  const { data: purchaseReports = [], isLoading: prsLoading } =
    usePurchaseReportOptions();

  const { payments: existingPayments } = useVendorPayments();
  const allPoOptions = useFlattenedPoOptions(purchaseReports);

  const existingPoNumbers = useMemo(
    () =>
      new Set(
        existingPayments
          .filter((p) => p.id !== payment?.id)
          .map((p) => p.po_no),
      ),
    [existingPayments, payment],
  );

  const availablePoOptions = useMemo(
    () => allPoOptions.filter((item) => !existingPoNumbers.has(item.po)),
    [allPoOptions, existingPoNumbers],
  );

  const {
    vendor_id,
    setVendorId,
    prs_id,
    setPrsId,
    po_number,
    setPoNumber,
    amount,
    setAmount,
    inv_no,
    setInvNumber,
    cheque_number,
    setChequeNumber,
    cheque_status,
    setChequeStatus,
    loading,
    handleSubmit,
  } = useVendorPaymentForm({
    initialData: payment,
    isEdit: true,
    onSuccess: () => onSuccess?.(),
    onClose: () => onOpenChange(false),
  });

  useEffect(() => {
    if (!payment) return;

    const poKey = payment.po_no;

    // Preselect PO + PRS
    if (purchaseReports.length) {
      const match = allPoOptions.find((item) => item.po === poKey);
      if (match) {
        setSelectedPr(match.fullPr);
        setPrsId(match.prId);
        setPoNumber(match.po);
      }
    }

    // Match vendor by name if vendor_id missing
    if (vendors.length && payment.vendor_name) {
      const matched = vendors.find(
        (v: any) =>
          v.vendor_name?.trim().toLowerCase() ===
          payment.vendor_name?.trim().toLowerCase(),
      );
      if (matched) setVendorId(Number(matched.id));
    }
  }, [payment, purchaseReports, vendors]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Edit Vendor Payment</DialogTitle>
          <DialogDescription>Update payment details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* PO Select */}
          <div className="space-y-2">
            <Label>PO Number:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                  disabled={prsLoading}
                >
                  {po_number
                    ? availablePoOptions.find((item) => item.po === po_number)
                        ?.po +
                      " — SRL # " +
                      availablePoOptions.find((item) => item.po === po_number)
                        ?.seriesNo
                    : "Select PO"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search PO..." />
                  <CommandList>
                    <CommandEmpty>No PO found.</CommandEmpty>
                    <CommandGroup>
                      {availablePoOptions.map((item) => (
                        <CommandItem
                          key={item.po}
                          value={`${item.po} ${item.seriesNo}`}
                          onSelect={() => {
                            setPoNumber(item.po);
                            setSelectedPr(item.fullPr);
                            setPrsId(item.prId);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              po_number === item.po
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {item.po} — SRL # {item.seriesNo}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* PRS Display */}
          <div className="space-y-2">
            <Label>PRS Number:</Label>
            <Input
              value={selectedPr?.series_no ?? ""}
              placeholder="—"
              disabled
            />
          </div>

          {/* Invoice number */}
          <div className="space-y-2">
            <Label>Invoice Number:</Label>
            <Input
              type="text"
              value={inv_no}
              onChange={(e) => setInvNumber(e.target.value)}
              placeholder="Enter invoice number"
            />
          </div>

          {/* Vendor Select */}
          <div className="space-y-2">
            <Label>Vendor:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                  disabled={vendorsLoading}
                >
                  {vendor_id
                    ? vendors.find((v) => Number(v.id) === Number(vendor_id))
                        ?.vendor_name
                    : "Select Vendor"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search vendor..." />
                  <CommandList>
                    <CommandEmpty>No vendor found.</CommandEmpty>
                    <CommandGroup>
                      {vendors.map((vendor: any) => (
                        <CommandItem
                          key={vendor.id}
                          value={vendor.vendor_name ?? ""}
                          onSelect={() => setVendorId(Number(vendor.id))}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              Number(vendor_id) === Number(vendor.id)
                                ? "opacity-100"
                                : "opacity-0",
                            )}
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

          {/* Cheque status + number */}
          <div className="flex gap-5">
            <div className="space-y-2">
              <Label>Cheque Status:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {cheque_status
                      ? cheque_status === "on_process"
                        ? "On Process"
                        : cheque_status === "available"
                          ? "Available"
                          : "Select Status"
                      : "Select Status"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {[
                          { value: "on_process", label: "On Process" },
                          { value: "available", label: "Available" },
                        ].map((status) => (
                          <CommandItem
                            key={status.value}
                            value={status.label}
                            onSelect={() => setChequeStatus(status.value)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                cheque_status === status.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {status.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Cheque Number:</Label>
              <Input
                type="text"
                value={cheque_number}
                onChange={(e) => setChequeNumber(e.target.value)}
                placeholder="Enter cheque number"
              />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount:</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
