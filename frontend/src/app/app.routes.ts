import { Routes } from "@angular/router";
import { authGuard, guestGuard, userAdminGuard } from "./core/auth.guard";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "dashboard" },
  {
    path: "sign-in",
    canActivate: [guestGuard],
    loadComponent: () => import("./features/auth/auth").then((m) => m.AuthPage),
    title: "Sign in · Optimus Admin",
  },
  {
    path: "sign-up",
    canActivate: [guestGuard],
    loadComponent: () => import("./features/auth/auth").then((m) => m.AuthPage),
    data: { mode: "sign-up" },
    title: "Create account · Optimus Admin",
  },
  {
    path: "",
    canActivateChild: [authGuard],
    loadComponent: () => import("./layout/shell").then((m) => m.Shell),
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./features/dashboard/dashboard").then((m) => m.DashboardPage),
        title: "Dashboard · Optimus Admin",
      },
      {
        path: "dashboard2",
        loadComponent: () =>
          import("./features/dashboard/dashboard").then((m) => m.DashboardPage),
        data: { variant: "business" },
        title: "Business · Optimus Admin",
      },
      {
        path: "payment-dashboard",
        loadComponent: () =>
          import("./features/dashboard/dashboard").then((m) => m.DashboardPage),
        data: { variant: "payments" },
        title: "Payments · Optimus Admin",
      },
      {
        path: "payment-transactions",
        loadComponent: () =>
          import("./features/data/transactions").then(
            (m) => m.TransactionsPage,
          ),
        title: "Transactions · Optimus Admin",
      },
      {
        path: "users",
        canActivate: [userAdminGuard],
        loadComponent: () =>
          import("./features/data/users").then((m) => m.UsersPage),
        title: "Users · Optimus Admin",
      },
      {
        path: "tasks",
        loadComponent: () =>
          import("./features/data/tasks").then((m) => m.TasksPage),
        title: "Tasks · Optimus Admin",
      },
      {
        path: "kanban",
        loadComponent: () =>
          import("./features/kanban/kanban").then((m) => m.KanbanPage),
        title: "Kanban · Optimus Admin",
      },
      {
        path: "calendar",
        loadComponent: () =>
          import("./features/calendar/calendar").then((m) => m.CalendarPage),
        title: "Calendar · Optimus Admin",
      },
      {
        path: "mail",
        loadComponent: () =>
          import("./features/communication/mail").then((m) => m.MailPage),
        title: "Mail · Optimus Admin",
      },
      {
        path: "chats",
        loadComponent: () =>
          import("./features/communication/chats").then((m) => m.ChatsPage),
        title: "Chats · Optimus Admin",
      },
      {
        path: "settings",
        loadComponent: () =>
          import("./features/settings/settings").then((m) => m.SettingsPage),
        title: "Settings · Optimus Admin",
      },
      {
        path: "settings/:section",
        loadComponent: () =>
          import("./features/settings/settings").then((m) => m.SettingsPage),
        title: "Settings · Optimus Admin",
      },
      {
        path: "components",
        loadComponent: () =>
          import("./features/components/components").then(
            (m) => m.ComponentsPage,
          ),
        title: "Components · Optimus Admin",
      },
      {
        path: "help-center",
        loadComponent: () =>
          import("./features/help/help").then((m) => m.HelpPage),
        title: "Help center · Optimus Admin",
      },
    ],
  },
  {
    path: "**",
    loadComponent: () =>
      import("./features/errors/error").then((m) => m.ErrorPage),
    title: "Page unavailable · Optimus Admin",
  },
];
