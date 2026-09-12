import { Component, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { InputText } from "@openng/optimus-ui/inputtext";
import { AccordionModule } from "@openng/optimus-ui/accordion";
import { PageHeader } from "../../shared/page-header";

@Component({
  selector: "app-help",
  imports: [FormsModule, RouterLink, InputText, AccordionModule, PageHeader],
  template: `<app-page-header
      title="A little help goes a long way."
      description="Find your feet, find an answer, and get back to good work."
    />
    <div class="help-search">
      <i class="pi pi-search" aria-hidden="true"></i
      ><input
        pInputText
        placeholder="What would you like to know?"
        aria-label="Search help"
        [(ngModel)]="query"
      />
    </div>
    <div class="help-cards">
      <a routerLink="/components" class="panel panel-body"
        ><i class="pi pi-box" aria-hidden="true"></i>
        <h2>Explore the components</h2>
        <p>Meet the building blocks behind your workspace.</p></a
      ><a
        href="https://optimus.openng.org/installation"
        target="_blank"
        rel="noopener noreferrer"
        class="panel panel-body"
        ><i class="pi pi-book" aria-hidden="true"></i>
        <h2>Read the documentation</h2>
        <p>Get started with Angular and Optimus UI.</p></a
      ><a routerLink="/settings" class="panel panel-body"
        ><i class="pi pi-sliders-h" aria-hidden="true"></i>
        <h2>Make yourself at home</h2>
        <p>Update your profile and workspace preferences.</p></a
      >
    </div>
    <section style="max-width:800px;margin-top:40px">
      <h2 style="margin-bottom:18px">Frequently asked questions</h2>
      <p-accordion>
        @for (faq of faqs; track faq.title) {
          @if (
            (faq.title + faq.answer)
              .toLowerCase()
              .includes(query().toLowerCase())
          ) {
            <p-accordion-panel [value]="faq.title"
              ><p-accordion-header>{{ faq.title }}</p-accordion-header
              ><p-accordion-content
                ><p style="line-height:1.9" class="muted">
                  {{ faq.answer }}
                </p></p-accordion-content
              ></p-accordion-panel
            >
          }
        }
      </p-accordion>
    </section>`,
  styles: `
    .help-search {
      position: relative;
      max-width: 600px;
      margin: 30px 0;
    }
    .help-search input {
      padding: 14px 14px 14px 43px;
      width: 100%;
    }
    .help-search > .pi {
      position: absolute;
      left: 15px;
      top: 17px;
      color: var(--muted);
    }
    .help-cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 20px;
    }
    .help-cards .pi {
      font-size: 22px;
      margin-bottom: 23px;
    }
    .help-cards h2 {
      font-size: 14px;
    }
    .help-cards p {
      font-size: 12px;
      line-height: 1.8;
      color: var(--muted);
      margin-top: 8px;
    }
    .help-cards a:hover {
      background: var(--surface);
    }
    @media (max-width: 700px) {
      .help-cards {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class HelpPage {
  readonly query = signal("");
  readonly faqs = [
    {
      title: "How do I explore the demo?",
      answer:
        "Use “Try the demo” on the sign-in page, or sign in with admin@example.com and password Optimus300. You can create tasks, edit the board, manage events, and try the other screens.",
    },
    {
      title: "Will my changes be saved?",
      answer:
        "The Go backend keeps sample data in memory. Your edits survive page reloads and navigation, and reset when the server restarts. Theme preferences are also saved in your browser.",
    },
    {
      title: "Does this send real emails or process payments?",
      answer:
        "No. Mail, chat, and payments are sample workflows. Composing a message saves it to the demo mailbox, and payment updates only change the sample ledger.",
    },
    {
      title: "How do I change the theme?",
      answer:
        "Use the moon or sun icon in the header for a quick switch, or go to Settings → Appearance to choose light, dark, or your system theme and enable compact tables.",
    },
    {
      title: "How do I move tasks on the board?",
      answer:
        "Drag a card to its new column. You can also open a card with its edit button, choose a status, and save. The second method works with a keyboard or touch device.",
    },
    {
      title: "What is this project built with?",
      answer:
        "The frontend uses Angular 22 and Optimus UI v2, with a Go HTTP API in a separate backend directory. The root README and Taskfile describe development, production builds, and verification.",
    },
  ];
}
