import { Component, computed, inject, signal } from "@angular/core";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "@openng/optimus-ui/table";
import { Button, ButtonDirective } from "@openng/optimus-ui/button";
import { InputText } from "@openng/optimus-ui/inputtext";
import { Select } from "@openng/optimus-ui/select";
import { Dialog } from "@openng/optimus-ui/dialog";
import { AdminStore } from "../../core/admin.store";
import { Transaction } from "../../core/models";
import { PageHeader } from "../../shared/page-header";
import { StatusTag, displayLabel } from "../../shared/status-tag";

@Component({
  selector: "app-transactions",
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    TableModule,
    Button,
    ButtonDirective,
    InputText,
    Select,
    Dialog,
    PageHeader,
    StatusTag,
  ],
  template: ` <app-page-header
      title="Transactions"
      description="Every payment, all the details, one clear view."
      ><a
        pButton
        href="/api/transactions/export"
        download
        severity="secondary"
        [outlined]="true"
        ><i class="pi pi-download" aria-hidden="true"></i
        ><span>Export CSV</span></a
      ></app-page-header
    >
    <div class="metric-grid">
      @for (metric of metrics(); track metric.label) {
        <article class="metric">
          <p class="metric-label">{{ metric.label }}</p>
          <div class="metric-value">{{ metric.amount | currency }}</div>
          <p class="metric-foot">{{ metric.count }} transactions</p>
        </article>
      }
    </div>
    <div class="table-toolbar">
      <span class="search-field"
        ><i class="pi pi-search" aria-hidden="true"></i
        ><input
          pInputText
          placeholder="Search transactions..."
          aria-label="Search transactions"
          [(ngModel)]="query" /></span
      ><p-select
        [options]="statusOptions"
        optionLabel="label"
        optionValue="value"
        [(ngModel)]="status"
        placeholder="All statuses"
        [showClear]="true"
        ariaLabel="Filter payment status"
      />
    </div>
    <div class="table-container">
      <p-table
        [value]="filtered()"
        [loading]="store.loading()"
        [paginator]="true"
        [rows]="8"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="{first}–{last} of {totalRecords} transactions"
        [tableStyle]="{ 'min-width': '850px' }"
        ><ng-template #header
          ><tr>
            <th>Reference</th>
            <th pSortableColumn="customer">
              Customer <p-sortIcon field="customer" />
            </th>
            <th>Status</th>
            <th>Method</th>
            <th pSortableColumn="createdAt">
              Date <p-sortIcon field="createdAt" />
            </th>
            <th pSortableColumn="amount" class="text-right">
              Amount <p-sortIcon field="amount" />
            </th>
            <th>Details</th>
          </tr></ng-template
        ><ng-template #body let-row
          ><tr>
            <td style="font-size: 10px">{{ row.reference }}</td>
            <td>
              <strong style="font-weight: 500">{{ row.customer }}</strong
              ><small style="display: block">{{ row.email }}</small>
            </td>
            <td><app-status-tag [value]="row.status" /></td>
            <td>{{ label(row.method) }}</td>
            <td class="muted">{{ row.createdAt | date: "MMM d, y" }}</td>
            <td class="text-right">{{ row.amount | currency }}</td>
            <td>
              <p-button
                icon="pi pi-arrow-up-right"
                [text]="true"
                severity="secondary"
                [ariaLabel]="'View ' + row.reference"
                (onClick)="open(row)"
              />
            </td></tr></ng-template
        ><ng-template #emptymessage
          ><tr>
            <td colspan="7" class="empty-state">
              No transactions match your filters.
            </td>
          </tr></ng-template
        ></p-table
      >
    </div>
    <p-dialog
      header="Transaction details"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '480px' }"
      [draggable]="false"
    >
      @if (selected(); as transaction) {
        <div class="form-stack">
          <div>
            <small>{{ transaction.reference }}</small>
            <h2 style="font-size: 32px; margin: 8px 0">
              {{ transaction.amount | currency }}
            </h2>
            <app-status-tag [value]="transaction.status" />
          </div>
          <div class="setting-row">
            <span>Customer</span><strong>{{ transaction.customer }}</strong>
          </div>
          <div class="setting-row">
            <span>Gateway / fee</span
            ><span
              >{{ transaction.gateway }} /
              {{ transaction.fee | currency }}</span
            >
          </div>
          <div class="setting-row">
            <span>Country</span><span>{{ transaction.country }}</span>
          </div>
          <label for="transaction-status"
            >Update status<p-select
              inputId="transaction-status"
              ariaLabel="Update status"
              [options]="statusOptions"
              optionLabel="label"
              optionValue="value"
              [(ngModel)]="nextStatus"
              appendTo="body" /></label
          ><small
            >This updates the sample ledger. No real payment is
            processed.</small
          >
          <div class="form-actions">
            <p-button
              label="Save status"
              [loading]="store.loading()"
              (onClick)="save()"
            />
          </div>
        </div>
      }
    </p-dialog>`,
})
export class TransactionsPage {
  readonly store = inject(AdminStore);
  readonly query = signal("");
  readonly status = signal<string | null>(null);
  readonly selected = signal<Transaction | null>(null);
  readonly visible = signal(false);
  readonly nextStatus = signal("completed");
  readonly label = displayLabel;
  readonly statusOptions = [
    "completed",
    "processing",
    "pending",
    "failed",
    "refunded",
    "disputed",
  ].map((value) => ({ label: displayLabel(value), value }));
  readonly filtered = computed(() =>
    this.store
      .transactions()
      .filter(
        (t) =>
          (t.customer + t.email + t.reference)
            .toLowerCase()
            .includes(this.query().toLowerCase()) &&
          (!this.status() || t.status === this.status()),
      ),
  );
  readonly metrics = computed(() =>
    [
      { label: "Total volume", status: "" },
      { label: "Completed", status: "completed" },
      { label: "Pending", status: "pending" },
      { label: "Refunded", status: "refunded" },
    ].map((m) => {
      const items = this.store
        .transactions()
        .filter((t) => !m.status || t.status === m.status);
      return {
        ...m,
        amount: items.reduce((sum, t) => sum + t.amount, 0),
        count: items.length,
      };
    }),
  );
  constructor() {
    void this.store.loadTransactions();
  }
  open(transaction: Transaction): void {
    this.selected.set(transaction);
    this.nextStatus.set(transaction.status);
    this.visible.set(true);
  }
  async save(): Promise<void> {
    const id = this.selected()?.id;
    if (id && (await this.store.updateTransaction(id, this.nextStatus())))
      this.visible.set(false);
  }
}
