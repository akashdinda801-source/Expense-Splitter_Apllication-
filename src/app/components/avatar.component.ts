import { Component, Input } from '@angular/core';

// Reusable component: props are @Input()s
@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `<span class="av" [style.background]="color" [style.width.px]="size" [style.height.px]="size"
    [style.fontSize.px]="size * 0.42">{{ name.charAt(0).toUpperCase() }}</span>`,
  styles: [`.av { display: inline-grid; place-items: center; border-radius: 50%; color: #fff; font-weight: 700; flex: none; }`]
})
export class AvatarComponent {
  @Input({ required: true }) name = '';
  @Input() color = '#3e43d8';
  @Input() size = 36;
}
