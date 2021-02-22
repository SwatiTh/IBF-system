import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataService } from '../data/data.service';
import { IndicatorEntity } from './indicator.entity';

@Injectable()
export class IndicatorService {
  @InjectRepository(IndicatorEntity)
  private readonly indicatorRepository: Repository<IndicatorEntity>;

  public constructor(private readonly dataService: DataService) {}

  public async getIndicatorsByCountry(countryCode): Promise<IndicatorEntity[]> {
    const indicators = await this.indicatorRepository.find({});

    const countryIndicators = indicators.filter(i =>
      i.country_codes.split(',').includes(countryCode),
    );

    const event = await this.dataService.getEvent(countryCode);
    const activeTrigger = event && !event.end_date;
    countryIndicators.find(
      (i): boolean => i.name === 'population_affected',
    ).active = activeTrigger;

    return countryIndicators;
  }
}