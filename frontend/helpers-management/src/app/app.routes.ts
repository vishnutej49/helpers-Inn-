// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HelperListComponent } from './components/helper-list/helper-list.component';
import { HelperDetailComponent } from './components/helper-detail/helper-detail.component';
import { HelperFormComponent } from './components/helper-form/helper-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'helpers', pathMatch: 'full' },

  {
    path: 'helpers',
    component: HelperListComponent,
    children: [
      { path: '', redirectTo: 'new', pathMatch: 'full' },

      { path: 'new', component: HelperFormComponent },

      { path: ':id', component: HelperDetailComponent },

      { path: 'edit/:id', component: HelperFormComponent }
    ]
  },

  { path: '**', redirectTo: 'helpers' }
];
