import { Component, computed, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Button } from "@openng/optimus-ui/button";
import { InputText } from "@openng/optimus-ui/inputtext";
import { Avatar } from "@openng/optimus-ui/avatar";
import { AdminStore } from "../../core/admin.store";
import { PageHeader } from "../../shared/page-header";

@Component({
  selector: "app-chats",
  imports: [DatePipe, FormsModule, Button, InputText, Avatar, PageHeader],
  template: `<app-page-header
      title="Chats"
      description="Keep your team close, wherever work takes you."
    />
    <section class="chat-layout panel">
      <div class="chat-sidebar">
        <div class="chat-search">
          <input
            pInputText
            placeholder="Find a conversation..."
            aria-label="Find a conversation"
            [(ngModel)]="query"
            class="full-width"
          />
        </div>
        @for (chat of filtered(); track chat.id) {
          <button
            class="chat-contact"
            [class.selected]="current()?.id === chat.id"
            (click)="select(chat.id)"
          >
            <p-avatar [label]="initials(chat.name)" shape="circle" /><span
              ><strong>{{ chat.name }}</strong
              ><small>{{ chat.messages.at(-1)?.text }}</small></span
            >
            @if (chat.unread) {
              <span class="nav-count">{{ chat.unread }}</span>
            }
          </button>
        } @empty {
          <div class="empty-state">No conversations found.</div>
        }
      </div>
      <div class="chat-main">
        @if (current(); as chat) {
          <div class="chat-header">
            <p-avatar [label]="initials(chat.name)" shape="circle" />
            <div>
              <strong>{{ chat.name }}</strong
              ><small><span class="live-dot"></span> {{ chat.status }}</small>
            </div>
          </div>
          <div class="chat-messages" aria-live="polite" #messageList>
            @for (message of chat.messages; track message.id) {
              <div class="chat-message" [class.mine]="message.mine">
                <p>{{ message.text }}</p>
                <small>{{ message.createdAt | date: "shortTime" }}</small>
              </div>
            }
          </div>
          <form class="chat-composer" (ngSubmit)="send()">
            <input
              pInputText
              placeholder="Write a message..."
              aria-label="Message"
              [(ngModel)]="draft"
              name="message"
              class="full-width"
              maxlength="4000"
            /><p-button
              icon="pi pi-send"
              type="submit"
              ariaLabel="Send message"
              [disabled]="!draft().trim()"
              [loading]="store.loading()"
            />
          </form>
          <small class="chat-note"
            >Sample conversation. Messages are stored locally by the demo
            API.</small
          >
        } @else {
          <div class="empty-state">Choose a conversation to get started.</div>
        }
      </div>
    </section>`,
  styles: `
    .chat-layout {
      display: grid;
      grid-template-columns: 300px minmax(0, 1fr);
      min-height: 590px;
    }
    .chat-sidebar {
      border-right: 1px solid var(--border);
    }
    .chat-search {
      padding: 17px;
      border-bottom: 1px solid var(--border);
    }
    .chat-contact {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 19px 17px;
      border: 0;
      border-bottom: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      text-align: left;
    }
    .chat-contact.selected {
      background: var(--surface);
    }
    .chat-contact > span {
      min-width: 0;
    }
    .chat-contact strong {
      display: block;
      font-size: 12px;
      font-weight: 550;
    }
    .chat-contact small {
      display: block;
      font-size: 10px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 170px;
      margin-top: 3px;
    }
    .chat-main {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .chat-header {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 18px 24px;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
    }
    .chat-header small {
      display: block;
      font-size: 10px;
      margin-top: 3px;
    }
    .chat-header .live-dot {
      width: 5px;
      height: 5px;
    }
    .chat-messages {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 30px 24px;
      flex: 1;
      max-height: 500px;
      overflow: auto;
    }
    .chat-message {
      max-width: 78%;
      align-self: flex-start;
    }
    .chat-message p {
      padding: 12px 16px;
      border-radius: 10px 10px 10px 0;
      background: var(--muted-surface);
      font-size: 12px;
      line-height: 1.8;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .chat-message small {
      font-size: 9px;
      margin-top: 5px;
      display: block;
    }
    .chat-message.mine {
      align-self: flex-end;
    }
    .chat-message.mine p {
      background: var(--text);
      color: var(--bg);
      border-radius: 10px 10px 0 10px;
    }
    .chat-message.mine small {
      text-align: right;
    }
    .chat-composer {
      display: flex;
      gap: 10px;
      padding: 16px 24px 8px;
      border-top: 1px solid var(--border);
    }
    .chat-note {
      font-size: 9px;
      padding: 0 24px 15px;
    }
    @media (max-width: 700px) {
      .chat-layout {
        grid-template-columns: 1fr;
      }
      .chat-sidebar {
        border-right: 0;
        border-bottom: 1px solid var(--border);
      }
      .chat-contact {
        padding: 10px 17px;
      }
      .chat-message {
        max-width: 90%;
      }
    }
  `,
})
export class ChatsPage {
  readonly store = inject(AdminStore);
  readonly query = signal("");
  readonly selectedId = signal("chat_1");
  readonly draft = signal("");
  readonly filtered = computed(() =>
    this.store
      .conversations()
      .filter((c) => c.name.toLowerCase().includes(this.query().toLowerCase())),
  );
  readonly current = computed(
    () =>
      this.store.conversations().find((c) => c.id === this.selectedId()) ??
      null,
  );
  constructor() {
    void this.store.loadChats();
  }
  initials(name: string): string {
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("");
  }
  select(id: string): void {
    this.selectedId.set(id);
    this.store.markConversationRead(id);
  }
  async send(): Promise<void> {
    const text = this.draft().trim();
    const chat = this.current();
    if (text && chat && (await this.store.addMessage(chat.id, text)))
      this.draft.set("");
  }
}
