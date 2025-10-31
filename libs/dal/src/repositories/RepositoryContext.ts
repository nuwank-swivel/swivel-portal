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
import { TeamRepository } from './TeamRepository.js';
import { MealNotificationSettingsRepository } from './MealNotificationSettingsRepository.js';
import { PresenceEventRepository } from './PresenceEventRepository.js';

class RepositoryContext {
  private _bookingRepository: IBookingRepository<Booking>;
  private _userRepository: IUserRepository<User>;
  private _seatConfigurationRepository: ISeatConfigurationRepository<SeatConfiguration>;
  private _daySeatOverrideRepository: IDaySeatOverrideRepository<DaySeatOverride>;
  private _teamRepository: TeamRepository;
  private _mealNotificationSettingsRepository: MealNotificationSettingsRepository;
  private _presenceEventRepository: PresenceEventRepository;

  constructor() {
    this._bookingRepository = new BookingRepository();
    this._userRepository = new UserRepository();
    this._seatConfigurationRepository = new SeatConfigurationRepository();
    this._daySeatOverrideRepository = new DaySeatOverrideRepository();
    this._teamRepository =
      new (require('./TeamRepository.js').TeamRepository)();
    this._mealNotificationSettingsRepository = new MealNotificationSettingsRepository();
    this._presenceEventRepository = new PresenceEventRepository();
  }
  get presenceEventRepository(): PresenceEventRepository {
    return this._presenceEventRepository;
  }
  get teamRepository(): TeamRepository {
    return this._teamRepository;
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


  get mealNotificationSettingsRepository(): MealNotificationSettingsRepository {
    return this._mealNotificationSettingsRepository;
  }
}

export default new RepositoryContext();
