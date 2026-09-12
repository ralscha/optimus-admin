import { Component, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { ButtonDirective } from "@openng/optimus-ui/button";

@Component({
  selector: "app-error",
  imports: [RouterLink, ButtonDirective],
  template:
    '<main class="error-page"><span class="eyebrow">A SMALL DETOUR</span><h1>{{ router.url === "/forbidden" ? "403" : "404" }}</h1><h2>{{ router.url === "/forbidden" ? "This page needs an admin." : "This page wandered off." }}</h2><p>Head back to your workspace to keep things moving.</p><a pButton routerLink="/dashboard"><i class="pi pi-arrow-left" aria-hidden="true"></i><span>Back to dashboard</span></a></main>',
})
export class ErrorPage {
  readonly router = inject(Router);
}
