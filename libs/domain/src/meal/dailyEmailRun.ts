import { connectToDb, RepositoryContext } from '@swivel-portal/dal';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import * as XLSX from 'xlsx';


const ses = new SESClient({});

function getTodayDateStr() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}



// Count bookings by meal type
function getMealTypeCounts(bookings: any[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const b of bookings) {
    const meal = b.lunchOption || '-';
    counts[meal] = (counts[meal] || 0) + 1;
  }
  return counts;
}

// Generate HTML for meal type counts
function generateMealTypeCountsHtml(counts: Record<string, number>): string {
  let html = '<ul style="margin:8px 0 16px 0;padding-left:20px">';
  for (const [meal, count] of Object.entries(counts)) {
    html += `<li><b>${meal}</b>: ${count}</li>`;
  }
  html += '</ul>';
  return html;
}
function generateDetailedBookingsSheet(bookings: any[]) {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Name', 'Duration', 'Meal'],
    ...bookings.map(b => [
      (b.user && b.user.name && b.user.name.trim())
        ? b.user.name
        : (b.userName && b.userName.trim())
          ? b.userName
          : b.userId || '',
      b.duration || b.durationType || '',
      b.lunchOption || '',
    ]),
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

// Generate HTML table with Name and Meal
function generateBookingsTableHtml(bookings: any[]) {
    console.log(bookings);
  let html = '<table border="1" cellpadding="4" style="border-collapse:collapse"><tr><th>Name</th><th>Duration</th><th>Meal</th></tr>';
  for (const b of bookings) {
    const name = (b.user && b.user.name && b.user.name.trim())
      ? b.user.name
      : (b.userName && b.userName.trim())
        ? b.userName
        : b.userId || '';
    html += `<tr><td>${name}</td><td>${b.duration || b.durationType || ''}</td><td>${b.lunchOption || '-'}</td></tr>`;
  }
  html += '</table>';
  return html;
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

    // Prepare new content
  // Remove unused summary aggregation
  const detailedSheet = generateDetailedBookingsSheet(bookings);
  const bookingsTableHtml = generateBookingsTableHtml(bookings);
  const mealTypeCounts = getMealTypeCounts(bookings);
  const mealTypeCountsHtml = generateMealTypeCountsHtml(mealTypeCounts);

    const subject = `Meal Booking Summary for ${today}`;
    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px">
        <h2>Meal Booking Summary for ${today}</h2>
        <p>Below is the list of Meal bookings for today:</p>
        ${bookingsTableHtml}
        <div style="margin-top:16px">
          <b>Meal counts:</b>
          ${mealTypeCountsHtml}
        </div>
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
          'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; name="all-bookings.xlsx"',
          'Content-Transfer-Encoding: base64',
          'Content-Disposition: attachment; filename="all-bookings.xlsx"',
          '',
          detailedSheet.toString('base64'),
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