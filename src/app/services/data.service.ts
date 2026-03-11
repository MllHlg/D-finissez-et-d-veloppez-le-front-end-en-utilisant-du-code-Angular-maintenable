import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Olympic } from '../models/olympic.model';
import { BehaviorSubject, catchError, map, Observable, tap, shareReplay, of } from 'rxjs';
import { Participation } from '../models/participation.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
    private olympicUrl = './assets/mock/olympic.json';
    private olympics$ = new BehaviorSubject<Olympic[]>([])

    constructor(private http:HttpClient) { }

    loadInitialData(): Observable<Olympic[]> {
        return this.http.get<Olympic[]>(this.olympicUrl).pipe(
            tap((countries: Olympic[]) => this.olympics$.next(countries)),
            catchError((error: Error) => {
                this.olympics$.next([]); 
                return of([]);
            })
        );
    }

    getOlympics(): Observable<Olympic[]> {
        return this.olympics$.asObservable();
    }

    public countries$: Observable<string[]> = this.getOlympics().pipe(
        map((olympics: Olympic[]) => olympics.map((o: Olympic) => o.country)),
        shareReplay(1)
    );

    public totalCountries$: Observable<number> = this.countries$.pipe(
        map((countries: string[]) => countries.length),
        shareReplay(1)
    );

    public totalJOs$: Observable<number> = this.getOlympics().pipe(
        map((olympics: Olympic[]) => {
            const allYears = olympics.flatMap((o: Olympic) => o.participations.map((p: Participation) => p.year));
            return new Set(allYears).size; 
        }),
        shareReplay(1)
    );

    public totalMedalsPerCountry$: Observable<number[]> = this.getOlympics().pipe(
        map((olympics: Olympic[]) =>
            olympics.map((o: Olympic) => 
                o.participations.reduce((acc: number, p: Participation) => acc + p.medalsCount, 0)
            ) 
        ),
        shareReplay(1)
    );

    getCountryParticipations(countryID: number): Observable<Participation[]> {
        return this.getOlympics().pipe(
            map((olympics : Olympic[]) => {
                const selectedCountry = olympics.find((o : Olympic) => o.id === countryID);
                return selectedCountry ? selectedCountry.participations: [];
            })
        );
    }

    getCountryTotalEntries(countryID: number): Observable<number> {
        return this.getCountryParticipations(countryID).pipe(
            map((participations: Participation[]) => participations.length)
        );
    }

    getCountryYearsOfEntries(countryID: number): Observable<number[]> {
        return this.getCountryParticipations(countryID).pipe(
            map((participations: Participation[]) => participations.map((p: Participation) => p.year))
        );
    }

    getCountryMedalsByEntries(countryID: number): Observable<number[]> {
        return this.getCountryParticipations(countryID).pipe(
            map((participations: Participation[]) => participations.map((p: Participation) => p.medalsCount))
        )
    }

    getCountryTotalMedals(countryID: number): Observable<number> {
        return this.getCountryParticipations(countryID).pipe(
            map((participations: Participation[]) => 
                participations.reduce((acc: number, p: Participation) => acc + p.medalsCount, 0)
            )
        );
    }

    getCountryTotalAthletes(countryID: number): Observable<number> {
        return this.getCountryParticipations(countryID).pipe(
            map((participations: Participation[]) =>
                participations.reduce((acc: number, p: Participation) => acc + p.athleteCount, 0)
            )
        )
    }

    getCountryIDByName(countryName: string): Observable<number> {
        return this.getOlympics().pipe(
            map((olympics: Olympic[]) => {
                const country = olympics.find((o:Olympic) => o.country === countryName);
                return country ? country.id : -1
            }),
        );
    }

    getCountryNameByID(id: number): Observable<string> {
        return this.getOlympics().pipe(
            map((olympics: Olympic[]) => {
                const country = olympics.find((o:Olympic) => o.id === id);
                return country ? country.country : ""
            }),
        );
    }
}