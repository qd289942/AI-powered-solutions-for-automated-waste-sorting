import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ApiClientService} from '../../services/api-client.service';
import {Router} from '@angular/router';
import {LocalStorageService} from '../../services/local-storage.service';
import {AuthService} from '../../services/auth.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-login-layout',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login-layout.component.html',
  styleUrl: './login-layout.component.scss'
})
export class LoginLayoutComponent implements OnInit {
  constructor(private fb: FormBuilder,
              private auth: AuthService,
              private router: Router,
              private localStorageService: LocalStorageService,
              private toastr: ToastrService) {
  }

  public form !: FormGroup;

  ngOnInit(): void {
    if(this.localStorageService.hasToken()){
      this.doAfterLoginRedirect().then();
      return;
    }

    this.form = this.fb.group({
      username: [''],
      password: [''],
    });
  }

  login() {
    const formValue = this.form.value;
    return this.auth.login(formValue.username, formValue.password).subscribe(async (success) => {
        await this.doAfterLoginRedirect();
    }, () => {
      this.toastr.error('Fehler beim einloggen, bitte überprüfen Sie Benutzername und Passwort');
      this.form.patchValue({password: ''});
    });
  }

  private async doAfterLoginRedirect()   {
    await this.router.navigateByUrl('/');
  }
}
