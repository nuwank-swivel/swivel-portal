import * as XLSX from 'xlsx';
import { Logger } from '@/lib/logger';

export interface ExportableBooking {
  userId: string;
  userName: string;
  durationType: string;
  lunchOption?: string;
}

/**
 * Hook to provide a function to export bookings as an Excel file.
 * @returns (bookings, date) => void
 */
export function useExportBookingsExcel() {
  return (bookings: ExportableBooking[], date: Date | null) => {
    Logger.info('[booking] Excel export requested', {
      total: bookings?.length ?? 0,
      hasDate: Boolean(date),
    });
    if (!bookings || bookings.length === 0 || !date) {
      Logger.warn('[booking] Excel export skipped due to missing data', {
        total: bookings?.length ?? 0,
        hasDate: Boolean(date),
      });
      return;
    }
    const wsData = bookings.map((b) => ({
      Name: b.userName || b.userId,
      Duration: b.durationType,
      Meal: b.lunchOption || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const filename = `bookings-${yyyy}-${mm}-${dd}.xlsx`;
    XLSX.writeFile(wb, filename);
    Logger.info('[booking] Excel export completed', {
      filename,
      total: bookings.length,
    });
  };
}
