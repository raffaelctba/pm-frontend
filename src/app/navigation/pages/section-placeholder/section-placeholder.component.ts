import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationContextService } from '../../services/navigation-context.service';

@Component({
  selector: 'app-section-placeholder',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title() }}</h2>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">{{ subtitle() }}</p>
    </section>
  `
})
export class SectionPlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly navContext = inject(NavigationContextService);

  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

  readonly title = computed(() => (this.data()?.['title'] as string) ?? 'Section');

  readonly subtitle = computed(() => {
    const ctx = this.navContext.context();
    if (ctx.kind === 'unit' && ctx.unit) {
      return `${ctx.unit.buildingName} · Unit ${ctx.unit.unitNumber}`;
    }
    if (ctx.kind === 'building' && ctx.building) {
      return ctx.building.buildingName;
    }
    return 'Loading…';
  });
}
