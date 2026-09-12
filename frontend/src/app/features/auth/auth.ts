import { Component, computed, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Button } from "@openng/optimus-ui/button";
import { InputText } from "@openng/optimus-ui/inputtext";
import { Password } from "@openng/optimus-ui/password";
import { Message } from "@openng/optimus-ui/message";
import { AuthStore } from "../../core/auth.store";
import { AdminStore } from "../../core/admin.store";

@Component({
  selector: "app-auth",
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Button,
    InputText,
    Password,
    Message,
  ],
  template: ` <div class="auth-layout">
    <section class="auth-story">
      <a routerLink="/" class="auth-brand"
        ><span class="brand-mark"
          ><i class="pi pi-sparkles" aria-hidden="true"></i></span
        >Optimus Admin</a
      >
      <div class="auth-story-content">
        <span class="eyebrow">A LITTLE CLARITY. A LOT OF POSSIBILITY.</span>
        <h1>Good work starts<br />with a great overview.</h1>
        <p>
          Your team, your projects, and your next big idea.<br />All in one
          thoughtfully designed workspace.
        </p>
        <div class="auth-preview">
          <div class="preview-dots">
            <span></span><span></span><span></span>
          </div>
          <div class="preview-heading">
            <span>Revenue overview</span
            ><span class="growth-pill">↗ 12.5%</span>
          </div>
          <strong>$45,231<span>.89</span></strong>
          <div class="preview-bars">
            @for (height of bars; track $index) {
              <span [style.height.%]="height"></span>
            }
          </div>
          <div class="preview-labels">
            <span>JAN</span><span>JUN</span><span>DEC</span>
          </div>
        </div>
      </div>
      <span class="auth-copyright"
        >Designed for the way you work. © 2026 Optimus Admin</span
      >
    </section>
    <section class="auth-form-section">
      <div class="auth-top-link">
        {{ signup() ? "Already have an account?" : "New to Optimus?" }}
        <a [routerLink]="signup() ? '/sign-in' : '/sign-up'"
          >{{ signup() ? "Sign in" : "Create an account" }}
          <i class="pi pi-arrow-up-right" aria-hidden="true"></i
        ></a>
      </div>
      <div class="auth-form">
        <span class="auth-welcome-icon"
          ><i class="pi pi-sparkles" aria-hidden="true"></i
        ></span>
        <h2>{{ signup() ? "Start something great." : "Welcome back." }}</h2>
        <p>
          {{
            signup()
              ? "Create your account and make yourself at home."
              : "Enter your details to pick up where you left off."
          }}
        </p>
        @if (auth.error()) {
          <p-message severity="error">{{ auth.error() }}</p-message>
        }
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-stack">
          @if (signup()) {
            <label for="name"
              >Full name<input
                pInputText
                id="name"
                formControlName="name"
                autocomplete="name"
                placeholder="Alex Morgan"
            /></label>
          }
          <label for="email"
            >Email address<input
              pInputText
              id="email"
              formControlName="email"
              autocomplete="email"
              type="email"
              placeholder="you@example.com"
          /></label>
          <label for="password"
            >Password<p-password
              inputId="password"
              formControlName="password"
              [toggleMask]="true"
              [feedback]="false"
              [autocomplete]="signup() ? 'new-password' : 'current-password'"
              [fluid]="true"
          /></label>
          @if (signup()) {
            <small
              >Use at least 8 characters with uppercase, lowercase, a number,
              and a symbol (!&#64;#$%^&amp;*).</small
            >
          }
          @if (form.touched && form.invalid) {
            <small class="field-error"
              >Enter a valid email and
              {{
                signup() ? "name and password (8+ characters)." : "password."
              }}</small
            >
          }
          <p-button
            [label]="signup() ? 'Create account' : 'Sign in'"
            type="submit"
            icon="pi pi-arrow-right"
            iconPos="right"
            [fluid]="true"
            [loading]="auth.pending()"
          />
        </form>
        @if (!signup()) {
          <div class="auth-separator"><span>OR EXPLORE THE DEMO</span></div>
          <p-button
            label="Try the demo"
            icon="pi pi-play"
            severity="secondary"
            [outlined]="true"
            [fluid]="true"
            [loading]="auth.pending()"
            (onClick)="demo()"
          />
          <p class="demo-note">
            No setup needed. A sample workspace is ready for you.
          </p>
        }
        <p class="auth-bottom-note">
          A sample dashboard built with Angular &amp; Optimus UI.
        </p>
      </div>
    </section>
  </div>`,
})
export class AuthPage {
  readonly auth = inject(AuthStore);
  private readonly admin = inject(AdminStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly signup = computed(
    () => this.route.snapshot.data["mode"] === "sign-up",
  );
  readonly bars = [28, 40, 34, 49, 58, 52, 67, 72, 65, 82, 88, 100];
  readonly form = inject(FormBuilder).nonNullable.group({
    name: [""],
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
  });
  constructor() {
    this.auth.error.set("");
    if (this.signup()) {
      this.form.controls.name.addValidators(Validators.required);
      this.form.controls.password.addValidators(Validators.minLength(8));
    }
  }
  async demo(): Promise<void> {
    if (await this.auth.signIn("admin@example.com", "Optimus300"))
      await this.navigate();
  }
  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { name, email, password } = this.form.getRawValue();
    if (
      await (this.signup()
        ? this.auth.signUp(name, email, password)
        : this.auth.signIn(email, password))
    )
      await this.navigate();
  }
  private async navigate(): Promise<void> {
    const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");
    await this.admin.loadSettings();
    const destinations: Record<string, string> = {
      analytics: "/dashboard",
      business: "/dashboard2",
      payments: "/payment-dashboard",
    };
    const destination =
      destinations[this.admin.settings()?.defaultDashboard ?? "analytics"] ??
      "/dashboard";
    await this.router.navigateByUrl(
      returnUrl?.startsWith("/") && !returnUrl.startsWith("//")
        ? returnUrl
        : destination,
    );
  }
}
