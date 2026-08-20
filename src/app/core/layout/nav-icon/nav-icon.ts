import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NavIconName } from '../navigation.model';

@Component({ selector: 'app-nav-icon', templateUrl: './nav-icon.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class NavIcon { readonly name = input.required<NavIconName>(); }
