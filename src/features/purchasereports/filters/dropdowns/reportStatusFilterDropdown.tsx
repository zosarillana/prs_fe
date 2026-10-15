import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Props {
  statusTerm: string;
  prStatusTerm: string;
  setStatusTerm: (value: string) => void;
  setPrStatusTerm: (value: string) => void;
  setPage: (page: number) => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "on_hold_tr", label: "For TR Approval" },
  { value: "on_hold", label: "For HOD Approval" },
  { value: "for_approval", label: "For Purchase Order Creation" },
  { value: "for_approval_ceo", label: "For Approval" },
  { value: "approved", label: "Approved POs" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Rejected", label: "Rejected" },
  { value: "returned", label: "Returned" },
  { value: "closed", label: "Closed" },
  { value: "on_hold_return", label: "On hold For Edit" },
  { value: "partial_po", label: "Partial PO" },
  { value: "drafted", label: "Drafted" },
];

export const ReportStatusFilterDropdown: React.FC<Props> = ({
  statusTerm,
  prStatusTerm,
  setStatusTerm,
  setPrStatusTerm,
  setPage,
}) => {
  const handleChange = (value: string) => {
    setPage(1);

    switch (value) {
      case "all":
        setStatusTerm("");
        setPrStatusTerm("");
        break;

      case "for_approval_ceo":
        setStatusTerm("For_approval");
        setPrStatusTerm("");
        break;

      case "approved":
      case "partial_po":
        // these are top-level PO statuses, not pr_status
        setStatusTerm(value);
        setPrStatusTerm("");
        break;

      case "on_hold":
      case "on_hold_tr":
      case "for_approval":
      case "closed":
      case "Cancelled":
      case "Rejected":
      case "drafted":
      case "on_hold_return":
      case "returned":
        setPrStatusTerm(value);
        setStatusTerm("");
        break;

      default:
        setStatusTerm(value);
        setPrStatusTerm("");
        break;
    }
  };

  const selectedValue =
    statusTerm === "For_approval"
      ? "for_approval_ceo"
      : prStatusTerm || statusTerm || "all";

  return (
    <Select value={selectedValue} onValueChange={handleChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Filter by Status" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
