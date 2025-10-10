import { ISeatConfigurationRepository, SeatConfiguration as SeatConfigurationType } from '@swivel-portal/types';
import { SeatConfiguration } from '../models/SeatConfiguration.js';

export class SeatConfigurationRepository implements ISeatConfigurationRepository<SeatConfigurationType> {
  async getById(id: string): Promise<SeatConfigurationType | null> {
    try {
      const config = await SeatConfiguration.findById(id).exec();
      if (!config) {
        return null;
      }
      return config.toObject() as SeatConfigurationType;
    } catch (error) {
      console.log('Error fetching seat configuration by ID:', error);
      return null;
    }
  }

  async create(item: SeatConfigurationType): Promise<SeatConfigurationType> {
    const newConfig = new SeatConfiguration(item);
    await newConfig.save();
    return newConfig.toObject() as SeatConfigurationType;
  }

  async update(id: string, item: Partial<SeatConfigurationType>): Promise<SeatConfigurationType | null> {
    try {
      const config = await SeatConfiguration.findByIdAndUpdate(id, item, { new: true }).exec();
      if (!config) {
        return null;
      }
      return config.toObject() as SeatConfigurationType;
    } catch (error) {
      console.log('Error updating seat configuration:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await SeatConfiguration.findByIdAndDelete(id).exec();
      return result !== null;
    } catch (error) {
      console.log('Error deleting seat configuration:', error);
      return false;
    }
  }

  /**
   * Get the default seat configuration (singleton pattern)
   * Returns the first configuration document found
   */
  async getDefaultConfig(): Promise<SeatConfigurationType | null> {
    try {
      const config = await SeatConfiguration.findOne().exec();
      if (!config) {
        return null;
      }
      return config.toObject() as SeatConfigurationType;
    } catch (error) {
      console.log('Error fetching default seat configuration:', error);
      return null;
    }
  }
}

