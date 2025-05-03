import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {InfoButtonComponent} from '../../../../ui/info-button/info-button.component';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';
import {ReactiveFormsModule} from '@angular/forms';
import {ValidationErrorsComponent} from '../../../../ui/validation-errors/validation-errors.component';
import {OperationSection} from '../../../../entity/operation-section';
import {OperationSectionsService} from '../../../../services/operation-sections.service';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-operation-section-view',
  standalone: true,
  imports: [
    NgIf,
    InfoButtonComponent,
    NgForOf,
    NgMultiSelectDropDownModule,
    ReactiveFormsModule,
    ValidationErrorsComponent
  ],
  templateUrl: './operation-section-view.component.html',
  styleUrl: './operation-section-view.component.scss'
})
export class OperationSectionViewComponent implements OnInit{
  public operationSection !: OperationSection;

  constructor(private operationSectionsService: OperationSectionsService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const operationSectionId = +this.route.snapshot.params['id'];

    this.operationSectionsService.get(operationSectionId).subscribe(operationSection => {
      this.operationSection = operationSection;
    });
  }
}
