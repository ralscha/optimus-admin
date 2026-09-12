import { Component, computed, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
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
import { Avatar } from "@openng/optimus-ui/avatar";
import { ConfirmationService } from "@openng/optimus-ui/api";
import { AdminStore } from "../../core/admin.store";
import { AuthStore } from "../../core/auth.store";
import { User } from "../../core/models";
import { PageHeader } from "../../shared/page-header";
import { StatusTag } from "../../shared/status-tag";

@Component({
  selector: "app-users",
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    Button,
    InputText,
    Select,
    Dialog,
    Avatar,
    PageHeader,
    StatusTag,
  ],
  template: ` <app-page-header
      title="Users"
      description="The people behind the progress. Manage your team here."
      ><p-button label="Add user" icon="pi pi-user-plus" (onClick)="edit()"
    /></app-page-header>
    <div class="metric-grid">
      <article class="metric">
        <p class="metric-label">Total users</p>
        <div class="metric-value">{{ store.users().length }}</div>
        <p class="metric-foot">People in your workspace</p>
      </article>
      @for (state of statuses; track state) {
        <article class="metric">
          <p class="metric-label" style="text-transform: capitalize">
            {{ state }}
          </p>
          <div class="metric-value">{{ count(state) }}</div>
          <p class="metric-foot">
            {{
              state === "active"
                ? "Ready to collaborate"
                : state === "invited"
                  ? "Waiting to join the team"
                  : "Access currently paused"
            }}
          </p>
        </article>
      }
    </div>
    <div class="table-toolbar">
      <span class="search-field"
        ><i class="pi pi-search" aria-hidden="true"></i
        ><input
          pInputText
          placeholder="Search people..."
          aria-label="Search users"
          [(ngModel)]="query" /></span
      ><p-select
        [options]="roles()"
        [(ngModel)]="role"
        placeholder="All roles"
        [showClear]="true"
        ariaLabel="Filter user role"
      />
    </div>
    <div class="table-container">
      <p-table
        [value]="filtered()"
        [loading]="store.loading()"
        [paginator]="true"
        [rows]="8"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="{first}–{last} of {totalRecords} people"
        [tableStyle]="{ 'min-width': '700px' }"
        ><ng-template #header
          ><tr>
            <th pSortableColumn="name">Name <p-sortIcon field="name" /></th>
            <th>Role</th>
            <th>Status</th>
            <th>Last active</th>
            <th>Actions</th>
          </tr></ng-template
        ><ng-template #body let-user
          ><tr>
            <td>
              <div class="person-cell">
                <p-avatar [label]="initials(user.name)" shape="circle" /><span
                  ><strong>{{ user.name }}</strong
                  ><small>{{ user.email }}</small></span
                >
              </div>
            </td>
            <td>
              <span class="version">{{ user.role }}</span>
            </td>
            <td><app-status-tag [value]="user.status" /></td>
            <td class="muted">{{ user.lastLogin | date: "MMM d, y" }}</td>
            <td>
              <div class="row-actions">
                <p-button
                  icon="pi pi-pencil"
                  [text]="true"
                  severity="secondary"
                  [ariaLabel]="'Edit ' + user.name"
                  (onClick)="edit(user)"
                /><p-button
                  icon="pi pi-trash"
                  [text]="true"
                  severity="secondary"
                  [ariaLabel]="'Delete ' + user.name"
                  [disabled]="user.id === auth.user()?.id"
                  (onClick)="remove(user)"
                />
              </div>
            </td></tr></ng-template
        ><ng-template #emptymessage
          ><tr>
            <td colspan="5" class="empty-state">
              No people match your search.
            </td>
          </tr></ng-template
        ></p-table
      >
    </div>
    <p-dialog
      [header]="editing()?.id ? 'Edit user' : 'Add a team member'"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
      ><form [formGroup]="form" (ngSubmit)="save()" class="form-stack">
        <label for="user-name"
          >Full name<input
            pInputText
            id="user-name"
            formControlName="name"
            autocomplete="name" /></label
        ><label for="user-email"
          >Email address<input
            pInputText
            id="user-email"
            type="email"
            formControlName="email"
            autocomplete="email"
        /></label>
        <div class="form-grid">
          <label for="user-role"
            >Role<p-select
              inputId="user-role"
              ariaLabel="Role"
              [options]="roles()"
              formControlName="role"
              appendTo="body" /></label
          ><label for="user-status"
            >Status<p-select
              inputId="user-status"
              ariaLabel="Status"
              [options]="statuses"
              formControlName="status"
              appendTo="body"
          /></label>
        </div>
        <small
          >Demo directory only. Adding a user does not send an invitation
          email.</small
        >
        @if (form.touched && form.invalid) {
          <small class="field-error"
            >Enter a name and valid email address.</small
          >
        }
        <div class="form-actions">
          <p-button
            label="Cancel"
            [text]="true"
            severity="secondary"
            (onClick)="visible.set(false)"
          /><p-button
            label="Save user"
            type="submit"
            [loading]="store.loading()"
          />
        </div></form
    ></p-dialog>`,
})
export class UsersPage {
  readonly store = inject(AdminStore);
  readonly auth = inject(AuthStore);
  private readonly confirmation = inject(ConfirmationService);
  readonly query = signal("");
  readonly role = signal<string | null>(null);
  readonly editing = signal<User | null>(null);
  readonly visible = signal(false);
  readonly roles = computed(() =>
    this.auth.user()?.role === "Owner"
      ? ["Owner", "Admin", "Editor", "Viewer"]
      : ["Admin", "Editor", "Viewer"],
  );
  readonly statuses = ["active", "invited", "suspended"];
  readonly form = inject(FormBuilder).nonNullable.group({
    name: ["", [Validators.required, Validators.pattern(/\S/)]],
    email: ["", [Validators.required, Validators.email]],
    role: ["Viewer"],
    status: ["invited"],
  });
  readonly filtered = computed(() =>
    this.store
      .users()
      .filter(
        (u) =>
          (u.name + u.email)
            .toLowerCase()
            .includes(this.query().toLowerCase()) &&
          (!this.role() || u.role === this.role()),
      ),
  );
  constructor() {
    void this.store.loadUsers();
  }
  count(status: string): number {
    return this.store.users().filter((u) => u.status === status).length;
  }
  initials(name: string): string {
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("");
  }
  edit(user?: User): void {
    this.editing.set(user ?? null);
    this.form.reset(
      user ?? { name: "", email: "", role: "Viewer", status: "invited" },
    );
    this.visible.set(true);
  }
  async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const now = new Date().toISOString();
    if (
      await this.store.saveUser({
        id: this.editing()?.id ?? "",
        createdAt: this.editing()?.createdAt ?? now,
        lastLogin: this.editing()?.lastLogin ?? now,
        ...this.form.getRawValue(),
      })
    ) {
      this.visible.set(false);
      if (this.editing()?.id === this.auth.user()?.id)
        await this.auth.refresh();
    }
  }
  remove(user: User): void {
    this.confirmation.confirm({
      header: "Remove user?",
      message: `Remove ${user.name} from the workspace?`,
      acceptLabel: "Remove user",
      rejectLabel: "Cancel",
      accept: () => void this.store.deleteUser(user.id),
    });
  }
}
