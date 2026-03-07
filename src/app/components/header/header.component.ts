import { Component, Input, OnInit } from '@angular/core';
import { Header } from 'src/app/models/header.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() headerInfos!: Header
}
