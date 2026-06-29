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
  user: { role?: string[] } | null; // allow null
}

export const StatusFilterDropdown: React.FC<Props> = ({
  statusTerm,
  prStatusTerm,
  setStatusTerm,
  setPrStatusTerm,
  setPage,
  user,
}) => {
  const handleChange = (value: string) => {
    // Reset page whenever filter changes
    setPage(1);

    switch (value) {
      case "all":
        setStatusTerm("");
        setPrStatusTerm("");
        break;
      case "on_hold":
      case "on_hold_tr":
      case "for_approval":
      case "closed":
      case "Cancelled":
      case "Rejected":
      case "drafted":
        setPrStatusTerm(value);
        setStatusTerm("");
        break;
      case "on_hold_return":
        setPrStatusTerm(value);
        setStatusTerm("");
        break;
      case "returned":
        setPrStatusTerm(value);
        setStatusTerm("");
        break;
      case "for_approval_ceo":
        setStatusTerm("For_approval");
        setPrStatusTerm("");
        break;
      default:
        setStatusTerm(value);
        setPrStatusTerm("");
        break;
    }
  };

  const getOptions = () => {
    const canSeeAllStatuses =
      user?.role?.includes("admin") ||
      (user?.role?.includes("hod") && user?.role?.includes("purchasing"));

    if (canSeeAllStatuses) {
      return [
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
    } else if (user?.role?.includes("hod")) {
      return [
        { value: "all", label: "All Statuses" },
        { value: "on_hold_tr", label: "For TR Approval" },
        { value: "on_hold", label: "For HOD Approval" },
        { value: "for_approval", label: "For Purchase Order Creation" },
        { value: "Rejected", label: "Rejected" },
        { value: "returned", label: "Returned" },
        { value: "on_hold_return", label: "On Hold For Edit" },
        { value: "partial_po", label: "Partial PO" },
        { value: "drafted", label: "Drafted" },
      ];
    } else if (user?.role?.includes("tr")) {
      return [
        { value: "on_hold_tr", label: "For TR Approval" },
        { value: "for_approval", label: "For Purchase Order Creation" },
        { value: "Rejected", label: "Rejected" },
        { value: "returned", label: "Returned" },
        { value: "on_hold_return", label: "On Hold For Edit" },
        { value: "drafted", label: "Drafted" },
      ];
    } else if (user?.role?.includes("purchasing")) {
      return [
        { value: "all", label: "All Statuses" },
        { value: "for_approval", label: "For Purchase Order Creation" },
        { value: "for_approval_ceo", label: "For Approval" },
        { value: "Cancelled", label: "Cancelled" },
        { value: "Rejected", label: "Rejected" },
        { value: "returned", label: "Returned" },
        { value: "closed", label: "Closed" },
        { value: "on_hold_return", label: "On Hold For Edit" },
        { value: "partial_po", label: "Partial PO" },
        { value: "drafted", label: "Drafted" },
      ];
    } else {
      return [
        { value: "all", label: "All Statuses" },
        { value: "on_hold", label: "For HOD Approval" },
        { value: "on_hold_tr", label: "For TR Approval" },
        { value: "for_approval", label: "For Purchase Order Creation" },
        { value: "for_approval_ceo", label: "For Approval" },
        { value: "approved", label: "Approved POs" },
        { value: "Cancelled", label: "Cancelled" },
        { value: "Rejected", label: "Rejected" },
        { value: "returned", label: "Returned" },
        { value: "closed", label: "Closed" },
        { value: "on_hold_return", label: "On Hold For Edit" },
        { value: "drafted", label: "Drafted" },
      ];
    }
  };

  const selectedValue =
    statusTerm === "For_approval"
      ? "for_approval_ceo"
      : prStatusTerm || statusTerm || "all";

  return (
    <Select value={selectedValue} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-auto">
        <SelectValue placeholder="Filter by Status" />
      </SelectTrigger>
      <SelectContent>
        {getOptions().map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
