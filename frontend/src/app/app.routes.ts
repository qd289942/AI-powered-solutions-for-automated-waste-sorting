import { Routes } from '@angular/router';
import {DefaultLayoutComponent} from './layout/default-layout/default-layout.component';
import {LoginLayoutComponent} from './layout/login-layout/login-layout.component';
import {DetectedObjectsComponent} from './layout/pages/detected-objects/detected-objects.component';
import {
  DetectedObjectViewComponent
} from './layout/pages/detected-objects/detected-object-view/detected-object-view.component';
import {authorizationGuard} from './guards/authorization.guard';
import {OperationSectionsComponent} from './layout/pages/operation-section/operation-sections.component';
import {
  OperationSectionEditComponent
} from './layout/pages/operation-section/operation-section-edit/operation-section-edit.component';
import {
  OperationSectionCreateComponent
} from './layout/pages/operation-section/operation-section-create/operation-section-create.component';
import {
  OperationSectionViewComponent
} from './layout/pages/operation-section/operation-section-view/operation-section-view.component';
import {adminGuard} from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    pathMatch: 'prefix',
    canActivate: [authorizationGuard],
    children: [
      {
        path: 'detected-objects',
        component: DetectedObjectsComponent,
      },
      {
        path: 'detected-objects/:id',
        component: DetectedObjectViewComponent
      },
      {
        path: 'operation-sections',
        component: OperationSectionsComponent,
      },
      {
        path: 'operation-sections/edit/:id',
        component: OperationSectionEditComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'operation-sections/create',
        component: OperationSectionCreateComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'operation-sections/view/:id',
        component: OperationSectionViewComponent
      },
    ]
  },
  {
    path: 'login',
    component: LoginLayoutComponent,
    pathMatch: 'full'
  }
];
