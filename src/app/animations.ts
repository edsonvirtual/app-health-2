import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

export const routeAnimation = trigger('routeAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(18px)' }),
    animate('260ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('180ms ease-in', style({ opacity: 0, transform: 'translateY(-14px)' }))
  ])
]);

export const pageFadeAnimation = trigger('pageFade', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(12px)' }),
    animate('320ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const listStagger = trigger('listStagger', [
  transition(':enter', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(12px)' }),
      stagger(70, [
        animate('260ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);
