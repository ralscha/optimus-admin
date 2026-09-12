export const navigation = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", path: "/dashboard", icon: "th-large" },
      { label: "Business dashboard", path: "/dashboard2", icon: "chart-bar" },
      { label: "Payments", path: "/payment-dashboard", icon: "wallet" },
      {
        label: "Transactions",
        path: "/payment-transactions",
        icon: "arrow-right-arrow-left",
      },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Tasks", path: "/tasks", icon: "check-square" },
      { label: "Kanban board", path: "/kanban", icon: "objects-column" },
      { label: "Users", path: "/users", icon: "users" },
      { label: "Calendar", path: "/calendar", icon: "calendar" },
      { label: "Mail", path: "/mail", icon: "inbox" },
      { label: "Chats", path: "/chats", icon: "comments" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "UI components", path: "/components", icon: "box" },
      { label: "Settings", path: "/settings", icon: "cog" },
      { label: "Help center", path: "/help-center", icon: "question-circle" },
    ],
  },
];
