import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

import { VendorPaymentTable } from "../table/vendorPaymentTable";
import { ViewVendorPaymentDialog } from "../components/viewVendorPaymentDialog";
import { CreateVendorPaymentDialog } from "../components/createVendorPaymentDialog";

import { useVendorPaymentDialogs } from "../hooks/useVendorPaymentDialog";
import { useVendorPayments } from "../hooks/useVendorPayment";
import { ViewVendorPaymentPrsPoDialog } from "../components/viewVendorPaymenPrsPoDialog";
import { EditVendorPaymentDialog } from "../components/editVendorPaymentDialog";
import { ServeVendorPaymentDialog } from "../components/serveVendorPaymentDialog";

import { useServeVendorPayment } from "../hooks/useServeVendorPayment";
import { useAuthStore } from "@/store/auth/authStore";

export default function VendorPayment() {
  const { user: currentUser } = useAuthStore();

  const {
    viewPayment,
    createOpen,
    editPayment,
    openViewDialog,
    closeViewDialog,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
  } = useVendorPaymentDialogs();

  const {
    payments,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    getVisiblePages,
    loading,
    refresh,
    searchTerm,
    setSearchTerm,
    deletePayment,
  } = useVendorPayments();

  const serve = useServeVendorPayment(refresh);

  // ✅ State for PR-PO view dialog
  const [prPoDialogOpen, setPrPoDialogOpen] = useState(false);
  const [selectedPrId, setSelectedPrId] = useState<number | null>(null);

  // ✅ Handler to open PR-PO dialog
  const handleViewPrPo = (prsId: number) => {
    setSelectedPrId(prsId);
    setPrPoDialogOpen(true);
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Vendor Payments</h1>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search payments..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // debounced automatically
            />
          </div>

         {(currentUser?.role?.includes("treasury") || currentUser?.role?.includes("admin")) && (
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Payment</span>
              <span className="sm:hidden">Create</span>
            </Button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <VendorPaymentTable
        payments={payments}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalPages={totalPages}
        getVisiblePages={getVisiblePages}
        onView={openViewDialog}
        onViewPrPo={handleViewPrPo} // ✅ pass the new handler
        onEdit={openEditDialog}
        loading={loading} // 🔹 pass your loading state here
        onServeDate={(payment) => serve.openDialog(payment)}
        user={currentUser}
        deletePayment={deletePayment}
      />

      {/* DIALOGS */}
      <ViewVendorPaymentDialog
        open={!!viewPayment}
        payment={viewPayment}
        onOpenChange={closeViewDialog}
      />

      <CreateVendorPaymentDialog
        open={createOpen}
        onOpenChange={closeCreateDialog}
        onSuccess={refresh} // reloads table automatically
        payments={payments}         // pass current payments
      />

      {/* ✅ PR-PO View Dialog */}
      <ViewVendorPaymentPrsPoDialog
        open={prPoDialogOpen}
        onOpenChange={setPrPoDialogOpen}
        prId={selectedPrId}
      />

      {/* ✅ New Edit Dialog */}
      {editPayment && (
        <EditVendorPaymentDialog
          open={!!editPayment}
          payment={editPayment} // pass selected payment
          onOpenChange={closeEditDialog} // close handler
          onSuccess={refresh} // reloads table automatically
          payments={payments}  
        />
      )}

      <ServeVendorPaymentDialog
        open={serve.open}
        onOpenChange={serve.closeDialog}
        selectedDate={serve.selectedDate}
        setDate={serve.setDate}
        onConfirm={serve.confirmServe}
        loading={serve.loading}
        onSuccess={refresh} // reloads table automatically
      />
    </div>
  );
}
