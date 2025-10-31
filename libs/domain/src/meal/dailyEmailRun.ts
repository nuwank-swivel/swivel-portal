import { connectToDb, RepositoryContext } from '@swivel-portal/dal';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import * as XLSX from 'xlsx';
import { Booking } from '@swivel-portal/dal';

const ses = new SESClient({});

function getTodayDateStr() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function aggregateMealSummary(bookings: Booking[]) {
  const summary: Record<string, number> = {};
  for (const b of bookings) {
    const opt = b.lunchOption || 'none';
    summary[opt] = (summary[opt] || 0) + 1;
  }
  return summary;
}

function generateSummaryTableHtml(summary: Record<string, number>) {
  let html = '<table border="1" cellpadding="4" style="border-collapse:collapse"><tr><th>Meal Option</th><th>Count</th></tr>';
  for (const [option, count] of Object.entries(summary)) {
    html += `<tr><td>${option}</td><td>${count}</td></tr>`;
  }
  html += '</table>';
  return html;
}

function generateSummarySheet(summary: Record<string, number>) {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Meal name', 'Count'],
    ...Object.entries(summary),
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Summary');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

export async function runDailyMealSummaryEmail(): Promise<{ sent: number }> {
  try {
    console.log('[MealEmail] Connecting to DB...');
    await connectToDb();
    console.log('[MealEmail] Fetching enabled recipients...');
    const recipients = await RepositoryContext.mealNotificationSettingsRepository.listAllEnabled();
    console.log(`[MealEmail] Recipients:`, recipients);
    if (!process.env.EMAIL_FROM) {
      console.error('[MealEmail] EMAIL_FROM is not configured');
      throw new Error('EMAIL_FROM is not configured');
    }
    const from = process.env.EMAIL_FROM;

    // Get today's bookings and aggregate
    const today = getTodayDateStr();
    console.log(`[MealEmail] Fetching bookings for ${today}...`);
    const bookings = await RepositoryContext.bookingRepository.findAllBookingsByDate(today);
    console.log(`[MealEmail] Bookings:`, bookings);
    const summary = aggregateMealSummary(bookings);
    console.log('[MealEmail] Summary:', summary);
    const summaryHtml = generateSummaryTableHtml(summary);
    const summarySheet = generateSummarySheet(summary);

    const subject = `Meal Booking Summary for ${today}`;
    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px">
        <h2>Meal Booking Summary for ${today}</h2>
        <p>Below is the summary of meal bookings for today. See the attached Excel file for download.</p>
        ${summaryHtml}
        <p style="margin-top:24px">You can also <a href="${process.env.PORTAL_URL || '#'}">open the portal</a> to view or manage bookings.</p>
      </div>
    `;

    let sent = 0;
    for (const r of recipients) {
      try {
        // r.userEmail is guaranteed
        const userEmail = r.userEmail;
        if (!userEmail) {
          console.warn('[MealEmail] Skipping recipient with no userEmail:', r);
          continue;
        }
        const boundary = '----=_Part_' + Math.random().toString(36).slice(2);
        const mail = [
          `From: ${from}`,
          `To: ${userEmail}`,
          `Subject: ${subject}`,
          'MIME-Version: 1.0',
          `Content-Type: multipart/mixed; boundary="${boundary}"`,
          '',
          `--${boundary}`,
          'Content-Type: text/html; charset=UTF-8',
          'Content-Transfer-Encoding: 7bit',
          '',
          htmlBody,
          '',
          `--${boundary}`,
          'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; name="meal-summary.xlsx"',
          'Content-Transfer-Encoding: base64',
          'Content-Disposition: attachment; filename="meal-summary.xlsx"',
          '',
          summarySheet.toString('base64'),
          '',
          `--${boundary}--`,
          '',
        ].join('\r\n');
        console.log(`[MealEmail] Sending email to ${userEmail}...`);
        await ses.send(
          new SendRawEmailCommand({
            RawMessage: { Data: Buffer.from(mail) },
          })
        );
        sent += 1;
        console.log(`[MealEmail] Email sent to ${userEmail}`);
      } catch (err) {
        console.error('[MealEmail] Failed to send email to recipient', r, err);
      }
    }
    console.log(`[MealEmail] Finished sending. Total sent: ${sent}`);
    return { sent };
  } catch (err) {
    console.error('[MealEmail] Fatal error in daily email run:', err);
    throw err;
  }
}