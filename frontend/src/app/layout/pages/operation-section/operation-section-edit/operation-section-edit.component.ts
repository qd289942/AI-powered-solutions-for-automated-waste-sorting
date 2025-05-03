import {Component, OnInit} from '@angular/core';
import {OperationSectionFormComponent} from '../operation-section-form/operation-section-form.component';
import {OperationSectionsService} from '../../../../services/operation-sections.service';
import {OperationSection} from '../../../../entity/operation-section';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-operation-section-edit',
  standalone: true,
  imports: [
    OperationSectionFormComponent,
    NgIf
  ],
  templateUrl: './operation-section-edit.component.html',
  styleUrl: './operation-section-edit.component.scss'
})
export class OperationSectionEditComponent implements OnInit{

  public operationSection !: OperationSection;

  constructor(private operationSectionsService: OperationSectionsService,
              private toastr: ToastrService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const operationSectionId = +this.route.snapshot.params['id'];

    this.operationSectionsService.get(operationSectionId).subscribe(operationSection => {
      this.operationSection = operationSection;
    });
  }

  public getSaveCallback() {
    return (operationSection: OperationSection) => {
      const operationSectionUpdate = Object.assign({operationSectionUpdate: operationSection.operationSectionId}, operationSection);

      this.operationSectionsService.update(operationSectionUpdate).subscribe(value => {
        this.toastr.success('Einsatzabschnitt ' + value.name + ' erfolgreich gespeichert');
      });
    };
  }
}
