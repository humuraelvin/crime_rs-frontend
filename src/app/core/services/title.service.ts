import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  
  constructor(
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService
  ) {}

  init() {
    // Subscribe to router events to update the title
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data)
    ).subscribe(data => {
      // Get the route title if available
      const routeTitle = data['title'];
      
      if (routeTitle) {
        // Check if it's a translation key
        if (routeTitle.startsWith('nav.') || routeTitle.includes('.')) {
          this.translateService.get(routeTitle).subscribe(translatedTitle => {
            this.setTitle(translatedTitle);
          });
        } else {
          this.setTitle(routeTitle);
        }
      } else {
        // Default application title
        this.translateService.get('app.title').subscribe(appTitle => {
          this.setTitle(appTitle);
        });
      }
    });
  }

  setTitle(title: string) {
    // Set page title with application name
    this.translateService.get('app.title').subscribe(appTitle => {
      this.titleService.setTitle(`${title} | ${appTitle}`);
    });
  }
} 