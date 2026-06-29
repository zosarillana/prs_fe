import { PurchaseReport } from "@/features/purchasereports/types";
export type PdfExportParams<T extends HTMLElement> = {
  ref: React.RefObject<T | null>;
  report: PurchaseReport | null;
  setIsExporting: (v: boolean) => void;
};
