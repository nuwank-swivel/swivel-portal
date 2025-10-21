import { getSeatAvailability } from '@swivel-portal/domain';
import { connectToDb } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import { HttpError, SeatAvailabilityResponse } from '@swivel-portal/types';

export const handler = defineLambda<
  never,
  { date?: string },
  never,
  SeatAvailabilityResponse
>({
  log: true,
  handler: async ({ query }) => {
    await connectToDb();
    const date = query.date as string;
    if (!date) {
      throw new HttpError(400, 'Missing required parameter: date');
    }
    const result = await getSeatAvailability(date);

    return result;
  },
});
