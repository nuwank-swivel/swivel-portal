import { PresenceEvent } from '../models/PresenceEvent.js';
import { BaseRepository } from './BaseRepository.js';

export class PresenceEventRepository extends BaseRepository<PresenceEvent> {
  constructor() {
    super(PresenceEvent);
  }

  async findByUser(userId: string): Promise<PresenceEvent[]> {
    return this.repository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }

  async findByDate(date: string): Promise<PresenceEvent[]> {
    // Use aggregation pipeline for lookup
    const start = new Date(date + 'T00:00:00.000Z');
    const end = new Date(date + 'T23:59:59.999Z');
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: start, $lte: end },
        },
      },
      // Lookup user info
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'azureAdId',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $addFields: {
          'user.teamId': {
            $cond: [
              {
                $and: [
                  { $ne: ['$user.teamId', null] },
                  { $ne: [{ $type: '$user.teamId' }, 'objectId'] },
                ],
              },
              { $toObjectId: '$user.teamId' },
              '$user.teamId',
            ],
          },
        },
      },
      // Lookup team info
      {
        $lookup: {
          from: 'teams',
          localField: 'user.teamId',
          foreignField: '_id',
          as: 'team',
        },
      },
      { $unwind: '$team' },

      // Sort by timestamp desc
      { $sort: { timestamp: -1 } },
      // Project desired fields
      {
        $project: {
          _id: 1,
          userId: 1,
          event: 1,
          eta: 1,
          timestamp: 1,
          message: 1,
          userName: '$user.name',
          teamName: '$team.name',
          teamId: '$team._id',
        },
      },
    ];
    return await this.repository.aggregate(pipeline).toArray();
  }

  async findByUserAndDate(
    userId: string,
    date: string
  ): Promise<PresenceEvent[]> {
    const start = new Date(date + 'T00:00:00.000Z');
    const end = new Date(date + 'T23:59:59.999Z');
    return this.repository.find({
      where: {
        userId,
        timestamp: { $gte: start, $lte: end },
      },
      order: { timestamp: 'DESC' },
    });
  }

  async findAll(): Promise<PresenceEvent[]> {
    return this.repository.find();
  }

  // Find all presence events for users in a team for a specific date
  async findByTeamAndDate(teamId: string, date: string): Promise<any[]> {
    // Use aggregation pipeline for lookup
    const start = new Date(date + 'T00:00:00.000Z');
    const end = new Date(date + 'T23:59:59.999Z');
    const pipeline = [
      {
        $match: {
          timestamp: { $gte: start, $lte: end },
        },
      },
      // Lookup user info
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'azureAdId',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $addFields: {
          'user.teamId': {
            $cond: [
              {
                $and: [
                  { $ne: ['$user.teamId', null] },
                  { $ne: [{ $type: '$user.teamId' }, 'objectId'] },
                ],
              },
              { $toObjectId: '$user.teamId' },
              '$user.teamId',
            ],
          },
        },
      },
      // Match team
      { $match: { 'user.teamId': teamId } },
      // Lookup team info
      {
        $lookup: {
          from: 'teams',
          localField: 'user.teamId',
          foreignField: '_id',
          as: 'team',
        },
      },
      { $unwind: '$team' },
      // Sort by timestamp desc
      { $sort: { timestamp: -1 } },
      // Project desired fields
      {
        $project: {
          _id: 1,
          userId: 1,
          event: 1,
          eta: 1,
          timestamp: 1,
          message: 1,
          userName: '$user.name',
          teamName: '$team.name',
          teamId: '$team._id',
        },
      },
    ];
    return await this.repository.aggregate(pipeline).toArray();
  }
}
