import { Component, computed, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Button } from "@openng/optimus-ui/button";
import { InputText } from "@openng/optimus-ui/inputtext";
import { Textarea } from "@openng/optimus-ui/textarea";
import { DatePicker } from "@openng/optimus-ui/datepicker";
import { Select } from "@openng/optimus-ui/select";
import { Dialog } from "@openng/optimus-ui/dialog";
import { ConfirmationService } from "@openng/optimus-ui/api";
import { AdminStore } from "../../core/admin.store";
import { CalendarEvent } from "../../core/models";
import { PageHeader } from "../../shared/page-header";

export function calendarDays(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = 1 - ((first.getDay() + 6) % 7);
  return Array.from(
    { length: 42 },
    (_, i) => new Date(month.getFullYear(), month.getMonth(), start + i),
  );
}

@Component({
  selector: "app-calendar",
  imports: [
    DatePipe,
    ReactiveFormsModule,
    Button,
    InputText,
    Textarea,
    DatePicker,
    Select,
    Dialog,
    PageHeader,
  ],
  template: ` <app-page-header
      title="Calendar"
      description="Make room for the things that matter."
      ><p-button label="New event" icon="pi pi-plus" (onClick)="edit()"
    /></app-page-header>
    <section class="panel">
      <div class="panel-header">
        <div class="row">
          <p-button
            icon="pi pi-chevron-left"
            [text]="true"
            severity="secondary"
            ariaLabel="Previous month"
            (onClick)="move(-1)"
          />
          <h2>{{ month() | date: "MMMM y" }}</h2>
          <p-button
            icon="pi pi-chevron-right"
            [text]="true"
            severity="secondary"
            ariaLabel="Next month"
            (onClick)="move(1)"
          />
        </div>
        <p-button
          label="Today"
          [outlined]="true"
          severity="secondary"
          (onClick)="month.set(today)"
        />
      </div>
      <div class="calendar-scroll">
        <div class="calendar-grid">
          @for (day of weekdays; track day) {
            <div class="weekday">{{ day }}</div>
          }
          @for (day of days(); track day.toISOString()) {
            <div
              class="calendar-day"
              [class.other-month]="day.getMonth() !== month().getMonth()"
            >
              <button
                class="day-number"
                [class.today]="sameDay(day, today)"
                [attr.aria-label]="'Add event on ' + (day | date: 'fullDate')"
                (click)="edit(undefined, day)"
              >
                {{ day.getDate() }}
              </button>
              @for (event of eventsOn(day); track event.id) {
                <button
                  class="calendar-event"
                  [class.personal]="event.type === 'personal'"
                  (click)="edit(event)"
                  [attr.title]="event.title"
                >
                  {{ event.startsAt | date: "HH:mm" }} {{ event.title }}
                </button>
              }
            </div>
          }
        </div>
      </div>
    </section>
    <div class="row muted" style="font-size: 11px; margin-top: 18px">
      <span class="live-dot"></span> Work &amp; shared
      <span style="color:#8b5cf6;margin-left:12px">●</span> Personal
    </div>
    <p-dialog
      [header]="editing() ? 'Edit event' : 'Create an event'"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '520px' }"
      [draggable]="false"
      ><form [formGroup]="form" (ngSubmit)="save()" class="form-stack">
        <label for="event-title"
          >Event title<input
            pInputText
            id="event-title"
            formControlName="title" /></label
        ><label for="event-date"
          >Date and time<p-datepicker
            inputId="event-date"
            formControlName="date"
            [showTime]="true"
            [showIcon]="true"
            hourFormat="24"
            appendTo="body"
            [fluid]="true"
        /></label>
        <div class="form-grid">
          <label for="event-type"
            >Type<p-select
              inputId="event-type"
              ariaLabel="Type"
              [options]="types"
              formControlName="type"
              appendTo="body" /></label
          ><label for="event-calendar"
            >Calendar<p-select
              inputId="event-calendar"
              ariaLabel="Calendar"
              [options]="calendars"
              formControlName="calendar"
              appendTo="body"
          /></label>
        </div>
        <label for="event-location"
          >Location<input
            pInputText
            id="event-location"
            formControlName="location" /></label
        ><label for="event-description"
          >Description<textarea
            pTextarea
            id="event-description"
            formControlName="description"
            rows="2"
          ></textarea>
        </label>
        @if (form.touched && form.invalid) {
          <small class="field-error">Add a title and a valid date.</small>
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
            label="Save event"
            type="submit"
            [loading]="store.loading()"
          />
        </div></form
    ></p-dialog>`,
  styles: `
    .calendar-scroll {
      overflow: auto;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      min-width: 680px;
    }
    .weekday {
      font-size: 11px;
      color: var(--muted);
      padding: 12px 15px;
      background: var(--surface);
      border-top: 1px solid var(--border);
    }
    .calendar-day {
      min-height: 106px;
      padding: 8px;
      border-top: 1px solid var(--border);
      border-right: 1px solid var(--border);
    }
    .calendar-day:nth-child(7n) {
      border-right: 0;
    }
    .other-month {
      background: var(--surface);
      color: var(--muted);
    }
    .day-number {
      width: 25px;
      height: 25px;
      border: 0;
      background: transparent;
      border-radius: 50%;
      color: inherit;
      font-size: 11px;
      margin-bottom: 5px;
    }
    .day-number.today {
      background: var(--text);
      color: var(--bg);
    }
    .calendar-event {
      display: block;
      width: 100%;
      text-align: left;
      font-size: 9px;
      border: 1px solid color-mix(in srgb, var(--green), transparent 80%);
      background: var(--green-bg);
      color: var(--green);
      padding: 4px;
      border-radius: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 4px;
    }
    .calendar-event.personal {
      background: #8b5cf614;
      color: #7c3aed;
      border-color: #8b5cf640;
    }
    :host-context(.dark) .calendar-event.personal {
      color: #c4b5fd;
    }
    @media (max-width: 600px) {
      .calendar-day {
        min-height: 90px;
      }
    }
  `,
})
export class CalendarPage {
  readonly store = inject(AdminStore);
  private readonly confirmation = inject(ConfirmationService);
  readonly today = new Date();
  readonly month = signal(this.today);
  readonly days = computed(() => calendarDays(this.month()));
  readonly weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  readonly visible = signal(false);
  readonly editing = signal<CalendarEvent | null>(null);
  readonly types = ["meeting", "event", "personal", "task", "reminder"];
  readonly calendars = ["Work", "Personal", "Shared"];
  readonly form = inject(FormBuilder).nonNullable.group({
    title: ["", [Validators.required, Validators.pattern(/\S/)]],
    date: [new Date(), Validators.required],
    type: ["meeting"],
    calendar: ["Work"],
    location: [""],
    description: [""],
  });
  constructor() {
    void this.store.loadEvents();
  }
  sameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
  eventsOn(day: Date): CalendarEvent[] {
    return this.store
      .events()
      .filter((e) => this.sameDay(new Date(e.startsAt), day));
  }
  move(offset: number): void {
    this.month.update(
      (date) => new Date(date.getFullYear(), date.getMonth() + offset, 1),
    );
  }
  edit(event?: CalendarEvent, day = new Date()): void {
    this.editing.set(event ?? null);
    this.form.reset(
      event
        ? { ...event, date: new Date(event.startsAt) }
        : {
            title: "",
            date: new Date(
              day.getFullYear(),
              day.getMonth(),
              day.getDate(),
              10,
            ),
            type: "meeting",
            calendar: "Work",
            location: "",
            description: "",
          },
    );
    this.visible.set(true);
  }
  async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { date, ...values } = this.form.getRawValue();
    if (!date || Number.isNaN(date.getTime())) return;
    if (
      await this.store.saveEvent({
        id: this.editing()?.id ?? "",
        startsAt: date.toISOString(),
        duration: this.editing()?.duration ?? "1 hour",
        attendees: this.editing()?.attendees ?? [],
        allDay: false,
        reminder: true,
        ...values,
      })
    )
      this.visible.set(false);
  }
  remove(): void {
    const event = this.editing();
    if (!event) return;
    this.confirmation.confirm({
      header: "Delete event?",
      message: event.title,
      acceptLabel: "Delete event",
      rejectLabel: "Cancel",
      accept: async () => {
        if (await this.store.deleteEvent(event.id)) this.visible.set(false);
      },
    });
  }
}
