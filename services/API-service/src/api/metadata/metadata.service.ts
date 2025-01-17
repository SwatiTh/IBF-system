import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryService } from '../country/country.service';
import { EventService } from '../event/event.service';
import { IndicatorMetadataEntity } from './indicator-metadata.entity';
import { LayerMetadataEntity } from './layer-metadata.entity';

@Injectable()
export class MetadataService {
  @InjectRepository(IndicatorMetadataEntity)
  private readonly indicatorRepository: Repository<IndicatorMetadataEntity>;
  @InjectRepository(LayerMetadataEntity)
  private readonly layerRepository: Repository<LayerMetadataEntity>;

  private countryService: CountryService;
  private readonly eventService: EventService;

  public constructor(
    countryService: CountryService,
    eventService: EventService,
  ) {
    this.countryService = countryService;
    this.eventService = eventService;
  }

  public async getIndicatorsByCountry(
    countryCodeISO3,
  ): Promise<IndicatorMetadataEntity[]> {
    const event = await this.eventService.getEventSummaryCountry(
      countryCodeISO3,
    );
    const activeTrigger = event && event.activeTrigger;

    const indicators = await this.indicatorRepository.find({});

    let countryIndicators = [];
    if (activeTrigger) {
      countryIndicators = indicators.filter(
        (metadata: IndicatorMetadataEntity): boolean =>
          metadata.country_codes.split(',').includes(countryCodeISO3),
      );
    } else {
      countryIndicators = indicators.filter(
        (metadata: IndicatorMetadataEntity): boolean =>
          metadata.country_codes.split(',').includes(countryCodeISO3) &&
          metadata.group !== 'outline',
      );
    }

    const actionUnits = await this.countryService.getActionsUnitsForCountry(
      countryCodeISO3,
    );

    const countryActionUnit = countryIndicators.find((i): boolean =>
      actionUnits.includes(i.name),
    );

    if (!countryActionUnit.active) {
      countryIndicators.find((i): boolean =>
        actionUnits.includes(i.name),
      ).active = activeTrigger;
    }

    return countryIndicators;
  }

  public async getLayersByCountry(
    countryCodeISO3,
  ): Promise<LayerMetadataEntity[]> {
    const layers = await this.layerRepository.find();

    return layers.filter((metadata: LayerMetadataEntity): boolean =>
      metadata.country_codes.split(',').includes(countryCodeISO3),
    );
  }
}
