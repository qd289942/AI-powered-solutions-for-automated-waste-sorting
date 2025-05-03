import {Component, Input} from '@angular/core';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faCoffee, faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import {NgbTooltip} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-info-button',
  standalone: true,
  imports: [
    FaIconComponent,
    NgbTooltip
  ],
  templateUrl: './info-button.component.html',
  styleUrl: './info-button.component.scss'
})
export class InfoButtonComponent {
  protected readonly faInfoCircle = faInfoCircle;

  @Input()
  public infoButtonText!: string;
}
