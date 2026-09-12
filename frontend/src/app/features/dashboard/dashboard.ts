import { Component, computed, inject, signal } from "@angular/core";
import { CurrencyPipe, DecimalPipe, DatePipe } from "@angular/common";
import { httpResource } from "@angular/common/http";
import { ActivatedRoute, RouterLink, RouterLinkActive } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Button, ButtonDirective } from "@openng/optimus-ui/button";
import { SelectButton } from "@openng/optimus-ui/selectbutton";
import { ChartModule } from "@openng/optimus-ui/chart";
import { TableModule } from "@openng/optimus-ui/table";
import { Avatar } from "@openng/optimus-ui/avatar";
import { Skeleton } from "@openng/optimus-ui/skeleton";
import { Message } from "@openng/optimus-ui/message";
import { ChartData, ChartOptions } from "chart.js";
import { Dashboard } from "../../core/models";
import { AuthStore } from "../../core/auth.store";
import { ThemeStore } from "../../core/theme.store";
import { PageHeader } from "../../shared/page-header";
import { StatusTag } from "../../shared/status-tag";
import { buildRevenueChart } from "./dashboard-data";

@Component({
  selector: "app-dashboard",
  imports: [
    CurrencyPipe,
    DecimalPipe,
    DatePipe,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    Button,
    ButtonDirective,
    SelectButton,
    ChartModule,
    TableModule,
    Avatar,
    Skeleton,
    Message,
    PageHeader,
    StatusTag,
  ],
  templateUrl: "./dashboard.html",
})
export class DashboardPage {
  readonly auth = inject(AuthStore);
  readonly theme = inject(ThemeStore);
  readonly variant = inject(ActivatedRoute).snapshot.data["variant"] as
    string | undefined;
  readonly dashboard = httpResource<Dashboard>(() => "/api/dashboard");
  readonly months = signal(12);
  readonly ranges = [
    { label: "12 months", value: 12 },
    { label: "6 months", value: 6 },
    { label: "3 months", value: 3 },
  ];
  readonly today = new Date();
  readonly chartData = computed<ChartData<"line">>(() =>
    buildRevenueChart(
      this.dashboard.value()?.series ?? [],
      this.months(),
      this.theme.dark(),
    ),
  );
  readonly chartOptions = computed<ChartOptions<"line">>(() => ({
    maintainAspectRatio: false,
    responsive: true,
    animation: {
      duration: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 350,
    },
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: this.theme.dark() ? "#f4f4f5" : "#18181b",
        titleColor: this.theme.dark() ? "#18181b" : "#fff",
        bodyColor: this.theme.dark() ? "#18181b" : "#fff",
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) =>
            ` Revenue: $${Number(context.parsed.y).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#92929d",
          font: { size: 10, family: "Inter Variable" },
          maxRotation: 0,
        },
      },
      y: {
        grid: { color: this.theme.dark() ? "#ffffff0b" : "#00000009" },
        border: { display: false },
        ticks: {
          color: "#92929d",
          font: { size: 10, family: "Inter Variable" },
          maxTicksLimit: 5,
          callback: (value) => "$" + Number(value) / 1000 + "k",
        },
      },
    },
  }));
  readonly title =
    this.variant === "business"
      ? "Business dashboard"
      : this.variant === "payments"
        ? "Payment dashboard"
        : "Dashboard";
  readonly revenueTotal = computed(() =>
    (this.dashboard.value()?.series ?? [])
      .slice(-this.months())
      .reduce((sum, value) => sum + value, 0),
  );
  initials(name: string): string {
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("");
  }
}
