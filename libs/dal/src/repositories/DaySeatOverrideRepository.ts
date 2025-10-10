import { IDaySeatOverrideRepository, DaySeatOverride as DaySeatOverrideType } from '@swivel-portal/types';
import { DaySeatOverride } from '../models/DaySeatOverride.js';

export class DaySeatOverrideRepository implements IDaySeatOverrideRepository<DaySeatOverrideType> {
  async getById(id: string): Promise<DaySeatOverrideType | null> {
    try {
      const override = await DaySeatOverride.findById(id).exec();
      if (!override) {
        return null;
      }
      return override.toObject() as DaySeatOverrideType;
    } catch (error) {
      console.log('Error fetching day seat override by ID:', error);
      return null;
    }
  }

  async create(item: DaySeatOverrideType): Promise<DaySeatOverrideType> {
    const newOverride = new DaySeatOverride(item);
    await newOverride.save();
    return newOverride.toObject() as DaySeatOverrideType;
  }

  async update(id: string, item: Partial<DaySeatOverrideType>): Promise<DaySeatOverrideType | null> {
    try {
      const override = await DaySeatOverride.findByIdAndUpdate(id, item, { new: true }).exec();
      if (!override) {
        return null;
      }
      return override.toObject() as DaySeatOverrideType;
    } catch (error) {
      console.log('Error updating day seat override:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await DaySeatOverride.findByIdAndDelete(id).exec();
      return result !== null;
    } catch (error) {
      console.log('Error deleting day seat override:', error);
      return false;
    }
  }

  /**
   * Get seat override for a specific date
   */
  async getByDate(date: string): Promise<DaySeatOverrideType | null> {
    try {
      const override = await DaySeatOverride.findOne({ date }).exec();
      if (!override) {
        return null;
      }
      return override.toObject() as DaySeatOverrideType;
    } catch (error) {
      console.log('Error fetching day seat override by date:', error);
      return null;
    }
  }
}

