import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Bar, BarChart, Pie, PieChart, XAxis } from "recharts";
import {
	fetchMonthlySalesQueryOptions,
	fetchStatsQueryOptions,
} from "@/api/ordersApi";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { OrderStatus } from "@/types/orders";

export const Route = createFileRoute("/_layout/")({
	component: Dashboard,
});

const STATUS_COLORS: Record<OrderStatus, string> = {
	pending: "var(--chart-3)",
	confirmed: "var(--chart-1)",
	preparing: "var(--chart-4)",
	out_for_delivery: "var(--chart-2)",
	delivered: "var(--chart-5)",
	cancelled: "var(--chart-6)",
};

const statusChartConfig = {
	count: {
		label: "Orders",
	},
	pending: { label: "pending", color: STATUS_COLORS.pending },
	confirmed: { label: "confirmed", color: STATUS_COLORS.confirmed },
	preparing: { label: "preparing", color: STATUS_COLORS.preparing },
	out_for_delivery: {
		label: "out for delivery",
		color: STATUS_COLORS.out_for_delivery,
	},
	delivered: { label: "delivered", color: STATUS_COLORS.delivered },
	cancelled: { label: "cancelled", color: STATUS_COLORS.cancelled },
} satisfies ChartConfig;

const monthlySalesChartConfig = {
	total_orders: {
		label: "Orders-Count",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

const monthlyRevenueChartConfig = {
	revenue: {
		label: "Revenue",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

const topPizzasChartConfig = {
	name: {
		label: "Pizza-Name",
		color: "var(--chart-4)",
	},
} satisfies ChartConfig;

function Dashboard() {
	const today = new Date();

	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: subDays(today, 30),
		to: today,
	});

	const startDate = dateRange?.from ?? today;
	const endDate = dateRange?.to ?? today;

	const { data: statsSummary } = useSuspenseQuery(
		fetchStatsQueryOptions({
			startDate: format(startDate, "yyyy-MM-dd"),
			endDate: format(endDate, "yyyy-MM-dd"),
		}),
	);

	const [monthlyWindow, setMonthlyWindow] = useState<3 | 6 | 12>(6);

	const { data: monthlySales } = useSuspenseQuery(
		fetchMonthlySalesQueryOptions(monthlyWindow),
	);

	const statusChartData = useMemo(
		() =>
			Object.entries(statsSummary.orders_by_status).map(([status, count]) => ({
				status,
				count,
				fill: STATUS_COLORS[status as OrderStatus],
			})),
		[statsSummary],
	);
	console.log(monthlySales);
	console.log(statsSummary);

	return (
		<div>
			<h3 className="font-semibold mb-4 text-lg">
				Showing data from{" "}
				{dateRange?.from ? format(dateRange.from, "dd MMM yyyy") : "—"} to{" "}
				{dateRange?.to ? format(dateRange.to, "dd MMM yyyy") : "—"}
			</h3>
			<div className="flex flex-col md:flex-row gap-6 mb-4">
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline">
							{dateRange
								? `${dateRange?.from?.toLocaleDateString()} -
									${dateRange?.to?.toLocaleDateString()}`
								: "Select date"}
							<ChevronDownIcon />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto overflow-hidden p-0">
						<Calendar
							mode="range"
							defaultMonth={dateRange?.from}
							selected={dateRange}
							onSelect={setDateRange}
							numberOfMonths={2}
							className="rounded-lg border shadow-sm"
						/>
					</PopoverContent>
				</Popover>
				<div className="flex flex-wrap items-center gap-2 mb-6">
					<Button
						variant="outline"
						onClick={() =>
							setDateRange({
								from: subDays(today, 7),
								to: today,
							})
						}
					>
						Last 7d
					</Button>

					<Button
						variant="outline"
						onClick={() =>
							setDateRange({
								from: subDays(today, 30),
								to: today,
							})
						}
					>
						Last 30d
					</Button>

					<Button
						variant="outline"
						onClick={() =>
							setDateRange({
								from: subDays(today, 180),
								to: today,
							})
						}
					>
						Last 6 months
					</Button>
				</div>
			</div>

			{/* CHARTS */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<div className="lg:col-span-4 flex gap-6 lg:gap-10">
					<Card className="w-full">
						<CardHeader>
							<CardTitle>Total Orders</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold">{statsSummary.total_orders}</p>
						</CardContent>
					</Card>

					<Card className="w-full">
						<CardHeader>
							<CardTitle>Total Sales</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-bold">₹{statsSummary.total_sales}</p>
						</CardContent>
					</Card>
				</div>

				{/*  ORDER STATUS PIE CHART */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Order Status</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={statusChartConfig}
							className="mx-auto aspect-square max-h-[250px]"
						>
							<PieChart>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />}
								/>
								<Pie
									data={statusChartData}
									dataKey="count"
									nameKey="status"
									outerRadius={100}
								/>
							</PieChart>
						</ChartContainer>
					</CardContent>
				</Card>

				{/* TOP SELLING PIZZAS BAR CHART  */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Top Pizzas</CardTitle>
					</CardHeader>
					<CardContent className="h-full">
						<ChartContainer
							className="h-full w-full"
							config={topPizzasChartConfig}
						>
							<BarChart accessibilityLayer data={statsSummary.top_pizzas}>
								<XAxis
									dataKey="name"
									tickLine={false}
									tickMargin={10}
									axisLine={false}
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent />}
								/>
								<Bar dataKey="sold" fill="var(--chart-4)" radius={4} />
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>
				<div className="lg:col-span-4 space-x-4">
					<Button
						size="sm"
						variant={monthlyWindow === 3 ? "default" : "outline"}
						onClick={() => setMonthlyWindow(3)}
					>
						3M
					</Button>
					<Button
						size="sm"
						variant={monthlyWindow === 6 ? "default" : "outline"}
						onClick={() => setMonthlyWindow(6)}
					>
						6M
					</Button>
					<Button
						size="sm"
						variant={monthlyWindow === 12 ? "default" : "outline"}
						onClick={() => setMonthlyWindow(12)}
					>
						12M
					</Button>
				</div>

				{/*  MONTHLY SALES BAR CHART */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Monthly Orders</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer config={monthlySalesChartConfig}>
							<BarChart accessibilityLayer data={monthlySales}>
								<XAxis
									dataKey="month"
									tickLine={false}
									tickMargin={10}
									axisLine={false}
									tickFormatter={(v) => format(v, "MMM")}
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent />}
								/>
								<Bar dataKey="total_orders" fill="var(--chart-1)" radius={4} />
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>

				{/* MONTHLY REVENUE BAR CHART */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Monthly Revenue</CardTitle>
					</CardHeader>
					<CardContent>
						<ChartContainer config={monthlyRevenueChartConfig}>
							<BarChart accessibilityLayer data={monthlySales}>
								<XAxis
									dataKey="month"
									tickLine={false}
									tickMargin={10}
									axisLine={false}
									tickFormatter={(v) => format(v, "MMM")}
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent />}
								/>
								<Bar dataKey="revenue" fill="var(--chart-2)" radius={4} />
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
