import { useEffect, useState } from "react";
import { PurchaseReport } from "../types";
import { purchaseReportService } from "../purchaseReportService";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth/authStore";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export function useViewPurchaseReport(
  prId: number | null,
  open: boolean,
  onSuccess?: () => void
) {
  const [report, setReport] = useState<PurchaseReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (open && prId) {
      setLoading(true);
      purchaseReportService
        .getById(prId)
        .then(setReport)
        .catch((err) => {
          console.error("Failed to fetch Purchase Request", err);
          setReport(null);
        })
        .finally(() => setLoading(false));
    } else {
      setReport(null);
    }
  }, [prId, open]);

  const fetchReport = async () => {
    if (!prId) return;
    setLoading(true);
    try {
      const data = await purchaseReportService.getById(prId);
      setReport(data);
    } catch (err) {
      console.error("Failed to refetch Purchase Request", err);
      toast.error("Failed to fetch updated report");
    } finally {
      setLoading(false);
    }
  };

// Enhanced PDF export with better image handling
const downloadPDF = async (ref: React.RefObject<HTMLElement | null>) => {
  if (!ref.current) return;

  try {
    // Step 1: Find all signature images and preload them
    const signatureImages = ref.current.querySelectorAll('img[alt*="signature"]') as NodeListOf<HTMLImageElement>;
    console.log('Found signature images:', signatureImages.length);
    
    // Step 2: Convert each signature to base64 and replace src
    const imagePromises = Array.from(signatureImages).map(async (img) => {
      try {
        const originalSrc = img.src;
        console.log('Converting image:', originalSrc);
        
        // Method 1: Try fetch first (for CORS-enabled images)
        try {
          const response = await fetch(originalSrc, {
            mode: 'cors',
            credentials: 'include'
          });
          
          if (response.ok) {
            const blob = await response.blob();
            return new Promise<void>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                img.src = reader.result as string;
                console.log('Image converted via fetch');
                resolve();
              };
              reader.readAsDataURL(blob);
            });
          }
        } catch (fetchError) {
          console.log('Fetch failed, trying canvas method:', fetchError);
        }
        
        // Method 2: Canvas method as fallback
        return new Promise<void>((resolve, reject) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const tempImg = new Image();
          
          tempImg.crossOrigin = 'anonymous';
          tempImg.onload = () => {
            canvas.width = tempImg.width;
            canvas.height = tempImg.height;
            ctx?.drawImage(tempImg, 0, 0);
            
            try {
              const base64 = canvas.toDataURL('image/png');
              img.src = base64;
              console.log('Image converted via canvas');
              resolve();
            } catch (canvasError) {
              console.error('Canvas conversion failed:', canvasError);
              resolve(); // Continue even if this fails
            }
          };
          
          tempImg.onerror = () => {
            console.error('Image load failed:', originalSrc);
            resolve(); // Continue even if this fails
          };
          
          tempImg.src = originalSrc;
          
          // Timeout after 10 seconds
          setTimeout(() => {
            console.log('Image conversion timeout');
            resolve();
          }, 10000);
        });
        
      } catch (error) {
        console.error('Error converting image:', error);
        return Promise.resolve(); // Continue even if conversion fails
      }
    });

    // Step 3: Wait for all images to be converted
    await Promise.all(imagePromises);
    console.log('All images processed');
    
    // Step 4: Wait a bit more for DOM updates
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 5: Generate PDF with enhanced options
    const canvas = await html2canvas(ref.current, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      imageTimeout: 0, // Disable timeout since we pre-loaded images
      removeContainer: true,
      ignoreElements: (element) => {
        // Skip elements that might cause issues
        return element.tagName === 'SCRIPT' || element.tagName === 'NOSCRIPT';
      },
      onclone: (clonedDoc) => {
        // Ensure cloned images have proper styling
        const clonedImages = clonedDoc.querySelectorAll('img');
        clonedImages.forEach((img: HTMLImageElement) => {
          img.style.maxWidth = 'none';
          img.style.maxHeight = 'none';
          img.style.objectFit = 'contain';
        });
      }
    });

    const imgData = canvas.toDataURL("image/png", 0.95);
    const pdf = new jsPDF("p", "mm", "a4");

    // Page setup
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    // Calculate dimensions
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

    // Handle multi-page if needed
    if (imgHeight > contentHeight) {
      const totalPages = Math.ceil(imgHeight / contentHeight);
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        const yOffset = -(page * contentHeight);
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin + yOffset,
          contentWidth,
          imgHeight
        );
      }
    } else {
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin,
        contentWidth,
        imgHeight
      );
    }

    pdf.save(`Purchase_Requisition_${prId}.pdf`);
    toast.success("PDF downloaded successfully!");
    
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    toast.error("Failed to generate PDF. Please try again.");
  }
};

