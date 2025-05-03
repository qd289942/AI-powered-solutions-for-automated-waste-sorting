import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DetectedObjectsService} from '../../../../services/detected-objects.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {DetectedObject} from '../../../../entity/detected-object';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {EuropeanDatetimePipe} from '../../../../pipes/european-datetime.pipe';
import {DetectedObjectDetailSummary} from '../../../../entity/detected-object-summary';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faDownload} from '@fortawesome/free-solid-svg-icons/faDownload';
import {environment} from '../../../../../environments/environment';
import {InfoButtonComponent} from '../../../../ui/info-button/info-button.component';
import {OperationSectionsService} from '../../../../services/operation-sections.service';
import {map, mergeMap, switchMap} from 'rxjs';
import {OperationSection} from '../../../../entity/operation-section';

@Component({
  selector: 'app-detected-object-view',
  standalone: true,
  imports: [
    DecimalPipe,
    EuropeanDatetimePipe,
    NgForOf,
    RouterLink,
    NgIf,
    FaIconComponent,
    InfoButtonComponent
  ],
  templateUrl: './detected-object-view.component.html',
  styleUrl: './detected-object-view.component.scss'
})
export class DetectedObjectViewComponent implements OnInit, AfterViewInit {

  public detectedObjectDetailSummary!: DetectedObjectDetailSummary;
  public operationSection !: OperationSection;

  private canvasNativeElem!: HTMLCanvasElement;
  private context!: CanvasRenderingContext2D;

  public currentDetectedObjectIndex = 0;

  @ViewChild('myCanvas', {static: true}) canvas!: ElementRef<HTMLCanvasElement>;

  constructor(private detectedObjectsService: DetectedObjectsService,
              private activatedRoute: ActivatedRoute,
              private operationSectionsService: OperationSectionsService) {
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.detectedObjectsService.get(this.activatedRoute.snapshot.paramMap.get('id')!).pipe(
      mergeMap(detectedObjectSummary => {
        const operationSectionId = detectedObjectSummary.top_hits_docs.hits.hits[0]._source.operation_section_id;

        return this.operationSectionsService.get(operationSectionId).pipe(map(operationSection =>  {
          return {
            detectedObjectSummary,
            operationSection
          }
        }));
      }))
      .subscribe(({detectedObjectSummary, operationSection}) => {
      this.detectedObjectDetailSummary = detectedObjectSummary;
      this.operationSection = operationSection;

      this.canvasNativeElem = this.canvas.nativeElement;
      this.context = this.canvasNativeElem.getContext('2d')!;

      this.renderCurrentDetectedObjectsBoundingBox();
    });
  }

  drawSingleDetectionMarkers(detectedObject: DetectedObject): void {
    const url = environment.apiEndpoint + '/' + detectedObject.img_path;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.canvasNativeElem.width = img.width;
      this.canvasNativeElem.height = img.height;
      this.context.drawImage(img, 0, 0);

      this.drawBoundingBox(detectedObject.bounding_box);
      this.drawXDetectionThreshold(detectedObject.x_detection_threshold, img.height);
    };
    img.src = url;
  }

  private drawBoundingBox(boundingBox: { x: number; y: number; width: number; height: number }) {
    this.context.beginPath();
    this.context.rect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
    this.context.lineWidth = 1;
    this.context.strokeStyle = 'blue';
    this.context.stroke();
  }

  private drawXDetectionThreshold(xDetectionThreshold: number, imgHeight: number) {
    this.context.beginPath();
    this.context.rect(xDetectionThreshold, 0, 1, imgHeight);
    this.context.lineWidth = 1;
    this.context.strokeStyle = 'red';
    this.context.stroke();
  }

  private renderCurrentDetectedObjectsBoundingBox() {
    this.drawSingleDetectionMarkers(this.detectedObjectDetailSummary.top_hits_docs.hits.hits[this.currentDetectedObjectIndex]._source);
  }

  public showNextDetectedObjectsBoundingBox() {
    this.currentDetectedObjectIndex++;
    this.renderCurrentDetectedObjectsBoundingBox();
  }

  public showPreviousDetectedObjectsBoundingBox() {
    this.currentDetectedObjectIndex--;
    this.renderCurrentDetectedObjectsBoundingBox();
  }

  public isFirstDetectedObject() {
    return this.currentDetectedObjectIndex === 0;
  }

  public isLastDetectedObject() {
    return this.currentDetectedObjectIndex === this.detectedObjectDetailSummary.top_hits_docs.hits.hits.length - 1;
  }

  public downloadImages() {
    this.detectedObjectsService.downloadImages(this.detectedObjectDetailSummary.key);
  }

  protected readonly faDownload = faDownload;
}
