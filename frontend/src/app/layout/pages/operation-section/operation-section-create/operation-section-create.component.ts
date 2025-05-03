import { Component } from '@angular/core';
import {OperationSectionsService} from '../../../../services/operation-sections.service';
import {ToastrService} from 'ngx-toastr';
import {OperationSection} from '../../../../entity/operation-section';
import {Router} from '@angular/router';
import {OperationSectionFormComponent} from '../operation-section-form/operation-section-form.component';

@Component({
  selector: 'app-operation-section-create',
  standalone: true,
  imports: [
    OperationSectionFormComponent
  ],
  templateUrl: './operation-section-create.component.html',
  styleUrl: './operation-section-create.component.scss'
})
export class OperationSectionCreateComponent {
  constructor(private operationSectionsService: OperationSectionsService,
              private toastr: ToastrService,
              private router: Router) {
  }

  public getSaveCallback() {
    return (operationSection: OperationSection) => {
      this.operationSectionsService.create(operationSection).subscribe(value => {
        this.toastr.success('Einsatzabschnitt ' + value.name + ' erfolgreich erstellt');
        this.router.navigateByUrl('operation-sections/edit/' + value.operationSectionId);
      });
    };
  }
}
