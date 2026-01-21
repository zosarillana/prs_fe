import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

type Params = {
  statusTerm: string;
  prStatusTerm: string;
  setStatusTerm: (v: string) => void;
  setPrStatusTerm: (v: string) => void;
  setCompletedTr: (v: boolean) => void;
  setOwnDepartment: (v: boolean) => void;
};

export function usePurchaseReportUrlSync({
  statusTerm,
  prStatusTerm,
  setStatusTerm,
  setPrStatusTerm,
  setCompletedTr,
  setOwnDepartment,
}: Params) {
  const [searchParams] = useSearchParams();

  const completedTrFromUrl = searchParams.get("completedTr") === "true";
  const ownDepartmentFromUrl = searchParams.get("ownDepartment") === "true";

  const statusFromUrl = searchParams.get("statusTerm") || "";
  const prStatusFromUrl = searchParams.get("prStatusTerm") || "";

  useEffect(() => {
    setCompletedTr(completedTrFromUrl);
  }, [completedTrFromUrl, setCompletedTr]);

  useEffect(() => {
    setOwnDepartment(ownDepartmentFromUrl);
  }, [ownDepartmentFromUrl, setOwnDepartment]);

  useEffect(() => {
    if (statusFromUrl && statusFromUrl !== statusTerm) {
      setStatusTerm(statusFromUrl);
    }
  }, [statusFromUrl, statusTerm, setStatusTerm]);

  useEffect(() => {
    if (prStatusFromUrl && prStatusFromUrl !== prStatusTerm) {
      setPrStatusTerm(prStatusFromUrl);
    }
  }, [prStatusFromUrl, prStatusTerm, setPrStatusTerm]);

  return {
    ownCreated: searchParams.get("ownCreated") === "true",
    completedTr: completedTrFromUrl,
    forCeoApproval: searchParams.get("forCeoApproval") === "true",
    forPoApproval: searchParams.get("forPoApproval") === "true",
    approvedPo: searchParams.get("approvedPo") === "true",
  };
}
