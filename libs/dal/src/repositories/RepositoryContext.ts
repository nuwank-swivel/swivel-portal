import {
  IBookingRepository,
  IDaySeatOverrideRepository,
  ISeatConfigurationRepository,
  IUserRepository,
} from '@swivel-portal/types';
import { Booking } from 'src/models/Booking.js';
import { BookingRepository } from './BookingRepository.js';
import { User } from 'src/models/User.js';
import { UserRepository } from './UserRepository.js';
import { SeatConfiguration } from 'src/models/SeatConfiguration.js';
import { SeatConfigurationRepository } from './SeatConfigurationRepository.js';
import { DaySeatOverrideRepository } from './index.js';
import { DaySeatOverride } from 'src/models/DaySeatOverride.js';

class RepositoryContext {
  private _bookingRepository: IBookingRepository<Booking>;
  private _userRepository: IUserRepository<User>;
  private _seatConfigurationRepository: ISeatConfigurationRepository<SeatConfiguration>;
  private _daySeatOverrideRepository: IDaySeatOverrideRepository<DaySeatOverride>;

  constructor() {
    this._bookingRepository = new BookingRepository();
    this._userRepository = new UserRepository();
    this._seatConfigurationRepository = new SeatConfigurationRepository();
    this._daySeatOverrideRepository = new DaySeatOverrideRepository();
  }

  get bookingRepository(): IBookingRepository<Booking> {
    return this._bookingRepository;
  }

  get userRepository(): IUserRepository<User> {
    return this._userRepository;
  }

  get seatConfigurationRepository(): ISeatConfigurationRepository<SeatConfiguration> {
    return this._seatConfigurationRepository;
  }

  get daySeatOverrideRepository(): IDaySeatOverrideRepository<DaySeatOverride> {
    return this._daySeatOverrideRepository;
  }
}

export default new RepositoryContext();
