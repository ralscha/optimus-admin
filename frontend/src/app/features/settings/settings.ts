import { Component, computed, effect, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink, RouterLinkActive } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { Button } from "@openng/optimus-ui/button";
import { InputText } from "@openng/optimus-ui/inputtext";
import { Textarea } from "@openng/optimus-ui/textarea";
import { Select } from "@openng/optimus-ui/select";
import { SelectButton } from "@openng/optimus-ui/selectbutton";
import { ToggleSwitch } from "@openng/optimus-ui/toggleswitch";
import { Skeleton } from "@openng/optimus-ui/skeleton";
import { Avatar } from "@openng/optimus-ui/avatar";
import { AdminStore } from "../../core/admin.store";
import { AuthStore } from "../../core/auth.store";
import { ThemeMode, ThemeStore } from "../../core/theme.store";
import { PageHeader } from "../../shared/page-header";

@Component({
  selector: "app-settings",
  imports: [
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    Button,
    InputText,
    Textarea,
    Select,
    SelectButton,
    ToggleSwitch,
    Skeleton,
    Avatar,
    PageHeader,
  ],
  template: ` <app-page-header
      title="Settings"
      description="A workspace that feels like yours."
    />
    <div class="settings-layout">
      <nav class="settings-nav" aria-label="Settings sections">
        @for (tab of tabs; track tab.path) {
          <a
            [routerLink]="tab.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            >{{ tab.label }}</a
          >
        }
      </nav>
      <section>
        @if (!store.settings()) {
          <p-skeleton height="300px" />
        } @else {
          <form [formGroup]="form" (ngSubmit)="save()" class="form-stack">
            @switch (section()) {
              @case ("appearance") {
                <div class="settings-heading">
                  <h2>Appearance</h2>
                  <p>Choose how Optimus looks on your device.</p>
                </div>
                <div class="form-stack">
                  <span id="theme-label">Color theme</span
                  ><p-selectbutton
                    [options]="themes"
                    formControlName="theme"
                    [allowEmpty]="false"
                    ariaLabelledBy="theme-label"
                  />
                </div>
                <div class="theme-previews">
                  <button
                    type="button"
                    class="theme-preview light-preview"
                    [class.selected]="form.controls.theme.value === 'light'"
                    (click)="form.controls.theme.setValue('light')"
                    aria-label="Select light theme"
                  >
                    <span></span><span></span><span></span
                    ><small>Light</small></button
                  ><button
                    type="button"
                    class="theme-preview dark-preview"
                    [class.selected]="form.controls.theme.value === 'dark'"
                    (click)="form.controls.theme.setValue('dark')"
                    aria-label="Select dark theme"
                  >
                    <span></span><span></span><span></span><small>Dark</small>
                  </button>
                </div>
                <div class="setting-row">
                  <div>
                    <label for="compact">Compact tables</label>
                    <p>Fit more rows on your screen.</p>
                  </div>
                  <p-toggleswitch inputId="compact" formControlName="compact" />
                </div>
              }
              @case ("notifications") {
                <div class="settings-heading">
                  <h2>Notifications</h2>
                  <p>Keep the updates you care about close.</p>
                </div>
                @for (item of notifications; track item.key) {
                  <div class="setting-row">
                    <div>
                      <label [for]="item.key">{{ item.label }}</label>
                      <p>{{ item.description }}</p>
                    </div>
                    <p-toggleswitch
                      [inputId]="item.key"
                      [formControlName]="item.key"
                    />
                  </div>
                }
                <small
                  >Preferences are saved for this demo. Notification delivery is
                  not connected.</small
                >
              }
              @case ("account") {
                <div class="settings-heading">
                  <h2>Account preferences</h2>
                  <p>Set your defaults for this workspace.</p>
                </div>
                <label for="language"
                  >Preferred language<p-select
                    inputId="language"
                    ariaLabel="Preferred language"
                    [options]="languages"
                    formControlName="language" /></label
                ><small
                  >This records your preference. The sample interface is
                  available in English.</small
                ><label for="default-dashboard"
                  >Default dashboard<p-select
                    inputId="default-dashboard"
                    ariaLabel="Default dashboard"
                    [options]="dashboards"
                    optionLabel="label"
                    optionValue="value"
                    formControlName="defaultDashboard"
                /></label>
              }
              @default {
                <div class="settings-heading">
                  <h2>Public profile</h2>
                  <p>This is how your team sees you.</p>
                </div>
                <div class="person-cell">
                  <p-avatar
                    [label]="initials()"
                    size="xlarge"
                    shape="circle"
                  /><span
                    ><strong>{{ auth.user()?.name }}</strong
                    ><small
                      >{{ auth.user()?.role }} · Optimus workspace</small
                    ></span
                  >
                </div>
                <label for="profile-name"
                  >Full name<input
                    pInputText
                    id="profile-name"
                    formControlName="name"
                    autocomplete="name" /></label
                ><label for="profile-email"
                  >Email address<input
                    pInputText
                    id="profile-email"
                    type="email"
                    formControlName="email"
                    autocomplete="email" /></label
                ><label for="profile-bio"
                  >Bio<textarea
                    pTextarea
                    id="profile-bio"
                    formControlName="bio"
                    rows="4"
                  ></textarea></label
                ><small
                  >A short introduction for the people you work with.</small
                >
              }
            }
            @if (form.touched && form.invalid) {
              <small class="field-error"
                >A name and valid email address are required.</small
              >
            }
            <div>
              <p-button
                label="Save changes"
                type="submit"
                [loading]="store.loading()"
              />
            </div>
          </form>
        }
      </section>
    </div>`,
  styles: `
    .theme-previews {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 180px));
      gap: 18px;
    }
    .theme-preview {
      display: grid;
      grid-template-columns: 28% 1fr 1fr;
      gap: 8px;
      padding: 17px 17px 35px;
      width: 100%;
      height: 110px;
      border-radius: 9px;
      border: 2px solid var(--border);
      position: relative;
    }
    .theme-preview.selected {
      border-color: #71717a;
    }
    .theme-preview span {
      background: #e4e4e7;
      border-radius: 4px;
    }
    .theme-preview span:first-child {
      background: #d4d4d8;
    }
    .theme-preview small {
      position: absolute;
      bottom: 9px;
      left: 17px;
      font-size: 10px;
    }
    .light-preview {
      background: #fff;
    }
    .dark-preview {
      background: #18181b;
    }
    .dark-preview span {
      background: #3f3f46;
    }
    .dark-preview span:first-child {
      background: #52525b;
    }
    .dark-preview small {
      color: #d4d4d8;
    }
    .light-preview small {
      color: #3f3f46;
    }
  `,
})
export class SettingsPage {
  readonly store = inject(AdminStore);
  readonly auth = inject(AuthStore);
  readonly theme = inject(ThemeStore);
  private readonly params = toSignal(inject(ActivatedRoute).paramMap);
  readonly section = computed(() => this.params()?.get("section") ?? "profile");
  readonly tabs = [
    { label: "Profile", path: "/settings" },
    { label: "Account", path: "/settings/account" },
    { label: "Appearance", path: "/settings/appearance" },
    { label: "Notifications", path: "/settings/notifications" },
  ];
  readonly themes = ["light", "dark", "system"];
  readonly languages = ["English", "German", "French", "Japanese"];
  readonly dashboards = [
    { label: "Overview", value: "analytics" },
    { label: "Business", value: "business" },
    { label: "Payments", value: "payments" },
  ];
  readonly notifications = [
    {
      key: "securityEmails",
      label: "Security updates",
      description: "Account activity and security alerts.",
    },
    {
      key: "communicationEmails",
      label: "Team conversations",
      description: "Mentions, replies, and shared updates.",
    },
    {
      key: "marketingEmails",
      label: "Product news",
      description: "Occasional ideas and new features.",
    },
    {
      key: "desktopNotifications",
      label: "Desktop notifications",
      description: "Updates while you work at your desk.",
    },
    {
      key: "mobileNotifications",
      label: "Mobile notifications",
      description: "Keep up when you are on the move.",
    },
  ];
  readonly initials = computed(() =>
    (this.auth.user()?.name ?? "OA")
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join(""),
  );
  readonly form = inject(FormBuilder).nonNullable.group({
    name: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    bio: [""],
    language: ["English"],
    theme: ["light"],
    compact: [false],
    defaultDashboard: ["analytics"],
    securityEmails: [true],
    communicationEmails: [true],
    marketingEmails: [false],
    desktopNotifications: [false],
    mobileNotifications: [true],
  });
  constructor() {
    void this.store.loadSettings();
    effect(() => {
      const settings = this.store.settings();
      if (settings)
        this.form.patchValue({
          ...settings,
          theme: this.theme.mode(),
          compact: this.theme.compact(),
        });
    });
  }
  async save(): Promise<void> {
    this.form.markAllAsTouched();
    const current = this.store.settings();
    if (this.form.invalid || !current) return;
    const values = this.form.getRawValue();
    if (await this.store.saveSettings({ ...current, ...values })) {
      this.theme.mode.set(values.theme as ThemeMode);
      this.theme.compact.set(values.compact);
      await this.auth.refresh();
    }
  }
}
