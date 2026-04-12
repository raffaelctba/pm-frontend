import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DocumentManagementService } from '../../../../../services';
import { DocumentTemplate, GeneratedDocument } from '../../../../../models';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-900">Preview & Details</h3>
        <button class="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700" (click)="refreshPreview()">Refresh Preview</button>
      </div>

      @if (selectedGeneratedDocument) {
        <div class="mb-3 rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700">
          <p><span class="font-semibold">Document:</span> {{ selectedGeneratedDocument.fileName || ('#' + selectedGeneratedDocument.id) }}</p>
          <p><span class="font-semibold">Status:</span> {{ selectedGeneratedDocument.status }}</p>
          <p><span class="font-semibold">Generated:</span> {{ selectedGeneratedDocument.generatedAt | date:'short' }}</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button class="rounded bg-amber-600 px-2 py-1 text-[11px] font-semibold text-white" (click)="markAsSent()">Mark Sent</button>
            <button class="rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white" (click)="markAsSigned()">Mark Signed</button>
          </div>
        </div>
      }

      <textarea
        class="mb-2 min-h-20 w-full rounded border border-slate-300 px-2 py-1 font-mono text-xs"
        [value]="variablesJson()"
        (input)="variablesJson.set(($any($event.target).value || '').toString())"
        placeholder='Preview variables JSON, e.g. {"tenantName":"Alice"}'
      ></textarea>

      @if (error()) {
        <p class="mb-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">{{ error() }}</p>
      }

      <article class="max-h-96 overflow-auto rounded border border-slate-200 bg-white p-3" [innerHTML]="previewHtml()"></article>
    </section>
  `
})
export class DocumentViewerComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly documentManagementService = inject(DocumentManagementService);

  @Input() selectedTemplate: DocumentTemplate | null = null;
  @Input() selectedGeneratedDocument: GeneratedDocument | null = null;
  @Output() documentUpdated = new EventEmitter<GeneratedDocument>();

  readonly error = signal<string | null>(null);
  readonly variablesJson = signal('{\n  "tenantName": "Preview Tenant"\n}');

  previewHtml(): SafeHtml {
    const source = this.selectedTemplate?.content
      ?? this.selectedGeneratedDocument?.metadata
      ?? '<p class="text-sm text-slate-500">Select a template or generated document to preview.</p>';

    const mergedVars: Record<string, unknown> = {
      ...(this.selectedGeneratedDocument?.variables ?? {}),
      ...(this.parsePreviewVariables() ?? {})
    };

    const rendered = this.renderTemplateLocally(String(source), mergedVars);
    return this.sanitizer.bypassSecurityTrustHtml(rendered);
  }

  refreshPreview(): void {
    this.error.set(null);
    if (!this.parsePreviewVariables()) {
      this.error.set('Preview variables JSON is invalid');
    }
  }

  markAsSent(): void {
    if (!this.selectedGeneratedDocument) return;
    this.documentManagementService.markDocumentAsSent(this.selectedGeneratedDocument.id).subscribe({
      next: (updated) => this.documentUpdated.emit(updated),
      error: () => this.error.set('Failed to mark document as sent')
    });
  }

  markAsSigned(): void {
    if (!this.selectedGeneratedDocument) return;
    this.documentManagementService.markDocumentAsSigned(this.selectedGeneratedDocument.id).subscribe({
      next: (updated) => this.documentUpdated.emit(updated),
      error: () => this.error.set('Failed to mark document as signed')
    });
  }

  private parsePreviewVariables(): Record<string, unknown> | null {
    try {
      const parsed: unknown = JSON.parse(this.variablesJson() || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
    } catch {
      return null;
    }
  }

  private renderTemplateLocally(content: string, variables: Record<string, unknown>): string {
    let output = content;
    for (const [key, value] of Object.entries(variables)) {
      const resolved = value == null ? '' : String(value);
      output = output
        .replace(new RegExp(`\\$\\{${key}\\}`, 'g'), resolved)
        .replace(new RegExp(`\\{\\{\\s*${key}\\s*}}`, 'g'), resolved);
    }
    return output;
  }
}

