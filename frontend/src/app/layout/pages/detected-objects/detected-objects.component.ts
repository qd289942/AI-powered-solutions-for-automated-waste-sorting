import {Component, OnInit} from '@angular/core';
import {DetectedObjectsService} from '../../../services/detected-objects.service';
import {DetectedObject} from '../../../entity/detected-object';
import {ElasticSearchResponse} from '../../../entity/elastic-search-response';
import {DecimalPipe, JsonPipe, NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {EuropeanDatetimePipe} from '../../../pipes/european-datetime.pipe';
import {DetectedObjectSummary} from '../../../entity/detected-object-summary';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {faEye} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-detected-objects',
  standalone: true,
  imports: [
    JsonPipe,
    NgIf,
    NgForOf,
    RouterLink,
    EuropeanDatetimePipe,
    DecimalPipe,
    NgbPagination,
    FaIconComponent
  ],
  templateUrl: './detected-objects.component.html',
  styleUrl: './detected-objects.component.scss'
})
export class DetectedObjectsComponent implements OnInit {
  constructor(private detectedObjectsService: DetectedObjectsService) {
  }

  private _page !: number;
  public perPage: number = 30;

  public totalCount !: number;

  get page(): number {
    return this._page;
  }

  set page(value: number) {
    this._page = value;
    this.pageChanged();
  }

  public detectedObjectSummaries!: DetectedObjectSummary[];

  ngOnInit(): void {
    this.page = 1;
  }

  private pageChanged(): void {
    this.detectedObjectsService.list(this.page, this.perPage).subscribe(res => {
      this.detectedObjectSummaries = res.pageData;
      this._page = res.page;
      this.totalCount = res.count;
    });
  }


  protected readonly faEye = faEye;
}
