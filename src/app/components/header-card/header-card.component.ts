import { Component, Input } from '@angular/core';
import { HeaderCard } from 'src/app/models/header-card.model';

@Component({
  selector: 'app-header-card',
  templateUrl: './header-card.component.html',
  styleUrl: './header-card.component.scss',
})
export class HeaderCardComponent {
  @Input() headerCard!: HeaderCard;
}
