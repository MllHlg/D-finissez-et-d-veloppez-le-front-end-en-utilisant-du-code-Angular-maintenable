import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.loadInitialData().pipe(take(1)).subscribe();
  }
}