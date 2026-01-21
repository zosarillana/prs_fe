import html2canvas from "html2canvas";
import { PdfExportParams } from "./types";
import jsPDF from "jspdf";
import { toast } from "sonner";

export async function exportSimplePdf({
  ref,
  report,
  setIsExporting,
}: PdfExportParams<HTMLElement>) {
   const downloadPDFSimple = async (
    ref: React.RefObject<HTMLElement | null>
  ) => {
    if (!ref.current) return;

    try {
      setIsExporting(true);
      await new Promise((r) => setTimeout(r, 50));

      // Wait for images
      const images = ref.current.querySelectorAll(
        "img"
      ) as NodeListOf<HTMLImageElement>;
      const imagePromises = Array.from(images).map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) resolve();
            else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
              setTimeout(() => resolve(), 5000);
            }
          })
      );

      await Promise.all(imagePromises);

      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: false,
        imageTimeout: 0,
        removeContainer: true,
        onclone: (clonedDoc) => {
          // Fix image sizing
          clonedDoc.querySelectorAll("img").forEach((img) => {
            const htmlImg = img as HTMLImageElement;
            htmlImg.style.maxWidth = "none";
            htmlImg.style.maxHeight = "none";
            htmlImg.style.objectFit = "contain";
          });

          // ✅ Preserve spacing and layout
          clonedDoc.querySelectorAll("table").forEach((table) => {
            const htmlTable = table as HTMLElement;
            htmlTable.style.borderCollapse = "separate";
            htmlTable.style.borderSpacing = "0";
          });

          // ✅ Fix ALL elements inside table cells
          clonedDoc.querySelectorAll("td, th").forEach((cell) => {
            const htmlCell = cell as HTMLElement;
            const computed = window.getComputedStyle(htmlCell);

            // ✅ Add vertical padding of 12px to tbody cells only
            if (htmlCell.closest("tbody")) {
              htmlCell.style.paddingTop = "6px";
              htmlCell.style.paddingBottom = "20px";
              // Preserve horizontal padding from computed styles
              htmlCell.style.paddingLeft = computed.paddingLeft;
              htmlCell.style.paddingRight = computed.paddingRight;
            } else {
              htmlCell.style.padding = computed.padding;
            }

            htmlCell.style.border = computed.border;
            htmlCell.style.verticalAlign = "middle";

            // ✅ CRITICAL: Remove ALL margins from elements inside cells
            htmlCell.querySelectorAll("*").forEach((child) => {
              const htmlChild = child as HTMLElement;
              htmlChild.style.margin = "0 !important";
              htmlChild.style.marginTop = "0";
              htmlChild.style.marginBottom = "0";
              htmlChild.style.marginLeft = "0";
              htmlChild.style.marginRight = "0";
            });

            // ✅ Also fix the cell's direct children (p, div, etc)
            Array.from(htmlCell.children).forEach((child) => {
              const htmlChild = child as HTMLElement;
              htmlChild.style.margin = "0";
            });
          });

          // ✅ Preserve spacing for non-table elements
          clonedDoc.querySelectorAll("*").forEach((el) => {
            const htmlEl = el as HTMLElement;

            // Skip table cells and their contents
            if (htmlEl.closest("td") || htmlEl.closest("th")) {
              return;
            }

            const computed = window.getComputedStyle(htmlEl);
            if (computed.margin !== "0px") {
              htmlEl.style.margin = computed.margin;
            }
            if (computed.padding !== "0px") {
              htmlEl.style.padding = computed.padding;
            }
          });
        },
      });

      const imgData = canvas.toDataURL("image/png", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");

      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const contentWidth = pageWidth - margin * 2;
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", margin, margin, contentWidth, imgHeight);

      const seriesNo = report?.series_no ?? "Unknown";
      pdf.save(`PR - ${seriesNo}.pdf`);

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

}
