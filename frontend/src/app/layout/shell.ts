import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  NavigationEnd,
} from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { filter, map, startWith } from "rxjs";
import { FormsModule } from "@angular/forms";
import { Button } from "@openng/optimus-ui/button";
import { Dialog } from "@openng/optimus-ui/dialog";
import { InputText } from "@openng/optimus-ui/inputtext";
import { Menu } from "@openng/optimus-ui/menu";
import { Avatar } from "@openng/optimus-ui/avatar";
import { MenuItem } from "@openng/optimus-ui/api";
import { AuthStore } from "../core/auth.store";
import { ThemeStore } from "../core/theme.store";
import { navigation } from "./navigation";
import { Feedback } from "../shared/feedback";

@Component({
  selector: "app-shell",
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    FormsModule,
    Button,
    Dialog,
    InputText,
    Menu,
    Avatar,
    Feedback,
  ],
  templateUrl: "./shell.html",
  host: { "(document:keydown)": "onKeydown($event)" },
})
export class Shell {
  readonly auth = inject(AuthStore);
  readonly theme = inject(ThemeStore);
  readonly router = inject(Router);
  private readonly mobileBreakpoint = matchMedia("(max-width: 900px)");
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
  );
  readonly currentPage = computed(
    () =>
      navigation
        .flatMap((group) => group.items)
        .find((item) => item.path === this.currentUrl())?.label ?? "Settings",
  );
  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly searchOpen = signal(false);
  readonly query = signal("");
  readonly navigation = navigation;
  readonly initials = computed(() =>
    (this.auth.user()?.name ?? "Optimus Admin")
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join(""),
  );
  readonly results = computed(() =>
    navigation
      .flatMap((g) => g.items)
      .filter(
        (i) =>
          i.label.toLowerCase().includes(this.query().toLowerCase()) &&
          this.canView(i.path),
      ),
  );
  readonly profileItems: MenuItem[] = [
    {
      label: "My profile",
      icon: "pi pi-user",
      command: () => void this.router.navigateByUrl("/settings"),
    },
    {
      label: "Appearance",
      icon: "pi pi-palette",
      command: () => void this.router.navigateByUrl("/settings/appearance"),
    },
    { separator: true },
    {
      label: "Sign out",
      icon: "pi pi-sign-out",
      command: () => void this.signOut(),
    },
  ];
  constructor() {
    const onBreakpointChange = (event: MediaQueryListEvent) => {
      if (!event.matches) this.mobileOpen.set(false);
    };
    this.mobileBreakpoint.addEventListener("change", onBreakpointChange);
    inject(DestroyRef).onDestroy(() =>
      this.mobileBreakpoint.removeEventListener("change", onBreakpointChange),
    );
    try {
      this.collapsed.set(
        localStorage.getItem("optimus-sidebar-collapsed") === "true",
      );
    } catch {
      /* Browser storage is optional. */
    }
    effect(() => {
      try {
        localStorage.setItem(
          "optimus-sidebar-collapsed",
          String(this.collapsed()),
        );
      } catch {
        /* Keep the preference for this session. */
      }
    });
  }
  canView(path: string): boolean {
    return (
      path !== "/users" ||
      ["Owner", "Admin"].includes(this.auth.user()?.role ?? "")
    );
  }
  toggleSidebar(): void {
    if (this.mobileBreakpoint.matches) this.mobileOpen.update((v) => !v);
    else this.collapsed.update((v) => !v);
  }
  onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault();
      this.searchOpen.update((v) => !v);
    }
    if (event.key === "Escape") this.mobileOpen.set(false);
  }
  async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl("/sign-in");
  }
}