// Alternative simpler method - sometimes less is more
const downloadPDFSimple = async (ref: React.RefObject<HTMLElement | null>) => {
  if (!ref.current) return;

  try {
    // Just ensure all images are loaded before capturing
    const images = ref.current.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
    
    const imageLoadPromises = Array.from(images).map(img => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if image fails
          // Timeout after 5 seconds
          setTimeout(() => resolve(), 5000);
        }
      });
    });

    await Promise.all(imageLoadPromises);
    
    // Simple html2canvas with minimal options
    const canvas = await html2canvas(ref.current, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", margin, margin, contentWidth, imgHeight);
    pdf.save(`Purchase_Requisition_${prId}.pdf`);
    toast.success("PDF downloaded successfully!");
    
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    toast.error("Failed to generate PDF. Please try again.");
  }
};


  // --- existing action handlers ---
  const handleItemAction = (index: number, action: "approve" | "reject") => {
    setCurrentItemIndex(index);
    setActionType(action);
    setOpenModal(true);
  };

  const confirmItemAction = async (
    remark: string,
    asRole?: "technical_reviewer" | "hod" | "both"
  ) => {
    if (!report) return;

    const pendingCount =
      report.item_status?.filter(
        (s: string) => s === "pending" || s === "pending_tr"
      ).length ?? 0;

    const effectiveRole = pendingCount === 1 ? asRole : undefined;

    toast.promise(
      purchaseReportService.updateItemStatus(
        report.id,
        currentItemIndex,
        actionType === "approve" ? "approved" : "rejected",
        remark,
        effectiveRole,
        user?.id
      ),
      {
        loading: "Updating item...",
        success: (updated) => {
          setReport(updated);
          setOpenModal(false);
          fetchReport();
          onSuccess?.();
          return `Item ${currentItemIndex + 1} ${
            actionType === "approve" ? "approved" : "rejected"
          } successfully`;
        },
        error: "Failed to update item status. Please try again.",
      }
    );
  };

  const isItemProcessed = (idx: number) => {
    const status = report?.item_status?.[idx];
    return (
      status === "approved" ||
      status === "rejected" ||
      status === "approved_tr" ||
      status === "rejected_tr"
    );
  };

  const handleHodTrAction = async (idx: number) => {
    if (!report) return;
    try {
      await purchaseReportService.updateItemStatusOnly(
        report.id,
        idx,
        "pending_tr"
      );
      fetchReport();
      toast.success(`Item ${idx + 1} marked as pending_tr successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update item status.");
    }
  };

  const isDropdownDisabled = (idx: number) => {
    const userRole = user?.role ?? [];
    const itemStatus = report?.item_status?.[idx];
    const itemTag = report?.tag?.[idx];

    if (isItemProcessed(idx)) {
      return true;
    }

    if (
      !userRole.includes("hod") &&
      !userRole.includes("technical_reviewer") &&
      !userRole.includes("admin")
    ) {
      return true;
    }

    if (
      userRole.includes("technical_reviewer") &&
      !userRole.includes("admin")
    ) {
      return !itemTag?.endsWith("_tr") || itemStatus !== "pending_tr";
    }

    if (userRole.includes("hod") && !userRole.includes("admin")) {
      return itemTag?.endsWith("_tr") || itemStatus !== "pending";
    }

    if (userRole.includes("admin")) {
      return itemStatus !== "pending" && itemStatus !== "pending_tr";
    }

    return true;
  };

  return {
    report,
    loading,
    openModal,
    setOpenModal,
    actionType,
    handleItemAction,
    handleHodTrAction,
    confirmItemAction,
    isItemProcessed,
    isDropdownDisabled,
    fetchReport,
    downloadPDF,
    downloadPDFSimple
  };
}
