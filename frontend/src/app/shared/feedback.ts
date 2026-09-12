import { Component, effect, inject } from "@angular/core";
import { Toast } from "@openng/optimus-ui/toast";
import { ConfirmDialog } from "@openng/optimus-ui/confirmdialog";
import { MessageService } from "@openng/optimus-ui/api";
import { AdminStore } from "../core/admin.store";

@Component({
  selector: "app-feedback",
  imports: [Toast, ConfirmDialog],
  template: '<p-toast position="bottom-right" /><p-confirmdialog />',
})
export class Feedback {
  private readonly admin = inject(AdminStore);
  private readonly messages = inject(MessageService);
  constructor() {
    effect(() => {
      const detail = this.admin.notice();
      if (detail)
        this.messages.add({
          severity: "success",
          summary: "All set",
          detail,
          life: 3000,
        });
    });
    effect(() => {
      const detail = this.admin.error();
      if (detail)
        this.messages.add({
          severity: "error",
          summary: "Something went wrong",
          detail,
          sticky: true,
        });
    });
  }
}
