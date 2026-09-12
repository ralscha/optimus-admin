import { Component, computed, input } from "@angular/core";
import { Tag } from "@openng/optimus-ui/tag";

export function displayLabel(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

@Component({
  selector: "app-status-tag",
  imports: [Tag],
  template:
    '<p-tag [value]="label()" [severity]="severity()" [rounded]="true" />',
})
export class StatusTag {
  readonly value = input.required<string>();
  readonly label = computed(() => displayLabel(this.value()));
  readonly severity = computed(() => {
    if (["active", "completed", "done", "low"].includes(this.value()))
      return "success";
    if (["failed", "suspended", "high", "disputed"].includes(this.value()))
      return "danger";
    if (["pending", "invited", "medium", "processing"].includes(this.value()))
      return "warn";
    if (this.value() === "in_progress") return "info";
    return "secondary";
  });
}
