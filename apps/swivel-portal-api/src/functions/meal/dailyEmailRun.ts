import { connectToDb, RepositoryContext } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({});

function renderEmail() {
  return {
    subject: 'Today\'s meal booking reminder',
    text: `Please book your meal for today.\n\nOpen the portal to book.`,
    html: `<p>Please book your meal for today.</p><p><a href="${process.env.PORTAL_URL || '#'}">Open Portal</a></p>`,
  };
}

export const handler = defineLambda<never, never, never, { sent: number }>({
  log: true,
  handler: async () => {
    await connectToDb();
    const recipients = await RepositoryContext.mealNotificationSettingsRepository.listAllEnabled();

    if (!process.env.EMAIL_FROM) {
      throw new Error('EMAIL_FROM is not configured');
    }
    const from = process.env.EMAIL_FROM;
    const { subject, text, html } = renderEmail();

    let sent = 0;
    for (const r of recipients) {
      // We need user email. Lookup user by userId (azureAdId)
      const user = await RepositoryContext.userRepository.getByAzureAdId(r.userId);
      if (!user?.email) continue;
      try {
        await ses.send(
          new SendEmailCommand({
            Source: from,
            Destination: { ToAddresses: [user.email] },
            Message: {
              Subject: { Data: subject },
              Body: {
                Text: { Data: text },
                Html: { Data: html },
              },
            },
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


