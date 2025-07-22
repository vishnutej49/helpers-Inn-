import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'helpers', pathMatch: 'full' },

  {
    path: 'helpers',
    loadComponent : ()=>import('./components/helper-list/helper-list.component').then(m=>m.HelperListComponent),
    children: [
      { path: '', redirectTo: 'new', pathMatch: 'full' },

      { path: 'new', loadComponent:()=>import('./components/helper-form/helper-form.component').then(m=>m.HelperFormComponent) },

      { path: ':id', loadComponent : ()=>import('./components/helper-detail/helper-detail.component').then(m=>m.HelperDetailComponent)},

      { path: 'edit/:id', loadComponent:()=>import('./components/helper-form/helper-form.component').then(m=>m.HelperFormComponent) }
    ]
  },

  { path: '**', redirectTo: 'helpers' }
];
