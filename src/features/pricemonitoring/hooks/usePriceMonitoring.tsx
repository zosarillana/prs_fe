import { useMutation } from "@tanstack/react-query";
import { priceMonitoringService } from "../priceMonitoringService";
import { toast } from "sonner"; // or whatever toast lib you use

export function usePriceMonitoringHook() {
  return useMutation({
    mutationFn: (file: File) => priceMonitoringService.importExcel(file),

    onSuccess: (data) => {
      toast.success(data?.message || "Import completed successfully");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to import Excel file"
      );
    },
  });
}
