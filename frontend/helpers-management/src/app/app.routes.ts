// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HelperListComponent } from './components/helper-list/helper-list.component';
import { HelperDetailComponent } from './components/helper-detail/helper-detail.component';
import { HelperFormComponent } from './components/helper-form/helper-form.component';

export const routes: Routes = [
  // Redirects the root path to '/helpers'
  { path: '', redirectTo: 'helpers', pathMatch: 'full' },

  // Main route for the helper management dashboard
  {
    path: 'helpers',
    component: HelperListComponent, // This component will host the left panel and the router-outlet for the right panel
    children: [
      // Default child route for the right panel when '/helpers' is accessed.
      // It redirects to the 'new' helper form, so users can immediately add a helper.
      { path: '', redirectTo: 'new', pathMatch: 'full' },

      // Route for adding a new helper. It uses the HelperFormComponent.
      { path: 'new', component: HelperFormComponent },

      // Route for viewing details of a specific helper.
      // ':id' is a route parameter that captures the helper's ID.
      { path: ':id', component: HelperDetailComponent },

      // Route for editing an existing helper.
      // It also uses the HelperFormComponent but with an 'id' parameter to load existing data.
      { path: 'edit/:id', component: HelperFormComponent }
    ]
  },

  // Wildcard route: redirects any unmatched URLs to '/helpers'.
  // This helps in handling invalid URLs gracefully.
  { path: '**', redirectTo: 'helpers' }
];
