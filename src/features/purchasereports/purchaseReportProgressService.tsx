import api from "@/lib/api";

interface ProgressEventPayload {
  start_date: string;
  end_date: string;
  title: string;
  remarks?: string;
}

interface ProgressEvent extends ProgressEventPayload {
  id: number;
}

interface PurchaseReportWithProgress {
  id: number;
  series_no: string;
  progresses: ProgressEvent[];
}

export const purchaseReportProgressService = {
  /**
   * Get all progress events for a purchase report
   */
  async getAll(reportId: number): Promise<PurchaseReportWithProgress> {
    const response = await api.get(
      `/api/purchase-reports/${reportId}/progresses`
    );
    return response.data;
  },

  /**
   * Create a new progress event
   */
  async create(
    reportId: number,
    payload: ProgressEventPayload
  ): Promise<ProgressEvent> {
    const response = await api.post(
      `/api/purchase-reports/${reportId}/progresses`,
      payload
    );
    return response.data;
  },

  /**
   * Update a progress event
   */
  async update(
    progressId: number,
    payload: ProgressEventPayload
  ): Promise<ProgressEvent> {
    const response = await api.put(
      `/api/purchase-reports/progresses/${progressId}`,
      payload
    );
    return response.data;
  },

  /**
   * Delete a progress event
   */
  async delete(progressId: number): Promise<void> {
    await api.delete(`/api/purchase-reports/progresses/${progressId}`);
  },
};
