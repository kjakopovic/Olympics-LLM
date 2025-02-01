"use client"

import { Area, AreaChart, Bar, BarChart, Pie, PieChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import SideBar from "@/components/SideBar"

import {useEffect, useState} from "react"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie";
import FiltersModal, { Filters } from "@/components/FilterModal"

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
  }
} satisfies ChartConfig

function Analytics() {
    const router = useRouter();
    
    const [sportsmenLoading, setSportsmenLoading] = useState<boolean>(false);
    const [isSportsmenModalOpen, setIsSportsmenModalOpen] = useState<boolean>(false);
    const [sportsmenFilters, setSportsmenFilters] = useState<Filters>({
        startYear: 2000,
        endYear: 2024,
        sport: "",
    });

    const [continentDataLoading, setContinentDataLoading] = useState<boolean>(false);
    const [isContinentDataModalOpen, setIsContinentDataModalOpen] = useState<boolean>(false);
    const [continentDataFilters, setContinentDataFilters] = useState<Filters>({
        startYear: 2000,
        endYear: 2024,
        sport: "",
    });

    const [medalsPerYearLoading, setMedalsPerYearLoading] = useState<boolean>(false);

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
            setMedalsPerYearLoading(true);
        
            const API_URL = process.env.NEXT_PUBLIC_SPORTS_API_URL || "";
            const token = Cookies.get("token");
            const refreshToken = Cookies.get("refresh-token");
        
            try {
                const response = await fetch(
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
        
                if (!response.ok) {
                    const errorData = await response.json();
                    router.push(`/error?code=${response.status}&message=${errorData.message || "An error occurred while fetching data."}`);
                }
        
                const data = await response.json();

                setYearsData(data.data.map((item: any) => ({
                    year: item.year,
                    medals: item.total
                })));
            } catch (err: any) {
                console.error("Error fetching data:", err);
                router.push(`/error?code=500&message=${err.message || "An unexpected error occurred."}`);
            } finally {
                setMedalsPerYearLoading(false);
            }
        };
        
        fetchData();
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            setContinentDataLoading(true);
        
            const API_URL = process.env.NEXT_PUBLIC_SPORTS_API_URL || "";
            const token = Cookies.get("token");
            const refreshToken = Cookies.get("refresh-token");
        
            try {
                const response = await fetch(
                    `${API_URL}/medals/continent?min_year=${continentDataFilters.startYear}&max_year=${continentDataFilters.endYear}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                            "x-refresh-token": refreshToken || "",
                        },
                    }
                );
        
                if (!response.ok) {
                    const errorData = await response.json();
                    router.push(`/error?code=${response.status}&message=${errorData.message || "An error occurred while fetching data."}`);
                }
        
                const data = await response.json();
                
                setContinentData(prevData =>
                    prevData.map(continent => {
                      const updatedContinent = data.data.find((item: any) => item.continent === continent.continent);
                      
                      return updatedContinent ? { ...continent, medals: updatedContinent.total } : continent;
                    })
                );
            } catch (err: any) {
                console.error("Error fetching data:", err);
                router.push(`/error?code=500&message=${err.message || "An unexpected error occurred."}`);
            } finally {
                setContinentDataLoading(false);
            }
        };
        
        fetchData();
    }, [continentDataFilters])

    useEffect(() => {
        const fetchData = async () => {
            setSportsmenLoading(true);
        
            const API_URL = process.env.NEXT_PUBLIC_SPORTS_API_URL || "";
            const token = Cookies.get("token");
            const refreshToken = Cookies.get("refresh-token");
        
            try {
                const response = await fetch(
                    `${API_URL}/medals/sportsmen?min_year=${sportsmenFilters.startYear}&max_year=${sportsmenFilters.endYear}&list_of_sports=${sportsmenFilters.sport}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                            "x-refresh-token": refreshToken || "",
                        },
                    }
                );
        
                if (!response.ok) {
                    const errorData = await response.json();
                    router.push(`/error?code=${response.status}&message=${errorData.message || "An error occurred while fetching data."}`);
                }
        
                const data = await response.json();

                setSportsmanData(data.data.map((item: any) => ({
                    sportsman: item.name,
                    gold: item.gold,
                    silver: item.silver,
                    bronze: item.bronze,
                    appearance: item.appearances
                })));
            } catch (err: any) {
                console.error("Error fetching data:", err);
                router.push(`/error?code=500&message=${err.message || "An unexpected error occurred."}`);
            } finally {
                setSportsmenLoading(false);
            }
        };

        fetchData();
    }, [sportsmenFilters]);
  
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
                    <Card className="w-[50%] h-[575px] border-none bg-primary-50 text-white mr-5">
                        {sportsmenLoading ?
                            <LoadingSpinner />
                        :
                            <>
                                <CardHeader
                                    className="flex flex-row justify-between items-center"
                                >
                                    <CardTitle>
                                        Medal Leaders: Top 5 Sportsmen & Their Achievements
                                    </CardTitle>

                                    <button
                                        onClick={() => setIsSportsmenModalOpen(true)}
                                        className="w-[25%] bg-gradient-to-r from-primary-500 to-primary-500/80 text-white px-6 py-2 mx-5 rounded-lg hover:from-primary-200 hover:to-primary-200/80 transition-colors duration-300"
                                    >
                                        Filters
                                    </button>
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
                            </>
                        }
                    </Card>

                    <Card className="flex flex-col w-[50%] h-[575px] border-none bg-primary-50 text-white ml-5">
                        {continentDataLoading ? 
                            <LoadingSpinner />
                        :
                            <>
                                <CardHeader
                                    className="flex flex-row justify-between items-center"
                                >
                                    <CardTitle>
                                        Global Medal Share: Breakdown by Continent
                                    </CardTitle>

                                    <button
                                        onClick={() => setIsContinentDataModalOpen(true)}
                                        className="w-[25%] bg-gradient-to-r from-primary-500 to-primary-500/80 text-white px-6 py-2 mx-5 rounded-lg hover:from-primary-200 hover:to-primary-200/80 transition-colors duration-300"
                                    >
                                        Filters
                                    </button>
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

                                            <ChartLegend
                                                content={<ChartLegendContent nameKey="continent" />}
                                                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                                            />

                                            <Pie
                                                data={continentData}
                                                dataKey="medals"
                                                labelLine={false}
                                                label={({ payload, ...props }) => {
                                                    return (
                                                    <text
                                                        cx={props.cx}
                                                        cy={props.cy}
                                                        x={props.x}
                                                        y={props.y}
                                                        textAnchor={props.textAnchor}
                                                        dominantBaseline={props.dominantBaseline}
                                                        fill="white"
                                                    >
                                                        {payload.medals}
                                                    </text>
                                                    )
                                                }}
                                                nameKey="continent"
                                            />
                                        </PieChart>
                                    </ChartContainer>
                                </CardContent>

                                <CardFooter className="flex-col gap-2 text-sm">
                                </CardFooter>
                            </>
                        }
                    </Card>
                </div>

                <Card className="w-full min-h-[600px] border-none bg-primary-50 text-white mt-10">
                    {medalsPerYearLoading ? 
                        <LoadingSpinner />
                    :
                        <>
                            <CardHeader>
                                <CardTitle>
                                    Medal Counts by Year: A Look at the Trends
                                </CardTitle>
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
                        </>
                    }
                </Card>
            </div>

            <FiltersModal
                isOpen={isSportsmenModalOpen}
                onClose={() => setIsSportsmenModalOpen(false)}
                onApply={async (selectedFilters: Filters) => {
                    setSportsmenFilters(selectedFilters);
                }}
            />

            <FiltersModal
                showSportOption={false}
                isOpen={isContinentDataModalOpen}
                onClose={() => setIsContinentDataModalOpen(false)}
                onApply={async (selectedFilters: Filters) => {
                    setContinentDataFilters(selectedFilters);
                }}
            />
        </div>
    )
}

export default Analytics;
