import {Component} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {LocalStorageService} from '../../services/local-storage.service';

@Component({
  selector: 'app-default-layout',
  standalone: true,
  imports: [NgbModule, RouterLink, RouterOutlet],
  templateUrl: './default-layout.component.html',
  styleUrl: './default-layout.component.scss'
})
export class DefaultLayoutComponent {

  constructor(public localStorage: LocalStorageService, private router: Router) {
  }

  logout() {
    this.localStorage.removeToken();
    this.router.navigateByUrl('/login');
  }
}
