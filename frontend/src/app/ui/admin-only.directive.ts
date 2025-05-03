import {Directive, ElementRef, HostListener, OnInit, Renderer2} from '@angular/core';
import {LocalStorageService} from '../services/local-storage.service';
import {NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';

@Directive({
  selector: '[appAdminOnly]',
  standalone: true,
  providers: [NgbTooltip]
})
export class AdminOnlyDirective implements OnInit {
  private notAllowedMessage = 'Diese Funktionalität steht nur für Admins zur Verfügung';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private localStorageService: LocalStorageService,
    private ngbTooltip: NgbTooltip,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.ngbTooltip.autoClose = false;
    this.ngbTooltip.ngbTooltip = this.notAllowedMessage;
    this.ngbTooltip.container = 'body';
    this.ngbTooltip.triggers = 'manual';
    this.ngbTooltip.disableTooltip = this.localStorageService.isAdmin();

    this.checkAdminStatus();
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (!this.localStorageService.isAdmin()) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      this.toastr.error(this.notAllowedMessage);
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.localStorageService.isAdmin()) {
      this.ngbTooltip.open();
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (!this.localStorageService.isAdmin()) {
      this.ngbTooltip.close();
    }
  }

  private checkAdminStatus(): void {
    if (!this.localStorageService.isAdmin()) {
      this.renderer.addClass(this.el.nativeElement, 'insufficient-permissions');
    }
  }

}
