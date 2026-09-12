import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Button, ButtonDirective } from "@openng/optimus-ui/button";
import { InputText } from "@openng/optimus-ui/inputtext";
import { Select } from "@openng/optimus-ui/select";
import { ToggleSwitch } from "@openng/optimus-ui/toggleswitch";
import { Checkbox } from "@openng/optimus-ui/checkbox";
import { ProgressBar } from "@openng/optimus-ui/progressbar";
import { Slider } from "@openng/optimus-ui/slider";
import { Tag } from "@openng/optimus-ui/tag";
import { Avatar } from "@openng/optimus-ui/avatar";
import { Dialog } from "@openng/optimus-ui/dialog";
import { Message } from "@openng/optimus-ui/message";
import { MessageService } from "@openng/optimus-ui/api";
import { TabsModule } from "@openng/optimus-ui/tabs";
import { PageHeader } from "../../shared/page-header";

@Component({
  selector: "app-components",
  imports: [
    FormsModule,
    Button,
    ButtonDirective,
    InputText,
    Select,
    ToggleSwitch,
    Checkbox,
    ProgressBar,
    Slider,
    Tag,
    Avatar,
    Dialog,
    Message,
    TabsModule,
    PageHeader,
  ],
  template: `<app-page-header
      title="UI components"
      description="Thoughtful building blocks. Ready to make your own."
      ><a
        pButton
        href="https://optimus.openng.org/"
        target="_blank"
        rel="noopener noreferrer"
        severity="secondary"
        [outlined]="true"
        ><span>Documentation</span
        ><i class="pi pi-arrow-up-right" aria-hidden="true"></i></a
    ></app-page-header>
    <div class="gallery-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Buttons</h2>
            <p>A clear next step, in every context.</p>
          </div>
          <span class="version">Button</span>
        </div>
        <div class="panel-body row" style="flex-wrap:wrap">
          <p-button
            label="Primary"
            (onClick)="toast('Primary action clicked')"
          /><p-button
            label="Secondary"
            severity="secondary"
            (onClick)="toast('Secondary action clicked')"
          /><p-button
            label="Outline"
            [outlined]="true"
            severity="secondary"
            (onClick)="toast('Outline action clicked')"
          /><p-button
            label="Subtle"
            [text]="true"
            severity="secondary"
            (onClick)="toast('Subtle action clicked')"
          /><p-button label="Disabled" [disabled]="true" />
        </div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Form controls</h2>
            <p>The details, without the friction.</p>
          </div>
          <span class="version">InputText · Select</span>
        </div>
        <div class="panel-body form-stack">
          <label for="gallery-name"
            >Project name<input
              pInputText
              id="gallery-name"
              placeholder="A great new idea"
              [(ngModel)]="name" /></label
          ><label for="gallery-framework"
            >Framework<p-select
              inputId="gallery-framework"
              ariaLabel="Framework"
              [options]="frameworks"
              [(ngModel)]="framework"
          /></label>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Selection</h2>
            <p>Small choices, clear feedback.</p>
          </div>
        </div>
        <div class="panel-body form-stack">
          <div class="row">
            <p-toggleswitch
              inputId="gallery-notifications"
              [(ngModel)]="notifications"
            /><label for="gallery-notifications">Enable notifications</label>
          </div>
          <div class="row">
            <p-checkbox
              inputId="gallery-terms"
              [binary]="true"
              [(ngModel)]="checked"
            /><label for="gallery-terms">Include in weekly summary</label>
          </div>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Status &amp; identity</h2>
            <p>Context at a glance.</p>
          </div>
        </div>
        <div class="panel-body form-stack">
          <div class="row" style="flex-wrap:wrap">
            <p-tag value="Active" severity="success" /><p-tag
              value="In progress"
              severity="info"
            /><p-tag value="Pending" severity="warn" /><p-tag
              value="Archived"
              severity="secondary"
            />
          </div>
          <div class="row">
            <p-avatar label="AK" shape="circle" /><p-avatar
              label="MR"
              shape="circle"
            /><p-avatar label="SD" shape="circle" /><small
              >Good things happen together.</small
            >
          </div>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Progress</h2>
            <p>Every small step adds up.</p>
          </div>
        </div>
        <div class="panel-body form-stack">
          <!-- Optimus 2.0.2 emits aria-level on progress bars. Remove it after each value update. -->
          <p-progressbar
            [value]="progress()"
            aria-label="Project completion"
            [pt]="{
              root: {
                'aria-level': null,
                'aria-valuetext': progress() + ' percent',
              },
            }"
          /><span id="gallery-progress-label"
            >Project completion: {{ progress() }}%</span
          ><p-slider
            ariaLabelledBy="gallery-progress-label"
            [(ngModel)]="progress"
            ariaLabel="Project completion"
          />
        </div>
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Feedback &amp; overlays</h2>
            <p>The right information at the right time.</p>
          </div>
        </div>
        <div class="panel-body form-stack">
          <p-message severity="success"
            >Your changes are saved. You’re all set.</p-message
          >
          <div class="row">
            <p-button
              label="Open dialog"
              [outlined]="true"
              severity="secondary"
              (onClick)="dialog.set(true)"
            /><p-button
              label="Show toast"
              [text]="true"
              severity="secondary"
              (onClick)="toast('A little feedback goes a long way.')"
            />
          </div>
        </div>
      </section>
      <section class="panel" style="grid-column:1/-1">
        <div class="panel-header">
          <div>
            <h2>Tabs</h2>
            <p>A place for everything.</p>
          </div>
        </div>
        <div class="panel-body">
          <p-tabs value="overview"
            ><p-tablist
              ><p-tab value="overview">Overview</p-tab
              ><p-tab value="details">Details</p-tab
              ><p-tab value="activity">Activity</p-tab></p-tablist
            ><p-tabpanels
              ><p-tabpanel value="overview"
                ><p class="muted">
                  A clean starting point for your next Angular application.
                </p></p-tabpanel
              ><p-tabpanel value="details"
                ><p class="muted">
                  Angular 22 standalone components, signals, Optimus UI v2, and
                  a Go JSON API.
                </p></p-tabpanel
              ><p-tabpanel value="activity"
                ><p class="muted">
                  All examples on this page use actual Optimus UI components.
                  Try them out.
                </p></p-tabpanel
              ></p-tabpanels
            ></p-tabs
          >
        </div>
      </section>
    </div>
    <p-dialog
      header="A little room to focus"
      [(visible)]="dialog"
      [modal]="true"
      [style]="{ width: '440px' }"
      [draggable]="false"
      ><p class="muted">
        Optimus dialogs handle focus, keyboard navigation, and the details that
        make an interface feel right.
      </p>
      <ng-template #footer
        ><p-button label="Got it" (onClick)="dialog.set(false)" /></ng-template
    ></p-dialog>`,
  styles: `
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
    }
    .panel-body {
      padding-top: 0;
    }
    @media (max-width: 800px) {
      .gallery-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class ComponentsPage {
  private readonly messages = inject(MessageService);
  readonly name = signal("");
  readonly framework = signal("Angular 22");
  readonly frameworks = ["Angular 22", "Optimus UI v2", "Go"];
  readonly notifications = signal(true);
  readonly checked = signal(false);
  readonly progress = signal(64);
  readonly dialog = signal(false);
  toast(detail: string): void {
    this.messages.add({
      severity: "success",
      summary: "Looking good",
      detail,
      life: 3000,
    });
  }
}
