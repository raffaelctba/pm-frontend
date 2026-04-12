import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentTemplateService, GeneratedDocumentService } from '../../../../../services';
import { DocumentTemplate, DocumentTemplateRequest, GeneratedDocument } from '../../../../../models';

@Component({
  selector: 'app-document-uploader',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="rounded-xl border border-slate-200 bg-white p-4">
      <h3 class="mb-3 text-sm font-semibold text-slate-900">Template Editor & Generator</h3>

      @if (error()) {
        <p class="mb-3 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">{{ error() }}</p>
      }

      <form [formGroup]="templateForm" class="grid grid-cols-1 gap-2 md:grid-cols-2">
        <input class="rounded border border-slate-300 px-2 py-1 text-sm" formControlName="name" placeholder="Template name" />
        <input class="rounded border border-slate-300 px-2 py-1 text-sm" formControlName="documentType" placeholder="Document type (LEASE_AGREEMENT...)" />
        <input class="rounded border border-slate-300 px-2 py-1 text-sm" formControlName="language" placeholder="Language (EN/PT)" />
        <input class="rounded border border-slate-300 px-2 py-1 text-sm" formControlName="countryCode" placeholder="Country code (CA/BR)" />
        <input class="rounded border border-slate-300 px-2 py-1 text-sm md:col-span-2" formControlName="description" placeholder="Description" />
        <textarea class="min-h-36 rounded border border-slate-300 px-2 py-1 font-mono text-xs md:col-span-2" formControlName="content" placeholder="Freemarker HTML content"></textarea>
      </form>

      <div class="mt-3 flex flex-wrap gap-2">
        <button class="rounded bg-slate-900 px-3 py-1 text-xs font-semibold text-white" [disabled]="saving() || templateForm.invalid" (click)="saveTemplate()">
          {{ selectedTemplate?.id ? 'Update Template' : 'Create Template' }}
        </button>
      </div>

      <div class="mt-4 border-t border-slate-200 pt-3">
        <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Generate Document</h4>
        <textarea
          [value]="variablesJson()"
          (input)="variablesJson.set(($any($event.target).value || '').toString())"
          class="min-h-24 w-full rounded border border-slate-300 px-2 py-1 font-mono text-xs"
          placeholder='{"tenantName":"Alice","rentAmount":1200}'
        ></textarea>
        <div class="mt-2 flex gap-2">
          <button class="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white" [disabled]="!selectedTemplate || generating()" (click)="generateDocument()">
            Generate
          </button>
          <span class="self-center text-xs text-slate-500">Property: {{ resolvePropertyId() || '-' }}</span>
        </div>
      </div>
    </section>
  `
})
export class DocumentUploaderComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly templateService = inject(DocumentTemplateService);
  private readonly generatedDocumentService = inject(GeneratedDocumentService);
  private readonly route = inject(ActivatedRoute);

  @Input() selectedTemplate: DocumentTemplate | null = null;
  @Input() propertyId: number | null = null;
  @Output() templateSaved = new EventEmitter<DocumentTemplate>();
  @Output() documentGenerated = new EventEmitter<GeneratedDocument>();

  readonly saving = signal(false);
  readonly generating = signal(false);
  readonly error = signal<string | null>(null);
  readonly variablesJson = signal('{\n  "tenantName": "Alice"\n}');

  readonly templateForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    documentType: ['LEASE_AGREEMENT', Validators.required],
    language: ['EN', Validators.required],
    countryCode: [''],
    content: ['<p>Hello ${tenantName}</p>', Validators.required]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedTemplate'] && this.selectedTemplate) {
      this.templateForm.patchValue({
        name: this.selectedTemplate.name,
        description: this.selectedTemplate.description ?? '',
        documentType: String(this.selectedTemplate.documentType ?? 'LEASE_AGREEMENT'),
        language: String(this.selectedTemplate.language ?? 'EN'),
        countryCode: this.selectedTemplate.countryCode ?? '',
        content: this.selectedTemplate.content
      });
      this.variablesJson.set(JSON.stringify(this.selectedTemplate.variables ?? {}, null, 2));
    }
  }

  saveTemplate(): void {
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.saving.set(true);

    const payload: DocumentTemplateRequest = {
      ...this.templateForm.getRawValue(),
      countryCode: this.templateForm.getRawValue().countryCode || null,
      variables: this.selectedTemplate?.variables?.map((v) => ({
        variableName: v.variableName,
        displayName: v.displayName,
        description: v.description,
        dataType: v.dataType,
        required: v.required,
        defaultValue: v.defaultValue ?? null,
        validationPattern: v.validationPattern ?? null,
        enumValues: v.enumValues ?? null
      })) ?? []
    };

    const request$ = this.selectedTemplate?.id
      ? this.templateService.updateTemplate(this.selectedTemplate.id, payload)
      : this.templateService.createTemplate(payload);

    request$.subscribe({
      next: (saved) => {
        this.templateSaved.emit(saved);
        this.saving.set(false);
      },
      error: () => {
        this.error.set('Failed to save template');
        this.saving.set(false);
      }
    });
  }

  generateDocument(): void {
    if (!this.selectedTemplate?.id) {
      this.error.set('Select a template first');
      return;
    }

    const resolvedPropertyId = this.resolvePropertyId();
    if (!resolvedPropertyId) {
      this.error.set('Property id is required to generate documents in this tab');
      return;
    }

    const variables = this.safeParseJson(this.variablesJson());
    if (!variables) {
      this.error.set('Variables JSON is invalid');
      return;
    }

    this.error.set(null);
    this.generating.set(true);

    this.generatedDocumentService.generateDocument({
      templateId: this.selectedTemplate.id,
      propertyId: resolvedPropertyId,
      language: this.templateForm.getRawValue().language,
      variables,
      generatePdf: true
    }).subscribe({
      next: (generated) => {
        this.documentGenerated.emit(generated);
        this.generating.set(false);
      },
      error: () => {
        this.error.set('Failed to generate document');
        this.generating.set(false);
      }
    });
  }

  resolvePropertyId(): number | null {
    if (this.propertyId && this.propertyId > 0) {
      return this.propertyId;
    }
    const rawId = this.route.snapshot.paramMap.get('id') ?? this.route.parent?.snapshot.paramMap.get('id');
    const id = Number(rawId);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private safeParseJson(value: string): Record<string, unknown> | null {
    try {
      const parsed: unknown = JSON.parse(value || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
    } catch {
      return null;
    }
  }
}

