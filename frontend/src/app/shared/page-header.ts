import { Component, input } from "@angular/core";

@Component({
  selector: "app-page-header",
  template:
    '<div class="page-header"><div><h1>{{ title() }}</h1><p>{{ description() }}</p></div><div class="page-actions"><ng-content /></div></div>',
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly description = input("");
}
