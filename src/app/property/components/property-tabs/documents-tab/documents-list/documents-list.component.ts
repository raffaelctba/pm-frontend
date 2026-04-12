import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentTemplateService, GeneratedDocumentService } from '../../../../../services';
import { DocumentTemplate, GeneratedDocument } from '../../../../../models';

@Component({
  selector: 'app-documents-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-900">Templates & Documents</h3>
        <button class="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700" (click)="refresh()" [disabled]="loading()">Refresh</button>
      </div>

      <div class="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          type="text"
          class="rounded border border-slate-300 px-2 py-1 text-sm"
          [value]="templateFilter()"
          (input)="templateFilter.set(($any($event.target).value || '').toString())"
          placeholder="Filter templates by name/type"
        />
        <input
          type="text"
          class="rounded border border-slate-300 px-2 py-1 text-sm"
          [value]="documentFilter()"
          (input)="documentFilter.set(($any($event.target).value || '').toString())"
          placeholder="Filter generated docs by name/status"
        />
      </div>

      @if (error()) {
        <p class="mb-3 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">{{ error() }}</p>
      }

      <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div>
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Templates ({{ filteredTemplates().length }})</p>
          <div class="max-h-72 space-y-2 overflow-auto pr-1">
            @for (template of filteredTemplates(); track template.id) {
              <button
                type="button"
                class="w-full rounded border px-3 py-2 text-left text-sm"
                [class.border-blue-300]="selectedTemplateId() === template.id"
                [class.bg-blue-50]="selectedTemplateId() === template.id"
                [class.border-slate-200]="selectedTemplateId() !== template.id"
                (click)="selectTemplate(template)"
              >
                <p class="font-medium text-slate-900">{{ template.name }}</p>
                <p class="text-xs text-slate-600">{{ template.documentType }} · v{{ template.templateVersion }} · {{ template.language }}</p>
              </button>
            }
            @if (!filteredTemplates().length) {
              <p class="rounded border border-dashed border-slate-300 px-2 py-3 text-xs text-slate-500">No templates found.</p>
            }
          </div>
        </div>

        <div>
          <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Generated Documents ({{ filteredDocuments().length }})</p>
          <div class="max-h-72 space-y-2 overflow-auto pr-1">
            @for (doc of filteredDocuments(); track doc.id) {
              <button
                type="button"
                class="w-full rounded border px-3 py-2 text-left text-sm"
                [class.border-emerald-300]="selectedDocumentId() === doc.id"
                [class.bg-emerald-50]="selectedDocumentId() === doc.id"
                [class.border-slate-200]="selectedDocumentId() !== doc.id"
                (click)="selectDocument(doc)"
              >
                <p class="font-medium text-slate-900">{{ doc.fileName || doc.templateName || ('Document #' + doc.id) }}</p>
                <p class="text-xs text-slate-600">{{ doc.documentType }} · {{ doc.status }} · {{ doc.generatedAt | date:'short' }}</p>
              </button>
            }
            @if (!filteredDocuments().length) {
              <p class="rounded border border-dashed border-slate-300 px-2 py-3 text-xs text-slate-500">No generated documents found.</p>
            }
          </div>
        </div>
      </div>
    </section>
  `
})
export class DocumentsListComponent implements OnInit, OnChanges {
  private readonly templateService = inject(DocumentTemplateService);
  private readonly generatedDocumentService = inject(GeneratedDocumentService);
  private readonly route = inject(ActivatedRoute);

  @Input() propertyId: number | null = null;
  @Output() templateSelected = new EventEmitter<DocumentTemplate>();
  @Output() documentSelected = new EventEmitter<GeneratedDocument>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly templates = signal<DocumentTemplate[]>([]);
  readonly documents = signal<GeneratedDocument[]>([]);
  readonly templateFilter = signal('');
  readonly documentFilter = signal('');
  readonly selectedTemplateId = signal<number | null>(null);
  readonly selectedDocumentId = signal<number | null>(null);

  ngOnInit(): void {
    this.refresh();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propertyId'] && !changes['propertyId'].firstChange) {
      this.refresh();
    }
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);

    this.templateService.getAllActiveTemplates().subscribe({
      next: (templates) => this.templates.set(templates ?? []),
      error: () => this.error.set('Failed to load templates')
    });

    const resolvedPropertyId = this.resolvePropertyId();
    if (!resolvedPropertyId) {
      this.documents.set([]);
      this.loading.set(false);
      return;
    }

    this.generatedDocumentService.getDocumentsByProperty(resolvedPropertyId).subscribe({
      next: (documents) => {
        this.documents.set(documents ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.error() ?? 'Failed to load generated documents');
        this.loading.set(false);
      }
    });
  }

  filteredTemplates(): DocumentTemplate[] {
    const term = this.templateFilter().trim().toLowerCase();
    if (!term) return this.templates();
    return this.templates().filter((t) =>
      [t.name, t.documentType, t.language, t.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }

  filteredDocuments(): GeneratedDocument[] {
    const term = this.documentFilter().trim().toLowerCase();
    if (!term) return this.documents();
    return this.documents().filter((d) =>
      [d.fileName, d.templateName, d.documentType, d.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }

  selectTemplate(template: DocumentTemplate): void {
    this.selectedTemplateId.set(template.id);
    this.templateSelected.emit(template);
  }

  selectDocument(document: GeneratedDocument): void {
    this.selectedDocumentId.set(document.id);
    this.documentSelected.emit(document);
  }

  private resolvePropertyId(): number | null {
    if (this.propertyId && this.propertyId > 0) {
      return this.propertyId;
    }
    const rawId = this.route.snapshot.paramMap.get('id') ?? this.route.parent?.snapshot.paramMap.get('id');
    const id = Number(rawId);
    return Number.isFinite(id) && id > 0 ? id : null;
  }
}

