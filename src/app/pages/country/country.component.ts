import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import Chart from 'chart.js/auto';
import { combineLatest, filter, map, Observable, of, shareReplay, Subscription, switchMap, tap } from 'rxjs';
import { Header } from 'src/app/core/models/header.model';
import { DataService } from 'src/app/core/services/data.service';


@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit, OnDestroy {
  public lineChart!: Chart<"line", number[], number>;
  public header$!: Observable<Header>
  private subscription: Subscription = new Subscription();
  public errorMessage$!: Observable<string | null>;

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService) {
  }

  ngOnInit() {
    this.errorMessage$ = this.dataService.errorMessage$;
    const countryID$ = this.route.paramMap.pipe(
      map((param: ParamMap) => {
        const idStr = param.get('id');
        return idStr ? parseInt(idStr, 10) : null;
      }),
      switchMap((countryID: number | null) => {
        if (countryID === null) {
          return this.router.navigateByUrl('not-found');
        }
        return this.dataService.getCountryTotalEntries(countryID).pipe(
          map((entries: number) => (entries === 0 ? null : countryID))
        );
      }),
      tap(countryID => {
        if(!countryID) this.router.navigateByUrl('not-found');
      }),
      filter((countryID): countryID is number => !!countryID),
      shareReplay(1)
    );

    this.header$ = countryID$.pipe(
      switchMap((countryID: number) => this.getHeaderData(countryID))
    );

    const chartSub = countryID$.pipe(
      switchMap((countryID: number) => combineLatest([
          this.dataService.getCountryYearsOfEntries(countryID),
          this.dataService.getCountryMedalsByEntries(countryID)
      ]))
    ).subscribe(([years, medals]) => {
        if (years && medals) {
          setTimeout(() => {
            this.buildChart(years, medals);
          }, 0);
        } else {
          this.router.navigateByUrl('not-found');
        }
    });

    this.subscription.add(chartSub)
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.lineChart?.destroy();
  }

  private getHeaderData(countryID: number): Observable<Header> {
    return combineLatest([
      this.dataService.getCountryNameByID(countryID),
      this.dataService.getCountryTotalEntries(countryID), 
      this.dataService.getCountryTotalMedals(countryID), 
      this.dataService.getCountryTotalAthletes(countryID)
    ]).pipe(
      map(([countryName, totalEntries, totalMedals, totalAthletes]) => ({
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
        maintainAspectRatio: false,
        animation: {
          duration: 0
        },
        elements: {
          point: {
            hoverRadius: 6
          }
        },
      }
    });

    setTimeout(() => {
      this.lineChart.resize();
    }, 0);
  }
}