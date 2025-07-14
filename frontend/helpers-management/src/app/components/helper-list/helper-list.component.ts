// src/app/components/helper-list/helper-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, Router, ActivatedRoute } from '@angular/router';
import { HelperService } from '../../services/helper.service';
import { Helper } from '../../models/helper.model';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-helper-list',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './helper-list.component.html',
  styleUrls: ['./helper-list.component.scss']
})
export class HelperListComponent implements OnInit, OnDestroy {
  helpers: Helper[] = [];
  selectedHelperId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private helperService: HelperService,
    private router: Router,
    private route: ActivatedRoute 
  ) { }

  ngOnInit(): void {
    this.loadHelpers();

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      let currentRoute = this.route;
      while (currentRoute.firstChild) {
        currentRoute = currentRoute.firstChild;
      }
      this.selectedHelperId = currentRoute.snapshot.paramMap.get('id');
    });
  }

  // loading from services
  loadHelpers(): void {
    this.helperService.getHelpers().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: Helper[]) => {
        this.helpers = data;
      },
      error: (err) => {
        console.error('Error fetching helpers:', err);
      }
    });
  }

  addNewHelper(): void {
    this.router.navigate(['/helpers/new']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
