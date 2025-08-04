import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'helpers', pathMatch: 'full' },

  {
    path: 'helpers',
    loadComponent : ()=>import('./components/helper-list/helper-list.component').then(m=>m.HelperListComponent)
  },

  {
    path: 'helpers/new',
    loadComponent:()=>import('./components/helper-form/helper-form.component').then(m=>m.HelperFormComponent)
  },

  {
    path: 'helpers/edit/:id',
    loadComponent:()=>import('./components/helper-form/helper-form.component').then(m=>m.HelperFormComponent)
  },

  { path: '**', redirectTo: 'helpers' }
];
