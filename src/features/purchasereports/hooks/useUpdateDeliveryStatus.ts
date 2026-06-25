import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseReportService } from "../purchaseReportService";
import { toast } from "sonner";

export function useUpdateDeliveryStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      id,
      delivery_status,
    }: {
      id: number;
      delivery_status: "pending" | "delivered" | "partial";
    }) => purchaseReportService.updateDeliveryStatus(id, delivery_status),

    onMutate: async ({ id, delivery_status }) => {
      // Optimistic update for better UX
      await queryClient.cancelQueries({ queryKey: ["purchaseReports"] });

      const previousData = queryClient.getQueryData(["purchaseReports"]);

      queryClient.setQueryData(["purchaseReports"], (old: any) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.map((r: any) =>
            r.id === id ? { ...r, delivery_status } : r
          ),
        };
      });

      return { previousData };
    },

    onSuccess: () => {
      toast.success("Delivery status updated successfully 🎉");
    },

    onError: (_error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["purchaseReports"], context.previousData);
      }
      toast.error("Failed to update delivery status");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseReports"] });
    },
  });

  return {
    updateDeliveryStatus: mutation.mutate,
    updating: mutation.isPending,
  };
}
