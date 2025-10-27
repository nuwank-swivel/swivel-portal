import { getSeatLayout } from '@swivel-portal/domain';
import { connectToDb } from '@swivel-portal/dal';
import { defineLambda } from '../../lambda/defineLambda';
import { Table } from '@swivel-portal/types';

export const handler = defineLambda<
  never,
  never,
  never,
  {
    tables: Array<Table>;
  }
>({
  log: true,
  handler: async () => {
    await connectToDb();
    const result = await getSeatLayout();
    return result;
  },
});
