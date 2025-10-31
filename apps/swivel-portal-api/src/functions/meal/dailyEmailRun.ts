


import { runDailyMealSummaryEmail } from '@swivel-portal/domain';
import { defineLambda } from '../../lambda/defineLambda';

export const handler = defineLambda<never, never, never, { sent: number }>({
  log: true,
  handler: async () => {
    return await runDailyMealSummaryEmail();
  },
});


