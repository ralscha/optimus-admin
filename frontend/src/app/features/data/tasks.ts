import { Component, computed, inject, signal } from "@angular/core";
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { TableModule } from "@openng/optimus-ui/table";
import { Button } from "@openng/optimus-ui/button";
import { InputText } from "@openng/optimus-ui/inputtext";
import { Select } from "@openng/optimus-ui/select";
import { Dialog } from "@openng/optimus-ui/dialog";
import { ConfirmationService } from "@openng/optimus-ui/api";
import { AdminStore } from "../../core/admin.store";
import { Task } from "../../core/models";
import { PageHeader } from "../../shared/page-header";
import { StatusTag, displayLabel } from "../../shared/status-tag";
import { csvCell, downloadTextFile } from "../../core/download";

@Component({
  selector: "app-tasks",
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    Button,
    InputText,
    Select,
    Dialog,
    PageHeader,
    StatusTag,
  ],
  template: ` <app-page-header
      title="Tasks"
      description="A little structure for your next big thing."
      ><p-button
        label="Export"
        icon="pi pi-download"
        severity="secondary"
        [outlined]="true"
        (onClick)="export()" /><p-button
        label="New task"
        icon="pi pi-plus"
        (onClick)="edit()"
    /></app-page-header>
    <div class="table-toolbar">
      <span class="search-field"
        ><i class="pi pi-search" aria-hidden="true"></i
        ><input
          pInputText
          placeholder="Search tasks..."
          aria-label="Search tasks"
          [(ngModel)]="query" /></span
      ><p-select
        [options]="statusOptions"
        optionLabel="label"
        optionValue="value"
        [(ngModel)]="status"
        placeholder="All statuses"
        [showClear]="true"
        ariaLabel="Filter task status"
      /><p-select
        [options]="priorities"
        [(ngModel)]="priority"
        placeholder="All priorities"
        [showClear]="true"
        ariaLabel="Filter priority"
      /><span class="muted" style="margin-left: auto; font-size: 12px"
        >{{ filtered().length }} tasks</span
      >
    </div>
    <div class="table-container">
      <p-table
        [value]="filtered()"
        [loading]="store.loading()"
        [paginator]="true"
        [rows]="8"
        [rowsPerPageOptions]="[8, 15, 30]"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="{first}–{last} of {totalRecords} tasks"
        [tableStyle]="{ 'min-width': '730px' }"
        dataKey="id"
        [selection]="selected()"
        (selectionChange)="selected.set($event)"
      >
        <ng-template #header
          ><tr>
            <th style="width: 45px"><p-tableHeaderCheckbox /></th>
            <th pSortableColumn="id">Task <p-sortIcon field="id" /></th>
            <th pSortableColumn="title">Title <p-sortIcon field="title" /></th>
            <th pSortableColumn="status">
              Status <p-sortIcon field="status" />
            </th>
            <th pSortableColumn="priority">
              Priority <p-sortIcon field="priority" />
            </th>
            <th><span class="muted">Actions</span></th>
          </tr></ng-template
        >
        <ng-template #body let-task
          ><tr>
            <td>
              <p-tableCheckbox
                [value]="task"
                [ariaLabel]="'Select ' + task.title"
              />
            </td>
            <td class="muted" style="font-size: 10px">{{ task.id }}</td>
            <td>
              <span class="version" style="margin-right: 8px">{{
                task.label
              }}</span
              ><strong style="font-weight: 500">{{ task.title }}</strong>
            </td>
            <td><app-status-tag [value]="task.status" /></td>
            <td><app-status-tag [value]="task.priority" /></td>
            <td>
              <div class="row-actions">
                <p-button
                  icon="pi pi-pencil"
                  [text]="true"
                  severity="secondary"
                  [ariaLabel]="'Edit ' + task.title"
                  (onClick)="edit(task)"
                /><p-button
                  icon="pi pi-trash"
                  [text]="true"
                  severity="secondary"
                  [ariaLabel]="'Delete ' + task.title"
                  (onClick)="remove(task)"
                />
              </div>
            </td></tr
        ></ng-template>
        <ng-template #emptymessage
          ><tr>
            <td colspan="6">
              <div class="empty-state">
                <i class="pi pi-check-square" aria-hidden="true"></i>No tasks
                found. Clear your filters or create a new task.
              </div>
            </td>
          </tr></ng-template
        >
      </p-table>
    </div>
    @if (selected().length) {
      <div class="row" style="margin-top: 15px">
        <small>{{ selected().length }} selected</small
        ><p-button
          label="Mark as done"
          icon="pi pi-check"
          severity="secondary"
          [outlined]="true"
          [loading]="store.loading()"
          (onClick)="completeSelected()"
        />
      </div>
    }
    <p-dialog
      [header]="editing()?.id ? 'Edit task' : 'Create a task'"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '520px' }"
      [draggable]="false"
    >
      <form [formGroup]="form" (ngSubmit)="save()" class="form-stack">
        <label for="task-title"
          >Title<input
            pInputText
            id="task-title"
            formControlName="title"
            placeholder="What needs to be done?"
        /></label>
        <div class="form-grid">
          <label for="task-status"
            >Status<p-select
              inputId="task-status"
              ariaLabel="Status"
              [options]="statusOptions"
              optionLabel="label"
              optionValue="value"
              formControlName="status"
              appendTo="body" /></label
          ><label for="task-priority"
            >Priority<p-select
              inputId="task-priority"
              ariaLabel="Priority"
              [options]="priorities"
              formControlName="priority"
              appendTo="body"
          /></label>
        </div>
        <label for="task-label"
          >Label<p-select
            inputId="task-label"
            ariaLabel="Label"
            [options]="labels"
            formControlName="label"
            appendTo="body"
        /></label>
        @if (form.touched && form.invalid) {
          <small class="field-error">Give your task a title.</small>
        }
        <div class="form-actions">
          <p-button
            label="Cancel"
            [text]="true"
            severity="secondary"
            (onClick)="visible.set(false)"
          /><p-button
            label="Save task"
            type="submit"
            [loading]="store.loading()"
          />
        </div>
      </form>
    </p-dialog>`,
})
export class TasksPage {
  readonly store = inject(AdminStore);
  private readonly confirmation = inject(ConfirmationService);
  readonly query = signal("");
  readonly status = signal<string | null>(null);
  readonly priority = signal<string | null>(null);
  readonly visible = signal(false);
  readonly editing = signal<Task | null>(null);
  readonly selected = signal<Task[]>([]);
  readonly statuses = ["backlog", "todo", "in_progress", "done"];
  readonly statusOptions = this.statuses.map((value) => ({
    label: displayLabel(value),
    value,
  }));
  readonly priorities = ["low", "medium", "high"];
  readonly labels = ["feature", "bug", "documentation"];
  readonly form = inject(FormBuilder).nonNullable.group({
    title: ["", [Validators.required, Validators.pattern(/\S/)]],
    status: ["todo"],
    priority: ["medium"],
    label: ["feature"],
  });
  readonly filtered = computed(() =>
    this.store
      .tasks()
      .filter(
        (t) =>
          (t.title + t.id + t.label)
            .toLowerCase()
            .includes(this.query().toLowerCase()) &&
          (!this.status() || t.status === this.status()) &&
          (!this.priority() || t.priority === this.priority()),
      ),
  );
  constructor() {
    void this.store.loadTasks();
  }
  edit(task?: Task): void {
    this.editing.set(task ?? null);
    this.form.reset(
      task ?? {
        title: "",
        status: "todo",
        priority: "medium",
        label: "feature",
      },
    );
    this.visible.set(true);
  }
  async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (
      await this.store.saveTask({
        id: this.editing()?.id ?? "",
        createdAt: this.editing()?.createdAt ?? new Date().toISOString(),
        ...this.form.getRawValue(),
      })
    )
      this.visible.set(false);
  }
  remove(task: Task): void {
    this.confirmation.confirm({
      header: "Delete task?",
      message: `“${task.title}” will be removed from your workspace.`,
      acceptLabel: "Delete task",
      rejectLabel: "Keep task",
      accept: () => {
        void this.store.deleteTask(task.id);
        this.selected.update((items) => items.filter((t) => t.id !== task.id));
      },
    });
  }
  async completeSelected(): Promise<void> {
    for (const task of this.selected()) {
      if (!(await this.store.saveTask({ ...task, status: "done" }))) return;
    }
    this.selected.set([]);
  }
  export(): void {
    downloadTextFile(
      "tasks.csv",
      [
        ["ID", "Title", "Status", "Priority", "Label"],
        ...this.filtered().map((t) => [
          t.id,
          t.title,
          t.status,
          t.priority,
          t.label,
        ]),
      ]
        .map((row) => row.map(csvCell).join(","))
        .join("\r\n"),
    );
  }
}
