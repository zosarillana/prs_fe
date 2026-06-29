import html2canvas from "html2canvas";
import { PdfExportParams } from "./types";
import jsPDF from "jspdf";
import { toast } from "sonner";

export async function exportPaginatedPdf({
  ref,
  report,
  setIsExporting,
}: PdfExportParams<HTMLElement>) {
  const downloadPaginatedPDF = async (
    ref: React.RefObject<HTMLDivElement | null>,
  ) => {
    if (!ref.current) return;

    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 80));

    try {
      const rows = Array.from(
        ref.current.querySelectorAll("tbody tr"),
      ) as HTMLElement[];

      const signatures = ref.current.querySelector(
        "#signature-section",
      ) as HTMLElement;

      const headerSection = ref.current.querySelector(
        ".flex.flex-col.items-center.mb-5",
      )?.parentElement as HTMLElement;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - 20;
      const margin = 10;

      // Available height for content (excluding margins and page number space)
      const availableHeight = pageHeight - margin * 2 - 15; // 15mm for page number

      // ✅ MEASURE HEADER HEIGHT FIRST
      const tempContainer = document.createElement("div");
      tempContainer.style.width = "800px";
      tempContainer.style.padding = "20px";
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.background = "white";

      if (headerSection) {
        const headerClone = document.createElement("div");

        const logoSection = headerSection.querySelector(
          ".flex.flex-col.items-center.mb-5",
        );
        if (logoSection) headerClone.appendChild(logoSection.cloneNode(true));

        const title = headerSection.querySelector(
          "p.mt-3.text-lg.text-center.font-semibold.mb-2",
        );
        if (title) headerClone.appendChild(title.cloneNode(true));

        const infoSection = headerSection.querySelector(".space-y-4.text-sm");
        if (infoSection) {
          const infoClone = document.createElement("div");
          infoClone.className = "space-y-4 text-sm mb-4";
          const gridSection = infoSection.querySelector(
            ".grid.grid-cols-1.gap-4",
          );
          if (gridSection) infoClone.appendChild(gridSection.cloneNode(true));
          headerClone.appendChild(infoClone);
        }

        tempContainer.appendChild(headerClone);
      }

      // Add table header to measure
      const headerClone = ref.current.querySelector("thead")?.cloneNode(true);
      const tempTable = document.createElement("table");
      tempTable.style.width = "100%";
      if (headerClone) tempTable.appendChild(headerClone);
      tempContainer.appendChild(tempTable);

      document.body.appendChild(tempContainer);
      await new Promise((r) => setTimeout(r, 10));

      const headerCanvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
      });

      const headerHeightPx = headerCanvas.height;
      const headerHeightMm =
        (headerHeightPx / headerCanvas.width) * contentWidth;

      document.body.removeChild(tempContainer);

      // ✅ MEASURE EACH ROW HEIGHT
      const rowHeights: number[] = [];
      for (const row of rows) {
        const rowContainer = document.createElement("div");
        rowContainer.style.width = "800px";
        rowContainer.style.position = "absolute";
        rowContainer.style.left = "-9999px";

        const table = document.createElement("table");
        table.style.width = "100%";
        table.appendChild(row.cloneNode(true));
        rowContainer.appendChild(table);

        document.body.appendChild(rowContainer);
        await new Promise((r) => setTimeout(r, 5));

        const rowCanvas = await html2canvas(rowContainer, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#fff",
        });

        const rowHeightMm = (rowCanvas.height / rowCanvas.width) * contentWidth;
        rowHeights.push(rowHeightMm);

        document.body.removeChild(rowContainer);
      }

      // ✅ MEASURE SIGNATURE HEIGHT
      let signatureHeightMm = 0;
      if (signatures) {
        const sigContainer = document.createElement("div");
        sigContainer.style.width = "800px";
        sigContainer.style.position = "absolute";
        sigContainer.style.left = "-9999px";
        sigContainer.appendChild(signatures.cloneNode(true));

        document.body.appendChild(sigContainer);
        await new Promise((r) => setTimeout(r, 10));

        const sigCanvas = await html2canvas(sigContainer, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#fff",
        });

        signatureHeightMm =
          (sigCanvas.height / sigCanvas.width) * contentWidth + 10; // +10mm margin
        document.body.removeChild(sigContainer);
      }

      // ✅ DISTRIBUTE ROWS ACROSS PAGES BASED ON HEIGHT
      const pages: number[][] = [];
      let currentPage: number[] = [];
      let currentHeight = headerHeightMm;

      for (let i = 0; i < rows.length; i++) {
        const isLastRow = i === rows.length - 1;
        const rowHeight = rowHeights[i];
        const requiredHeight = isLastRow
          ? currentHeight + rowHeight + signatureHeightMm
          : currentHeight + rowHeight;

        if (requiredHeight > availableHeight && currentPage.length > 0) {
          // Start new page
          pages.push([...currentPage]);
          currentPage = [i];
          currentHeight = headerHeightMm + rowHeight;
        } else {
          currentPage.push(i);
          currentHeight += rowHeight;
        }
      }

      if (currentPage.length > 0) {
        pages.push(currentPage);
      }

      // ✅ GENERATE PDF PAGES
      const totalPages = pages.length;

      for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        if (pageIdx > 0) pdf.addPage();

        const pageContainer = document.createElement("div");
        pageContainer.style.width = "800px";
        pageContainer.style.padding = "20px";
        pageContainer.style.background = "white";

        // Add header
        if (headerSection) {
          const headerClone = document.createElement("div");

          const logoSection = headerSection.querySelector(
            ".flex.flex-col.items-center.mb-5",
          );
          if (logoSection) headerClone.appendChild(logoSection.cloneNode(true));

          const title = headerSection.querySelector(
            "p.mt-3.text-lg.text-center.font-semibold.mb-2",
          );
          if (title) headerClone.appendChild(title.cloneNode(true));

          const infoSection = headerSection.querySelector(".space-y-4.text-sm");
          if (infoSection) {
            const infoClone = document.createElement("div");
            infoClone.className = "space-y-4 text-sm mb-4";
            const gridSection = infoSection.querySelector(
              ".grid.grid-cols-1.gap-4",
            );
            if (gridSection) infoClone.appendChild(gridSection.cloneNode(true));
            headerClone.appendChild(infoClone);
          }

          pageContainer.appendChild(headerClone);
        }

        // Add table with rows for this page
        const tableHeader = ref.current.querySelector("thead")?.cloneNode(true);
        const newTable = document.createElement("table");
        newTable.style.width = "100%";
        newTable.style.borderCollapse = "collapse";

        if (tableHeader) newTable.appendChild(tableHeader);

        const newBody = document.createElement("tbody");
        pages[pageIdx].forEach((rowIdx) => {
          newBody.appendChild(rows[rowIdx].cloneNode(true));
        });

        newTable.appendChild(newBody);
        pageContainer.appendChild(newTable);

        // Add signatures on last page
        if (pageIdx === totalPages - 1 && signatures) {
          const signatureClone = signatures.cloneNode(true) as HTMLElement;
          signatureClone.style.marginTop = "40px";
          pageContainer.appendChild(signatureClone);
        }

        document.body.appendChild(pageContainer);

        // Wait for images
        const images = pageContainer.querySelectorAll("img");
        await Promise.all(
          Array.from(images).map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete) resolve();
                else {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                  setTimeout(() => resolve(), 3000);
                }
              }),
          ),
        );

        const canvas = await html2canvas(pageContainer, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#fff",
          allowTaint: false,
          imageTimeout: 0,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", margin, margin, contentWidth, imgHeight);

        // ✅ Add page number at TOP RIGHT
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `Page ${pageIdx + 1} of ${totalPages}`,
          pageWidth - margin,
          margin + 5,
          { align: "right" },
        );

        document.body.removeChild(pageContainer);
      }

      const seriesNo = report?.series_no ?? "Unknown";
      pdf.save(`PR - ${seriesNo}.pdf`);
      toast.success("PDF downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("PDF generation failed");
    }

    setIsExporting(false);
  };
}
