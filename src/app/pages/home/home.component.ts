import {Component, OnDestroy, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import { Header } from 'src/app/models/header.model';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public pieChart!: Chart<"pie", number[], string>;
  public header$!: Observable<Header>
  private subscription: Subscription = new Subscription();

  constructor(private router: Router, private dataService: DataService) { }

  ngOnInit() {
    this.header$ = combineLatest([
      this.dataService.totalCountries$, 
      this.dataService.totalJOs$
    ]).pipe(
      map(([totalCountries, totalJOs]) => ({
        title: "Medals per Country",
        listOfHeaderCards: [
          { title: "Number of countries", numberValue: totalCountries },
          { title: "Number of JOs", numberValue: totalJOs }
        ]
      }))
    );

    const chartSub = combineLatest([
      this.dataService.countries$, 
      this.dataService.totalMedalsPerCountry$
    ]).subscribe(([countries, medals]) => {
        if (countries.length > 0) {
          this.buildPieChart(countries, medals);
        }
      });

    this.subscription.add(chartSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.pieChart?.destroy();
  }

  buildPieChart(countries: string[], sumOfAllMedalsYears: number[]) {
    this.pieChart?.destroy();
    this.pieChart = new Chart("DashboardPieChart", {
      type: 'pie',
      data: {
        labels: countries,
        datasets: [{
          label: 'Medals',
          data: sumOfAllMedalsYears,
          backgroundColor: ['#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'],
          hoverOffset: 4
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const countryName = countries[index];
            this.router.navigate(['country', countryName]);
          }
        }
      }
    });
  }
}