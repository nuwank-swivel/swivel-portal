import { RepositoryContext } from '@swivel-portal/dal';

const TABLE_COUNT = 4;
const SEATS_PER_SIDE = 5;

const getTableLayout = () =>
  Array.from({ length: TABLE_COUNT }, (_, tIdx) => {
    const tableName = `T${tIdx + 1}`;
    return {
      name: tableName,
      seats: [
        ...Array.from({ length: SEATS_PER_SIDE }, (_, i) => ({
          id: `${tableName}A${i + 1}`,
          side: 'A',
          index: i + 1,
        })),
        ...Array.from({ length: SEATS_PER_SIDE }, (_, i) => ({
          id: `${tableName}B${i + 1}`,
          side: 'B',
          index: i + 1,
        })),
      ],
    };
  });

export async function getSeatLayout() {
  let config =
    await RepositoryContext.seatConfigurationRepository.getDefaultConfig();
  if (!config) {
    // 4 tables, 2 sides, 5 seats per side
    const tables = getTableLayout();

    config = await RepositoryContext.seatConfigurationRepository.create({
      defaultSeatCount: 40,
      tables,
      createdAt: new Date(),
      lastModified: new Date(),
    });
  }
  return { tables: config.tables ?? [] };
}
