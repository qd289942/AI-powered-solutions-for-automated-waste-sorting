import {Component} from '@angular/core';
import {OperationSectionsService} from '../../../services/operation-sections.service';
import {OperationSection} from '../../../entity/operation-section';
import {Router, RouterLink} from '@angular/router';
import {EuropeanDatetimePipe} from '../../../pipes/european-datetime.pipe';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faEdit, faEye, faRemove} from '@fortawesome/free-solid-svg-icons';
import {MessageBoxService} from '../../../services/message-box.service';
import {filter, switchMap} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {AdminOnlyDirective} from '../../../ui/admin-only.directive';
import {LocalStorageService} from '../../../services/local-storage.service';

@Component({
  selector: 'app-operation-section',
  standalone: true,
  imports: [
    RouterLink,
    EuropeanDatetimePipe,
    DecimalPipe,
    NgForOf,
    NgIf,
    FaIconComponent,
    AdminOnlyDirective
  ],
  templateUrl: './operation-sections.component.html',
  styleUrl: './operation-sections.component.scss'
})
export class OperationSectionsComponent {
  constructor(
    private operationSectionsService: OperationSectionsService,
    private messageBoxService: MessageBoxService,
    private toastr: ToastrService,
    private localStorage: LocalStorageService,
    private router: Router) {
  }

  public operationSections!: OperationSection[];

  ngOnInit(): void {
    this.operationSectionsService.list().subscribe(res => {
      this.operationSections = res;
    });
  }

  protected readonly faEdit = faEdit;
  protected readonly faRemove = faRemove;

  public askDelete(operationSection: OperationSection): void {
    if(!this.localStorage.isAdmin()) {
      return;
    }

    this.messageBoxService.show('Einsatzabschnitt löschen', 'Möchten Sie den Einsatzabschnitt ' + operationSection.name + ' wirklich löschen?')
      .pipe(
        filter(choice => choice),
        switchMap(_ => this.operationSectionsService.delete(operationSection.operationSectionId))
      )
      .subscribe(_ => {
        this.operationSections.splice(this.operationSections.indexOf(operationSection), 1);
        this.toastr.success('Einsatzabschnitt ' + operationSection.name + ' erfolgreich gelöscht');
      }, () => {
        this.toastr.success('Beim löschen des Einsatzabschnittes ' + operationSection.name + ' ist ein unerwarteter Fehler aufgetreten');
      });
  }

  protected readonly faEye = faEye;

  navigateToEdit(operationSection: OperationSection) {
    if(!this.localStorage.isAdmin()) {
      return;
    }

    this.router.navigateByUrl('/operation-sections/edit/' + operationSection.operationSectionId);
  }

  navigateToCreate() {
    if(!this.localStorage.isAdmin()) {
      return;
    }

    this.router.navigateByUrl('/operation-sections/create');
  }
}
