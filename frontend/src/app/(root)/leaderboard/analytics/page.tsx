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

import {useEffect, useState} from "react"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie";

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
      color: "hsl(var(--chart-3))",
    },
    australia: {
      label: "Australia",
      color: "hsl(var(--chart-4))",
    },
    north_america: {
      label: "North America",
      color: "hsl(var(--chart-5))",
    },
    south_america: {
      label: "South America",
      color: "hsl(var(--chart-6))",
    }
} satisfies ChartConfig

const chartConfig = {
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
    color: "hsl(var(--chart-3))",
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

function Analytics() {
    const router = useRouter();
    
    const [loading, setLoading] = useState<boolean>(true);
    const [continentData, setContinentData] = useState<any[]>([
        { continent: "africa", medals: 100, fill: "var(--color-africa)" },
        { continent: "europe", medals: 1000, fill: "var(--color-europe)" },
        { continent: "asia", medals: 500, fill: "var(--color-asia)" },
        { continent: "australia", medals: 300, fill: "var(--color-australia)" },
        { continent: "north_america", medals: 250, fill: "var(--color-north_america)" },
        { continent: "south_america", medals: 150, fill: "var(--color-south_america)" },
    ]);
    const [sportsmanData, setSportsmanData] = useState<any[]>([]);
    const [yearsData, setYearsData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
        
            const API_URL = process.env.NEXT_PUBLIC_SPORTS_API_URL || "";
            const token = Cookies.get("token");
            const refreshToken = Cookies.get("refresh-token");
        
            try {
                const medalsPerYearResponse = await fetch(
                    `${API_URL}/medals/year`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                            "x-refresh-token": refreshToken || "",
                        },
                    }
                );
        
                if (!medalsPerYearResponse.ok) {
                    const errorData = await medalsPerYearResponse.json();
                    router.push(`/error?code=${medalsPerYearResponse.status}&message=${errorData.message || "An error occurred while fetching data."}`);
                }
        
                const data = await medalsPerYearResponse.json();

                setYearsData(data.data.map((item: any) => ({
                    year: item.Year,
                    medals: item.total
                })));

                const medalsPerSportsmenResponse = await fetch(
                    `${API_URL}/medals/sportsmen`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                            "x-refresh-token": refreshToken || "",
                        },
                    }
                );
        
                if (!medalsPerSportsmenResponse.ok) {
                    const errorData = await medalsPerSportsmenResponse.json();
                    router.push(`/error?code=${medalsPerSportsmenResponse.status}&message=${errorData.message || "An error occurred while fetching data."}`);
                }
        
                const data2 = await medalsPerSportsmenResponse.json();

                setSportsmanData(data2.data.map((item: any) => ({
                    sportsman: item.Name,
                    gold: item.Gold,
                    silver: item.Silver,
                    bronze: item.Bronze,
                    appearance: item.Total_Appearances
                })));
            } catch (err: any) {
                console.error("Error fetching data:", err);
                router.push(`/error?code=500&message=${err.message || "An unexpected error occurred."}`);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [])
    
    if (loading) {
        return (
          <LoadingSpinner />
        )
    }
  
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
                                    data={sportsmanData}
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
                                    
                                    <Bar dataKey="gold" fill="var(--color-gold)" radius={4} />
                                    <Bar dataKey="silver" fill="var(--color-silver)" radius={4} />
                                    <Bar dataKey="bronze" fill="var(--color-bronze)" radius={4} />
                                    <Bar dataKey="appearance" fill="var(--color-appearance)" radius={4} />
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
                                data={yearsData}
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
                                    fill="var(--color-medals)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-medals)"
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
