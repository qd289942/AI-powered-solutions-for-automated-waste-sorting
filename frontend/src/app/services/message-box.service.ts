import {inject, Injectable} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {MessageBoxComponent} from '../ui/message-box/message-box.component';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageBoxService {

  constructor() { }

  private modalService = inject(NgbModal);

  show(title: string, message: string): Observable<boolean> {
    return new Observable<boolean>(subscriber => {
      const modalRef = this.modalService.open(MessageBoxComponent);
      modalRef.componentInstance.title = title;
      modalRef.componentInstance.message = message;

      modalRef.result.then((result) => {
        subscriber.next(result);
        subscriber.complete();
      }, (_) => {
        subscriber.next(false);
        subscriber.complete();
      });
    });
  }
}
