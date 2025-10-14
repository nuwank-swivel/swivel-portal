import * as XLSX from 'xlsx';

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
    if (!bookings || bookings.length === 0 || !date) return;
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
  };
}
