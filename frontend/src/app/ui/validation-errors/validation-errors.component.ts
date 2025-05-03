import {Component, Input} from '@angular/core';
import {AbstractControl, FormArray, FormControl, FormGroup} from '@angular/forms';
import {JsonPipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-validation-errors',
  standalone: true,
  imports: [
    NgIf,
    JsonPipe
  ],
  templateUrl: './validation-errors.component.html',
  styleUrl: './validation-errors.component.scss'
})
export class ValidationErrorsComponent {
  @Input()
  public control?: AbstractControl<any, any> | null;
}
