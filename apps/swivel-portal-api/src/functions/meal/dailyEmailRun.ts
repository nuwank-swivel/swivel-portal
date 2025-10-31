
import { connectToDb, RepositoryContext } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import * as XLSX from 'xlsx';

const ses = new SESClient({});

function getTodayDateStr() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}


function aggregateMealSummary(bookings: any[]) {
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

export const handler = defineLambda<never, never, never, { sent: number }>({
  log: true,
  handler: async () => {
    await connectToDb();
  const recipients = await RepositoryContext.mealNotificationSettingsRepository.listAllEnabled();
  console.log('Meal notification recipients:', recipients);
    if (!process.env.EMAIL_FROM) {
      throw new Error('EMAIL_FROM is not configured');
    }
    const from = process.env.EMAIL_FROM;

    // Get today's bookings and aggregate
    const today = getTodayDateStr();
    const bookings = await RepositoryContext.bookingRepository.findAllBookingsByDate(today);
    const summary = aggregateMealSummary(bookings);
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
      // Try to find user by Azure AD ID first, then by email if not found
      let user = await RepositoryContext.userRepository.getByAzureAdId(r.userId);
      if (!user && r.userId) {
        user = await RepositoryContext.userRepository.getByEmail(r.userId);
      }
      console.log('Recipient:', r, 'Resolved user:', user);
      if (!user?.email) continue;
      try {
        // SES SendRawEmail for attachment
        const boundary = '----=_Part_' + Math.random().toString(36).slice(2);
        const mail = [
          `From: ${from}`,
          `To: ${user.email}`,
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
        await ses.send(
          new SendRawEmailCommand({
            RawMessage: { Data: Buffer.from(mail) },
          })
        );
        sent += 1;
      } catch (err) {
        console.error('Failed to send email to', user.email, err);
      }
    }
    return { sent };
  },
});


