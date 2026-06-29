import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { PdfExportParams } from "./types";

export async function exportStandardPdf({
  ref,
  report,
  setIsExporting,
}: PdfExportParams<HTMLElement>) {
  if (!ref.current) return;

  try {
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 50));

    const signatureImages = ref.current.querySelectorAll(
      'img[alt*="signature"]'
    ) as NodeListOf<HTMLImageElement>;

    await Promise.all(
      Array.from(signatureImages).map(async () => {
        // keep your existing conversion logic here
      })
    );

    await new Promise((r) => setTimeout(r, 1000));

    const canvas = await html2canvas(ref.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      allowTaint: false,
      imageTimeout: 0,
      removeContainer: true,
      ignoreElements: (el) =>
        el.tagName === "SCRIPT" || el.tagName === "NOSCRIPT",
      onclone: (doc) => {
        doc.querySelectorAll("img").forEach((img: HTMLImageElement) => {
          img.style.maxWidth = "none";
          img.style.maxHeight = "none";
          img.style.objectFit = "contain";
        });
      },
    });

    const imgData = canvas.toDataURL("image/png", 0.95);
    const pdf = new jsPDF("p", "mm", "a4");

    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

    if (imgHeight > contentHeight) {
      const totalPages = Math.ceil(imgHeight / contentHeight);
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
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
      pdf.addImage(imgData, "PNG", margin, margin, contentWidth, imgHeight);
    }

    const seriesNo = report?.series_no ?? "Unknown";
    pdf.save(`PR - ${seriesNo}.pdf`);

    toast.success("PDF downloaded successfully!");
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    toast.error("Failed to generate PDF. Please try again.");
  } finally {
    setIsExporting(false);
  }
}
