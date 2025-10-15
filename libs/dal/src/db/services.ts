import { Service } from 'electrodb';
import { DaySeatOverrideEntity } from '../entities/DaySeatOverride.js';
import { SeatBookingEntity } from '../entities/SeatBooking.js';
import { SeatConfigurationEntity } from '../entities/SeatConfiguration.js';
import { UserEntity } from '../entities/User.js';

export const CompanyPortalService = new Service({
  user: UserEntity,
  seatBooking: SeatBookingEntity,
  seatConfiguration: SeatConfigurationEntity,
  daySeatOverride: DaySeatOverrideEntity,
});
