import { Component, computed, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Button } from "@openng/optimus-ui/button";
import { InputText } from "@openng/optimus-ui/inputtext";
import { Textarea } from "@openng/optimus-ui/textarea";
import { Dialog } from "@openng/optimus-ui/dialog";
import { Avatar } from "@openng/optimus-ui/avatar";
import { Select } from "@openng/optimus-ui/select";
import { AdminStore } from "../../core/admin.store";
import { Mail } from "../../core/models";
import { PageHeader } from "../../shared/page-header";

@Component({
  selector: "app-mail",
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    Button,
    InputText,
    Textarea,
    Dialog,
    Avatar,
    Select,
    PageHeader,
  ],
  template: ` <app-page-header
      title="Mail"
      description="Less noise. More meaningful conversations."
      ><p-button
        label="Compose"
        icon="pi pi-pencil"
        (onClick)="compose.set(true)"
    /></app-page-header>
    <div class="table-toolbar">
      <p-select
        [options]="folders"
        [(ngModel)]="folder"
        ariaLabel="Mail folder"
      /><span class="search-field"
        ><i class="pi pi-search" aria-hidden="true"></i
        ><input
          pInputText
          placeholder="Search mail..."
          aria-label="Search mail"
          [(ngModel)]="query" /></span
      ><small style="margin-left:auto"
        >Sample inbox · messages stay in this demo</small
      >
    </div>
    <section class="mail-layout panel">
      <div class="mail-list" aria-label="Messages">
        @for (mail of filtered(); track mail.id) {
          <button
            class="mail-item"
            [class.selected]="selected()?.id === mail.id"
            (click)="open(mail)"
          >
            <div class="row spread">
              <strong
                >{{ mail.name }}
                @if (!mail.read) {
                  <span class="live-dot"></span>
                }</strong
              ><small>{{ mail.date | date: "MMM d" }}</small>
            </div>
            <h3>{{ mail.subject }}</h3>
            <p>{{ mail.text }}</p>
            <div class="row" style="gap: 5px">
              @for (label of mail.labels; track label) {
                <span class="version">{{ label }}</span>
              }
            </div>
          </button>
        } @empty {
          <div class="empty-state">No messages in this folder.</div>
        }
      </div>
      <div class="mail-detail">
        @if (selected(); as mail) {
          <div class="mail-detail-header">
            <div class="person-cell">
              <p-avatar
                [label]="mail.name.slice(0, 2).toUpperCase()"
                shape="circle"
              /><span
                ><strong>{{ mail.name }}</strong
                ><small>{{ mail.email }}</small></span
              >
            </div>
            <div class="row">
              <p-button
                icon="pi pi-inbox"
                [text]="true"
                severity="secondary"
                ariaLabel="Archive message"
                (onClick)="move(mail, 'Archive')"
              /><p-button
                icon="pi pi-trash"
                [text]="true"
                severity="secondary"
                ariaLabel="Move message to trash"
                (onClick)="move(mail, 'Trash')"
              />
            </div>
          </div>
          <div class="mail-body">
            <small>{{ mail.date | date: "medium" }}</small>
            <h2>{{ mail.subject }}</h2>
            <p>{{ mail.text }}</p>
          </div>
          <div class="mail-reply">
            <p-button
              label="Reply"
              icon="pi pi-reply"
              severity="secondary"
              [outlined]="true"
              (onClick)="reply(mail)"
            />
          </div>
        } @else {
          <div class="empty-state">
            <i class="pi pi-inbox" aria-hidden="true"></i>Select a message to
            read it.
          </div>
        }
      </div>
    </section>
    <p-dialog
      header="New message"
      [(visible)]="compose"
      [modal]="true"
      [style]="{ width: '580px' }"
      [draggable]="false"
      ><form [formGroup]="form" (ngSubmit)="send()" class="form-stack">
        <label for="mail-to"
          >To<input
            pInputText
            id="mail-to"
            formControlName="to"
            type="email" /></label
        ><label for="mail-subject"
          >Subject<input
            pInputText
            id="mail-subject"
            formControlName="subject" /></label
        ><label for="mail-body"
          >Message<textarea
            pTextarea
            id="mail-body"
            formControlName="body"
            rows="7"
          ></textarea></label
        ><small
          >Messages are saved in the demo Sent folder. No external email is
          sent.</small
        >
        @if (form.touched && form.invalid) {
          <small class="field-error"
            >Enter a valid recipient, subject, and message.</small
          >
        }
        <div class="form-actions">
          <p-button
            label="Cancel"
            [text]="true"
            severity="secondary"
            (onClick)="compose.set(false)"
          /><p-button
            label="Send message"
            icon="pi pi-send"
            type="submit"
            [loading]="store.loading()"
          />
        </div></form
    ></p-dialog>`,
  styles: `
    .mail-layout {
      display: grid;
      grid-template-columns: 330px minmax(0, 1fr);
      min-height: 570px;
    }
    .mail-list {
      border-right: 1px solid var(--border);
    }
    .mail-item {
      display: block;
      text-align: left;
      width: 100%;
      padding: 20px;
      border: 0;
      border-bottom: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
    }
    .mail-item:hover,
    .mail-item.selected {
      background: var(--surface);
    }
    .mail-item strong {
      font-size: 12px;
      font-weight: 600;
    }
    .mail-item small {
      font-size: 10px;
    }
    .mail-item .live-dot {
      width: 5px;
      height: 5px;
      margin-left: 4px;
    }
    .mail-item h3 {
      font-size: 12px;
      margin-top: 9px;
    }
    .mail-item p {
      font-size: 11px;
      color: var(--muted);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.7;
      margin: 5px 0 11px;
    }
    .mail-detail {
      display: flex;
      flex-direction: column;
    }
    .mail-detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
      padding: 17px 24px;
    }
    .mail-body {
      padding: 26px;
      flex: 1;
    }
    .mail-body h2 {
      margin: 15px 0 25px;
    }
    .mail-body p {
      white-space: pre-wrap;
      font-size: 13px;
      line-height: 1.9;
      color: var(--muted);
    }
    .mail-reply {
      padding: 20px 26px;
      border-top: 1px solid var(--border);
    }
    @media (max-width: 1100px) {
      .mail-layout {
        grid-template-columns: 270px minmax(0, 1fr);
      }
    }
    @media (max-width: 700px) {
      .mail-layout {
        grid-template-columns: 1fr;
      }
      .mail-list {
        border-right: 0;
        max-height: 330px;
        overflow: auto;
        border-bottom: 1px solid var(--border);
      }
    }
  `,
})
export class MailPage {
  readonly store = inject(AdminStore);
  readonly query = signal("");
  readonly folder = signal("Inbox");
  readonly folders = ["Inbox", "Sent", "Archive", "Trash"];
  readonly selectedId = signal("");
  readonly compose = signal(false);
  readonly filtered = computed(() =>
    this.store
      .mails()
      .filter(
        (m) =>
          m.folder === this.folder() &&
          (m.name + m.subject + m.text)
            .toLowerCase()
            .includes(this.query().toLowerCase()),
      ),
  );
  readonly selected = computed(
    () => this.filtered().find((m) => m.id === this.selectedId()) ?? null,
  );
  readonly form = inject(FormBuilder).nonNullable.group({
    to: ["", [Validators.required, Validators.email]],
    subject: ["", Validators.required],
    body: ["", Validators.required],
  });
  constructor() {
    void this.store.loadMails();
  }
  open(mail: Mail): void {
    this.selectedId.set(mail.id);
    if (!mail.read) void this.store.markMail(mail.id, true);
  }
  async move(mail: Mail, folder: string): Promise<void> {
    if (await this.store.moveMail(mail.id, folder)) this.selectedId.set("");
  }
  reply(mail: Mail): void {
    this.form.reset({
      to: mail.email,
      subject: `Re: ${mail.subject}`,
      body: "",
    });
    this.compose.set(true);
  }
  async send(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { to, subject, body } = this.form.getRawValue();
    if (await this.store.sendMail(to, subject, body)) {
      this.compose.set(false);
      this.form.reset();
      this.folder.set("Sent");
    }
  }
}
