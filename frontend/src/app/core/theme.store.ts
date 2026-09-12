import {
  computed,
  DestroyRef,
  effect,
  inject,
  Service,
  signal,
} from "@angular/core";
export type ThemeMode = "light" | "dark" | "system";

@Service()
export class ThemeStore {
  private readonly preference = matchMedia("(prefers-color-scheme: dark)");
  private readonly systemDark = signal(this.preference.matches);
  readonly mode = signal<ThemeMode>("light");
  readonly compact = signal(false);
  readonly dark = computed(
    () =>
      this.mode() === "dark" || (this.mode() === "system" && this.systemDark()),
  );
  constructor() {
    try {
      const saved = localStorage.getItem("optimus-theme");
      if (saved === "light" || saved === "dark" || saved === "system")
        this.mode.set(saved);
      this.compact.set(localStorage.getItem("optimus-compact") === "true");
    } catch {
      /* Storage is optional in private browsing. */
    }
    const listener = (event: MediaQueryListEvent) =>
      this.systemDark.set(event.matches);
    this.preference.addEventListener("change", listener);
    inject(DestroyRef).onDestroy(() =>
      this.preference.removeEventListener("change", listener),
    );
    effect(() => {
      document.documentElement.classList.toggle("dark", this.dark());
      document.documentElement.classList.toggle("compact", this.compact());
      try {
        localStorage.setItem("optimus-theme", this.mode());
        localStorage.setItem("optimus-compact", String(this.compact()));
      } catch {
        /* The current session still uses the selected appearance. */
      }
    });
  }
  toggle(): void {
    this.mode.set(this.dark() ? "light" : "dark");
  }
}
