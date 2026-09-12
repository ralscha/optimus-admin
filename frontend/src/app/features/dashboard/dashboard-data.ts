import { ChartData } from "chart.js";

export function buildRevenueChart(
  series: number[],
  months: number,
  dark: boolean,
): ChartData<"line"> {
  const count = Math.min(12, Math.max(1, months));
  return {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].slice(-count),
    datasets: [
      {
        label: "Revenue",
        data: series.slice(-count),
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        borderColor: dark ? "#d4d4d8" : "#3f3f46",
        backgroundColor: dark ? "#a1a1aa20" : "#71717a18",
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: dark ? "#e4e4e7" : "#27272a",
      },
    ],
  };
}
