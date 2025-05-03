import {Component, Input, OnInit} from '@angular/core';
import {
  AbstractControl, AsyncValidatorFn,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule, ValidationErrors,
  Validators
} from '@angular/forms';
import {OperationSection} from '../../../../entity/operation-section';
import {JsonPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {AisService} from '../../../../services/ais.service';
import {Ai} from '../../../../entity/ai';
import {ValidationErrorsComponent} from '../../../../ui/validation-errors/validation-errors.component';
import {faCoffee} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {InfoButtonComponent} from '../../../../ui/info-button/info-button.component';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';
import {OperationSectionsService} from '../../../../services/operation-sections.service';
import {catchError, map, Observable, of} from 'rxjs';
import {Actuator} from '../../../../entity/actuator';

@Component({
  selector: 'app-operation-section-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    JsonPipe,
    NgIf,
    ValidationErrorsComponent,
    NgClass,
    FaIconComponent,
    InfoButtonComponent,
    NgMultiSelectDropDownModule,
    FormsModule
  ],
  templateUrl: './operation-section-form.component.html',
  styleUrl: './operation-section-form.component.scss'
})
export class OperationSectionFormComponent implements OnInit {
  dropdownSettings: any = {};

  selectedItemsReactive = new FormControl([]);

  public ais!: Ai[];

  public form!: FormGroup;

  public actuatorsFormArray !: FormArray;

  public currentDetectionLabels: string[] = [];

  @Input()
  operationSectionFormPreFill ?: OperationSection;

  @Input()
  saveCallback !: (value: OperationSection) => void;

  constructor(private fb: FormBuilder,
              private aiService: AisService,
              private operationSectionsService: OperationSectionsService) {
  }

  ngOnInit(): void {
    this.dropdownSettings = {
      singleSelection: false,
      selectAllText: 'Alle auswählen',
      unSelectAllText: 'Keines auswählen',
      itemsShowLimit: 8,
      allowSearchFilter: true
    };

    this.aiService.list().subscribe(value => {
      this.ais = value;

      this.form = this.fb.group({
        "operationSectionId": [null],
        "name": ['', Validators.required, this.validateUniqueOperationSectionName()],
        "conveyerSpeed": [20, [Validators.required, Validators.min(1)]],
        "cameraXThreshold": [0, [Validators.required, Validators.min(0)]],
        "detectionMinThreshold": [0.8, [Validators.required, Validators.min(0.5), Validators.max(1.0)]],
        "cameraPictureWidthMm": [100, [Validators.required, Validators.min(1)]],
        "aiId": [this.ais[0].aiId, Validators.required],
        "actuators": this.fb.array([this.buildActuatorForm()], this.noLabelDuplicatesValidator)
      });

      this.actuatorsFormArray = this.form.get('actuators') as FormArray;

      // Formular vorbefüllen, sofern ein Einsatzabschnitt übergeben wurde
      if (this.operationSectionFormPreFill) {
        for (let i = 0; i < this.operationSectionFormPreFill.actuators.length - 1; i++) {
          this.addActuator();
        }

        this.form.patchValue(this.operationSectionFormPreFill);
      } else {
        this.aiChanged(this.form.value.aiId);
      }

      this.form.get('aiId')!.valueChanges.subscribe(aiId => this.aiChanged(aiId));
      this.updateDetectionLabels(this.form.value.aiId);
    });
  }

  private validateUniqueOperationSectionName(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null); // return null if the value is empty
      }

      return this.operationSectionsService.isNameAlreadyUsed(control.value, this.form.value.operationSectionId).pipe(
        map(isNameTaken => isNameTaken ? {operationSectionNameTaken: true} : null),
        catchError(() => of(null))
      );
    };
  }


  private getAiById(aiId: number) {
    return this.ais.find((value, index, obj) => value.aiId === aiId);
  }

  private updateDetectionLabels(aiId: number) {
    const newAi = this.getAiById(aiId)!;
    this.currentDetectionLabels = newAi.detectionLabels;
  }

  private aiChanged(aiId: number) {
    this.updateDetectionLabels(aiId);
    let currentLabelIndex = 0;

    // Wenn die Ai geändert wird dann neue DetectionLabels zu den Aktoren zuweisen um einen Validen Zustand zu bewahren
    for (const control of this.actuatorsFormArray.controls) {
      control.get('activationTrashLabel')!.setValue([this.currentDetectionLabels[currentLabelIndex]]);
      currentLabelIndex++;
    }
  }

  private noLabelDuplicatesValidator(formArray: AbstractControl): { [key: string]: boolean } | null {
    const items = formArray as FormArray;
    const usedActuatorLabels: string[] = [];

    for (const control of items.controls) {
      const actuatorLabels = control.get('activationTrashLabel')!.value;

      if (actuatorLabels) {
        usedActuatorLabels.push(...actuatorLabels);
      }
    }

    return usedActuatorLabels.length > (new Set(usedActuatorLabels)).size ? {duplicateActivationLabels: true} : null;
  }

  private buildActuatorForm() {
    return this.fb.group({
      "actuatorId": [null],
      "name": ['', Validators.required],
      "cameraDistance": [0, [Validators.required, Validators.min(0)]],
      "type": ["COMPRESSED_AIR"],
      "actuatorCalibration": [0, Validators.required],
      "activationTrashLabel": [[], Validators.required]
    });
  }

  public getActuators() {
    return this.actuatorsFormArray.controls as FormGroup[];
  }

  public addActuator() {
    this.actuatorsFormArray.push(this.buildActuatorForm());
  }

  public remoteActuator(index: number) {
    this.actuatorsFormArray.removeAt(index);
  }

  public save() {
    this.form.markAllAsTouched();

    const operationSectionWithActuators = this.copyObject(this.form.value);
    this.removeNullActuatorIds(operationSectionWithActuators.actuators);

    if (this.form.valid) {
      this.saveCallback(operationSectionWithActuators);
    }
  }

  private copyObject(obj: {}) {
    return JSON.parse(JSON.stringify(obj));
  }

  private removeNullActuatorIds(actuators: Actuator[]) {
    for (const actuator of actuators) {
      if(actuator.actuatorId === null) {
        delete actuator.actuatorId;
      }
    }

    return actuators;
  }

  protected readonly faCoffee = faCoffee;
}
