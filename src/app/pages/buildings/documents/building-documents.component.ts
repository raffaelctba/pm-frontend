import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { BuildingDocument, BuildingDocumentRequest, BuildingDocumentType } from '../../../models/building/building-document.model';
import { BuildingDocumentService } from '../../../services/building/building-document.service';
import { PropertyService } from '../../../services/property.service';
import { I18nService } from '../../../services/i18n.service';
import { canManageBuildingOperations } from '../../../shared/utils/property-permissions.util';

@Component({
  selector: 'app-building-documents',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatPaginatorModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Documents</h1>
          <p class="text-sm text-slate-600">Store and track building documents metadata.</p>
        </div>
        <a [routerLink]="['/property', buildingId()]" mat-stroked-button>Back to Property</a>
      </div>

      <mat-card class="mb-6 p-4">
        @if (!canManageDocuments()) {
          <p class="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {{ i18n.translate('building.access.readOnlyNotice') }}
          </p>
        }
        @if (canManageDocuments()) {
        <h2 class="mb-4 text-lg font-semibold">Add Document Metadata</h2>
        <form [formGroup]="form" (ngSubmit)="createDocument()" class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select formControlName="documentType">
              @for (type of documentTypes; track type) {
                <mat-option [value]="type">{{ type }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>File Name</mat-label>
            <input matInput formControlName="fileName" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>File Path</mat-label>
            <input matInput formControlName="filePath" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>Description</mat-label>
            <input matInput formControlName="description" />
          </mat-form-field>

          <div class="md:col-span-4 flex justify-end">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
              Add Document
            </button>
          </div>
        </form>
        }
      </mat-card>

      <mat-card class="p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Documents ({{ totalElements() }})</h2>
          <button mat-stroked-button (click)="loadDocuments()" [disabled]="loading()">Refresh</button>
        </div>

        @if (errorMessage()) {
          <p class="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage() }}</p>
        }

        @if (!loading()) {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="documents()" class="w-full">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let row">{{ row.title }}</td>
              </ng-container>

              <ng-container matColumnDef="documentType">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let row">{{ row.documentType }}</td>
              </ng-container>

              <ng-container matColumnDef="fileName">
                <th mat-header-cell *matHeaderCellDef>File</th>
                <td mat-cell *matCellDef="let row">{{ row.fileName }}</td>
              </ng-container>

              <ng-container matColumnDef="uploadedAt">
                <th mat-header-cell *matHeaderCellDef>Uploaded</th>
                <td mat-cell *matCellDef="let row">{{ row.uploadedAt || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button color="warn" (click)="deleteDocument(row)" [disabled]="!canManageDocuments()">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>

          <mat-paginator
            [length]="totalElements()"
            [pageIndex]="pageIndex()"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[5, 10, 20, 50]"
            (page)="onPage($event)"
          />
        }
      </mat-card>
    </div>
  `
})
export class BuildingDocumentsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(BuildingDocumentService);
  private readonly propertyService = inject(PropertyService);
  readonly i18n = inject(I18nService);
  private readonly snackBar = inject(MatSnackBar);

  readonly buildingId = signal<number>(0);
  readonly documents = signal<BuildingDocument[]>([]);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);
  readonly canManageDocuments = signal<boolean>(false);

  readonly documentTypes: BuildingDocumentType[] = ['CONTRACT', 'INVOICE', 'RECEIPT', 'REPORT', 'PHOTO', 'OTHER'];
  readonly displayedColumns: string[] = ['title', 'documentType', 'fileName', 'uploadedAt', 'actions'];

  readonly form = this.fb.nonNullable.group({
    documentType: ['OTHER' as BuildingDocumentType, Validators.required],
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    fileName: ['', Validators.required],
    filePath: ['', Validators.required]
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id')
      ?? this.route.parent?.snapshot.paramMap.get('id')
      ?? '0';
    this.buildingId.set(Number(rawId));
    this.loadAccessProfile();
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.service.getDocuments(this.buildingId(), this.pageIndex(), this.pageSize()).subscribe({
      next: (response) => {
        this.documents.set(response.content);
        this.totalElements.set(response.totalElements);
        this.pageIndex.set(response.pageable.pageNumber);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? 'Could not load documents.');
        this.loading.set(false);
      }
    });
  }

  createDocument(): void {
    if (!this.canManageDocuments()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue() as BuildingDocumentRequest;
    this.loading.set(true);

    this.service.createDocument(this.buildingId(), payload).subscribe({
      next: () => {
        this.snackBar.open('Document created.', 'Close', { duration: 2500 });
        this.form.patchValue({ title: '', description: '', fileName: '', filePath: '' });
        this.loadDocuments();
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? 'Could not create document.');
        this.loading.set(false);
      }
    });
  }

  deleteDocument(item: BuildingDocument): void {
    if (!this.canManageDocuments()) {
      this.errorMessage.set(this.i18n.translate('common.accessDenied403'));
      return;
    }

    if (!confirm(`Delete document "${item.title}"?`)) {
      return;
    }

    this.loading.set(true);
    this.service.deleteDocument(this.buildingId(), item.id).subscribe({
      next: () => {
        this.snackBar.open('Document deleted.', 'Close', { duration: 2500 });
        this.loadDocuments();
      },
      error: (error) => {
        this.errorMessage.set(error?.error?.message ?? 'Could not delete document.');
        this.loading.set(false);
      }
    });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadDocuments();
  }

  private loadAccessProfile(): void {
    this.propertyService.getPropertyById(this.buildingId()).subscribe({
      next: (property) => this.canManageDocuments.set(canManageBuildingOperations(property.currentUserRole)),
      error: () => this.canManageDocuments.set(false)
    });
  }
}

