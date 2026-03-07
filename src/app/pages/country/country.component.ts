import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import Chart from 'chart.js/auto';
import { combineLatest, filter, Head, map, Observable, of, shareReplay, Subscription, switchMap, tap } from 'rxjs';
import { Header } from 'src/app/models/header.model';
import { DataService } from 'src/app/services/data.service';


@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit, OnDestroy {
  public lineChart!: Chart<"line", number[], number>;
  public header$!: Observable<Header>
  private subscription: Subscription = new Subscription();

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService) {
  }

  ngOnInit() {
    // Gestion du nom de pays donné
    const countryName$ = this.route.paramMap.pipe(
      map((param: ParamMap) => param.get('countryName')),
      switchMap(countryName => {
        // Vérification de la présence du nom du pays 
        // ainsi que de son existence dans le service
        if(!countryName) return of (null)
        return this.dataService.getCountryTotalEntries(countryName).pipe(
          map((entries: number) => (entries === 0 ? null : countryName))
        );
      }),
      // Si le nom n'est pas valide, on retourne à la page d'accueil
      tap(countryName => {
        if(!countryName) this.router.navigateByUrl('/');
      }),
      // Vérification du type de countryName
      filter((countryName): countryName is string => !!countryName),
      // Permet d'éviter de relancer la vérification pour chaque abonné
      shareReplay(1)
    );

    // Création du component Header en fonction du pays
    this.header$ = countryName$.pipe(
      switchMap(countryName => this.getHeaderData(countryName))
    );

    // Création du graphe des médails par date en fonction du pays
    const chartSub = countryName$.pipe(
      switchMap(countryName => combineLatest([
          this.dataService.getCountryYearsOfEntries(countryName),
          this.dataService.getCountryMedalsByEntries(countryName)
      ]))
    ).subscribe(([years, medals]) => {
        this.buildChart(years, medals);
    });

    this.subscription.add(chartSub)
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.lineChart?.destroy();
  }

  private getHeaderData(countryName: string): Observable<Header> {
    return combineLatest([
      this.dataService.getCountryTotalEntries(countryName), 
      this.dataService.getCountryTotalMedals(countryName), 
      this.dataService.getCountryTotalAthletes(countryName)
    ]).pipe(
      map(([totalEntries, totalMedals, totalAthletes]) => ({
        title: countryName,
        listOfHeaderCards: [
          { title: "Number of entries", numberValue: totalEntries },
          { title: "Total Number of medals", numberValue: totalMedals },
          { title: "Total Number of athletes", numberValue: totalAthletes }
        ]
      }))
    );
  }

  buildChart(years: number[], medals: number[]) {
    this.lineChart?.destroy();
    this.lineChart = new Chart("countryChart", {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: "medals",
            data: medals,
            backgroundColor: '#0b868f'
          },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}