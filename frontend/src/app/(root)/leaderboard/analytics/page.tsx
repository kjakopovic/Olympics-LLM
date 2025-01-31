"use client"

import { Area, AreaChart, Bar, BarChart, LabelList, Pie, PieChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import SideBar from "@/components/SideBar"

const realChartData = [
    { sportsman: "Luke Skywalker", gold: 186, silver: 80, bronze: 50, appearance: 1000 },
    { sportsman: "Zoran Milanovic", gold: 305, silver: 200, bronze: 100, appearance: 500 },
    { sportsman: "Leo Messi", gold: 237, silver: 120, bronze: 500, appearance: 700 },
    { sportsman: "Cristiano Ronaldo", gold: 73, silver: 190, bronze: 150, appearance: 1100 },
    { sportsman: "Luka Modric", gold: 209, silver: 130, bronze: 200, appearance: 1500 },
    { sportsman: "Domagoj Duvnjak", gold: 214, silver: 140, bronze: 250, appearance: 700 },
]

const continentData = [
    { continent: "africa", medals: 100, fill: "var(--color-africa)" },
    { continent: "europe", medals: 1000, fill: "var(--color-europe)" },
    { continent: "asia", medals: 500, fill: "var(--color-asia)" },
    { continent: "australia", medals: 300, fill: "var(--color-australia)" },
    { continent: "north_america", medals: 250, fill: "var(--color-north_america)" },
    { continent: "south_america", medals: 150, fill: "var(--color-south_america)" },
]

const continentChartConfig = {
    africa: {
      label: "Africa",
      color: "hsl(var(--chart-1))",
    },
    europe: {
      label: "Europe",
      color: "hsl(var(--chart-2))",
    },
    asia: {
      label: "Asia",
      color: "hsl(var(--chart-1))",
    },
    australia: {
      label: "Australia",
      color: "hsl(var(--chart-2))",
    },
    north_america: {
      label: "North America",
      color: "hsl(var(--chart-1))",
    },
    south_america: {
      label: "South America",
      color: "hsl(var(--chart-2))",
    }
} satisfies ChartConfig

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
  gold: {
    label: "Gold medals",
    color: "hsl(var(--chart-1))",
  },
  silver: {
    label: "Silver medals",
    color: "hsl(var(--chart-2))",
  },
  bronze: {
    label: "Bronze medals",
    color: "hsl(var(--chart-1))",
  },
  appearance: {
    label: "Number of appearances",
    color: "hsl(var(--chart-2))",
  },
  medals: {
    label: "Number of medals",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const linearChartData = [
    { year: 1910, medals: 186 },
    { year: 1920, medals: 305 },
    { year: 1930, medals: 237 },
    { year: 1940, medals: 73 },
    { year: 1950, medals: 209 },
    { year: 1960, medals: 214 },
]

function Analytics() {
  return (
    <div className="h-full bg-gradient-to-tr from-primary-200 via-primary-200 to-primary-100 flex">
        {/* SideBar */}
        <SideBar />
        
        {/* Main Content Area */}
        <div className="flex h-screen flex-col w-4/5 p-5 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-accent mb-10">
                    Analytics
                </h1>
            </div>
            
            <div className="flex flex-row justify-between items-center w-full">
                <Card className="w-[50%] border-none bg-primary-50 text-white mr-5">
                    <CardHeader>
                    </CardHeader>

                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[400px] w-full">
                            <BarChart 
                                accessibilityLayer 
                                data={realChartData}
                            >
                                <XAxis
                                    dataKey="sportsman"
                                    type="category"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            indicator="dot"
                                            hideLabel
                                            className="bg-primary-100 text-white p-2 border-none rounded-lg shadow-lg"
                                        />
                                    }
                                />
                                
                                <Bar dataKey="gold" fill="var(--color-desktop)" radius={4} />
                                <Bar dataKey="silver" fill="var(--color-mobile)" radius={4} />
                                <Bar dataKey="bronze" fill="var(--color-desktop)" radius={4} />
                                <Bar dataKey="appearance" fill="var(--color-mobile)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>

                    <CardFooter className="flex-col items-start gap-2 text-sm">
                    </CardFooter>
                </Card>

                <Card className="flex flex-col w-[50%] border-none bg-primary-50 text-white ml-5">
                    <CardHeader className="items-center pb-0">
                    </CardHeader>

                    <CardContent className="flex-1 pb-0">
                        <ChartContainer
                            config={continentChartConfig}
                            className="aspect-square max-h-[450px] [&_.recharts-text]:fill-background"
                        >
                            <PieChart>
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            nameKey="continent"
                                            indicator="dot"
                                            hideLabel
                                            className="bg-primary-100 text-white p-2 border-none rounded-lg shadow-lg"
                                        />
                                    }
                                />

                                <Pie data={continentData} dataKey="medals">
                                    <LabelList
                                        dataKey="continent"
                                        className="fill-background"
                                        stroke="none"
                                        fontSize={12}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </CardContent>

                    <CardFooter className="flex-col gap-2 text-sm">
                    </CardFooter>
                </Card>
            </div>

            <Card className="w-full border-none bg-primary-50 text-white mt-10">
                <CardHeader>
                </CardHeader>
                
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[500px] w-full">
                        <AreaChart
                            accessibilityLayer
                            data={linearChartData}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <XAxis
                                dataKey="year"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />

                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        indicator="dot"
                                        hideLabel
                                        className="bg-primary-100 text-white p-2 border-none rounded-lg shadow-lg"
                                    />
                                }
                            />

                            <Area
                                dataKey="medals"
                                type="linear"
                                // fill="var(--color-desktop)"
                                fillOpacity={0.4}
                                // stroke="var(--color-desktop)"
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
                
                <CardFooter>
                </CardFooter>
            </Card>
        </div>
    </div>
  )
}

export default Analytics;
