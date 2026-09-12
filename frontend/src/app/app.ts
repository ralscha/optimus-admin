import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ThemeStore } from "./core/theme.store";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  template: "<router-outlet />",
})
export class App {
  readonly theme = inject(ThemeStore);
}
