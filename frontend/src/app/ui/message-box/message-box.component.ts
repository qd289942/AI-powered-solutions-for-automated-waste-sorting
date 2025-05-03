import {Component, inject, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MessageBoxComponent {
  activeModal = inject(NgbActiveModal);

  @Input()
  message!: string;

  @Input()
  title!: string;

}
