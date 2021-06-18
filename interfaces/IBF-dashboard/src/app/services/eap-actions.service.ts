import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { CountryService } from 'src/app/services/country.service';
import { Country } from '../models/country.model';

@Injectable({
  providedIn: 'root',
})
export class EapActionsService {
  private triggeredAreaSubject = new BehaviorSubject<any[]>([]);
  private triggeredAreas: any[];
  private country: Country;

  constructor(
    private countryService: CountryService,
    private apiService: ApiService,
  ) {
    this.countryService
      .getCountrySubscription()
      .subscribe(this.onCountryChange);
  }

  private onCountryChange = (country: Country) => {
    this.country = country;
    this.loadAdminAreasAndActions();
  };

  private onMockScenarioChange = () => {
    this.loadAdminAreasAndActions();
  };

  private onTriggeredAreas = (triggeredAreas) => {
    this.triggeredAreas = triggeredAreas;
    this.triggeredAreaSubject.next(this.triggeredAreas);
  };

  private onEvent = (event) => {
    if (event) {
      this.apiService
        .getTriggeredAreas(this.country.countryCodeISO3)
        .subscribe(this.onTriggeredAreas);
    }
  };

  loadAdminAreasAndActions() {
    if (this.country) {
      this.apiService
        .getEvent(this.country.countryCodeISO3)
        .subscribe(this.onEvent);
    }
  }

  getTriggeredAreas(): Observable<any[]> {
    return this.triggeredAreaSubject.asObservable();
  }

  checkEapAction(action: string, status: boolean, placeCode: string) {
    return this.apiService.checkEapAction(
      action,
      this.country.countryCodeISO3,
      status,
      placeCode,
    );
  }
}
