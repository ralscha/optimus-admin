import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { CdkDragDrop, DragDropModule } from "@angular/cdk/drag-drop";
import { Button } from "@openng/optimus-ui/button";
import { InputText } from "@openng/optimus-ui/inputtext";
import { Textarea } from "@openng/optimus-ui/textarea";
import { Select } from "@openng/optimus-ui/select";
import { Dialog } from "@openng/optimus-ui/dialog";
import { Avatar } from "@openng/optimus-ui/avatar";
import { ConfirmationService } from "@openng/optimus-ui/api";
import { AdminStore } from "../../core/admin.store";
import { KanbanTask } from "../../core/models";
import { PageHeader } from "../../shared/page-header";
import { StatusTag } from "../../shared/status-tag";

@Component({
  selector: "app-kanban",
  imports: [
    ReactiveFormsModule,
    DragDropModule,
    Button,
    InputText,
    Textarea,
    Select,
    Dialog,
    Avatar,
    PageHeader,
    StatusTag,
  ],
  template: ` <app-page-header
      title="Kanban board"
      description="From the first idea to the finish line. Keep work moving."
      ><p-button label="Add task" icon="pi pi-plus" (onClick)="edit()"
    /></app-page-header>
    <div class="board" cdkDropListGroup>
      @for (column of columns; track column.value) {
        <section class="board-column">
          <div class="column-heading">
            <span
              class="column-dot"
              [class.done]="column.value === 'done'"
              [class.progress]="column.value === 'in_progress'"
            ></span>
            <h2>{{ column.label }}</h2>
            <span class="version">items</span
            ><p-button
              icon="pi pi-plus"
              [text]="true"
              severity="secondary"
              [ariaLabel]="'Add task to ' + column.label"
              (onClick)="edit(undefined, column.value)"
            />
          </div>
          <div
            class="board-dropzone"
            cdkDropList
            [id]="column.value"
            [cdkDropListData]="column.value"
            (cdkDropListDropped)="drop($event)"
          >
            @for (task of tasks(column.value); track task.id) {
              <article
                class="board-card"
                cdkDrag
                [cdkDragData]="task"
                [cdkDragDisabled]="store.loading()"
              >
                <div class="row spread">
                  <app-status-tag [value]="task.priority" /><p-button
                    icon="pi pi-ellipsis-h"
                    [text]="true"
                    severity="secondary"
                    [ariaLabel]="'Edit ' + task.title"
                    (onClick)="edit(task)"
                  />
                </div>
                <h3>{{ task.title }}</h3>
                <p>{{ task.description }}</p>
                <div class="board-card-footer">
                  <p-avatar
                    [label]="initials(task.assignee)"
                    shape="circle"
                  /><span>{{ task.assignee || "Unassigned" }}</span
                  ><i class="pi pi-bars" aria-hidden="true"></i>
                </div>
              </article>
            } @empty {
              <div class="empty-column">Drop a task here or add a new one.</div>
            }
          </div>
          <button
            class="add-board-task"
            (click)="edit(undefined, column.value)"
          >
            <i class="pi pi-plus" aria-hidden="true"></i> Add task
          </button>
        </section>
      }
    </div>
    <p class="muted" style="font-size: 11px; margin-top: 20px">
      Drag cards between columns, or open a card to change its status with the
      keyboard.
    </p>
    <p-dialog
      [header]="editing() ? 'Edit board task' : 'New board task'"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '520px' }"
      [draggable]="false"
      ><form [formGroup]="form" (ngSubmit)="save()" class="form-stack">
        <label for="board-title"
          >Title<input
            pInputText
            id="board-title"
            formControlName="title" /></label
        ><label for="board-description"
          >Description<textarea
            pTextarea
            id="board-description"
            formControlName="description"
            rows="3"
          ></textarea></label
        ><label for="board-assignee"
          >Assignee<input
            pInputText
            id="board-assignee"
            formControlName="assignee"
        /></label>
        <div class="form-grid">
          <label for="board-status"
            >Status<p-select
              inputId="board-status"
              ariaLabel="Status"
              [options]="columns"
              optionLabel="label"
              optionValue="value"
              formControlName="status"
              appendTo="body" /></label
          ><label for="board-priority"
            >Priority<p-select
              inputId="board-priority"
              ariaLabel="Priority"
              [options]="priorities"
              formControlName="priority"
              appendTo="body"
          /></label>
        </div>
        @if (form.touched && form.invalid) {
          <small class="field-error">A title is required.</small>
        }
        <div class="form-actions">
          @if (editing()) {
            <p-button
              label="Delete"
              severity="danger"
              [text]="true"
              (onClick)="remove()"
            />
          }
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
        </div></form
    ></p-dialog>`,
  styles: `
    .board {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 20px;
    }
    .board-column {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      align-self: start;
    }
    .column-heading {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 0 3px 10px;
    }
    .column-heading h2 {
      font-size: 13px;
      flex: 1;
    }
    .column-heading .version {
      display: none;
    }
    .column-dot {
      height: 8px;
      width: 8px;
      border: 2px solid var(--muted);
      border-radius: 50%;
    }
    .column-dot.progress {
      border-color: #3b82f6;
    }
    .column-dot.done {
      border-color: #22c55e;
      background: #22c55e;
    }
    .board-dropzone {
      min-height: 150px;
    }
    .board-card {
      border: 1px solid var(--border);
      border-radius: 9px;
      padding: 14px 16px;
      background: var(--bg);
      margin-bottom: 12px;
      cursor: grab;
      box-shadow: 0 2px 3px #00000003;
    }
    .board-card h3 {
      font-size: 13px;
      margin: 10px 0 7px;
    }
    .board-card > p {
      font-size: 11px;
      color: var(--muted);
      line-height: 1.7;
      min-height: 36px;
    }
    .board-card-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      border-top: 1px solid var(--border);
      padding-top: 12px;
      margin-top: 16px;
      font-size: 10px;
      color: var(--muted);
    }
    .board-card-footer > .pi {
      margin-left: auto;
    }
    .add-board-task {
      width: 100%;
      background: transparent;
      border: 0;
      border-radius: 7px;
      padding: 10px;
      text-align: left;
      color: var(--muted);
      font-size: 11px;
    }
    .add-board-task:hover {
      background: var(--muted-surface);
    }
    .add-board-task .pi {
      font-size: 10px;
      margin-right: 7px;
    }
    .empty-column {
      padding: 40px 10px;
      color: var(--muted);
      text-align: center;
      font-size: 12px;
    }
    .cdk-drag-preview {
      box-shadow: 0 10px 35px #0003;
    }
    .cdk-drag-placeholder {
      opacity: 0.3;
    }
    .cdk-drag-animating {
      transition: transform 0.2s;
    }
    @media (max-width: 1100px) {
      .board {
        gap: 12px;
      }
      .board-card {
        padding: 12px;
      }
    }
    @media (max-width: 700px) {
      .board {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class KanbanPage {
  readonly store = inject(AdminStore);
  private readonly confirmation = inject(ConfirmationService);
  readonly columns = [
    { label: "To do", value: "todo" },
    { label: "In progress", value: "in_progress" },
    { label: "Done", value: "done" },
  ];
  readonly priorities = ["low", "medium", "high"];
  readonly visible = signal(false);
  readonly editing = signal<KanbanTask | null>(null);
  readonly form = inject(FormBuilder).nonNullable.group({
    title: ["", [Validators.required, Validators.pattern(/\S/)]],
    description: [""],
    assignee: [""],
    status: ["todo"],
    priority: ["medium"],
  });
  constructor() {
    void this.store.loadKanban();
  }
  tasks(status: string): KanbanTask[] {
    return this.store.kanban().filter((t) => t.status === status);
  }
  initials(name: string): string {
    return name
      ? name
          .split(" ")
          .map((s) => s[0])
          .slice(0, 2)
          .join("")
      : "?";
  }
  edit(task?: KanbanTask, status = "todo"): void {
    this.editing.set(task ?? null);
    this.form.reset(
      task ?? {
        title: "",
        description: "",
        assignee: "",
        status,
        priority: "medium",
      },
    );
    this.visible.set(true);
  }
  async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (
      await this.store.saveKanban({
        id: this.editing()?.id ?? "",
        ...this.form.getRawValue(),
      })
    )
      this.visible.set(false);
  }
  async drop(event: CdkDragDrop<string>): Promise<void> {
    const task = event.item.data as KanbanTask;
    if (task.status !== event.container.data)
      await this.store.saveKanban({ ...task, status: event.container.data });
  }
  remove(): void {
    const task = this.editing();
    if (!task) return;
    this.confirmation.confirm({
      header: "Delete this task?",
      message: task.title,
      acceptLabel: "Delete task",
      rejectLabel: "Cancel",
      accept: async () => {
        if (await this.store.deleteKanban(task.id)) this.visible.set(false);
      },
    });
  }
}
