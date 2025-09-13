"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import { TrendingUp, TrendingDown, Users, Clock, Calendar, RefreshCw } from "lucide-react"

// Mock historical data
const generateHistoricalData = () => {
  const data = []
  const baseDate = new Date("2024-09-15T08:00:00Z")

  for (let i = 0; i < 24; i++) {
    const time = new Date(baseDate.getTime() + i * 60 * 60 * 1000)
    const hour = time.getHours()

    // Simulate realistic crowd patterns
    let attendance = 0
    if (hour >= 8 && hour <= 22) {
      // Peak hours: 10-12, 16-20
      if ((hour >= 10 && hour <= 12) || (hour >= 16 && hour <= 20)) {
        attendance = 7000 + Math.random() * 3000
      } else if (hour >= 13 && hour <= 15) {
        attendance = 5000 + Math.random() * 2000
      } else {
        attendance = 3000 + Math.random() * 2000
      }
    }

    data.push({
      time: time.toISOString(),
      timestamp: time.getTime(),
      attendance: Math.floor(attendance),
      hour: hour,
      formattedTime: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    })
  }

  return data
}

const weeklyData = [
  { day: "Mon", attendance: 8500, capacity: 12000 },
  { day: "Tue", attendance: 7200, capacity: 12000 },
  { day: "Wed", attendance: 9100, capacity: 12000 },
  { day: "Thu", attendance: 8800, capacity: 12000 },
  { day: "Fri", attendance: 10200, capacity: 12000 },
  { day: "Sat", attendance: 11500, capacity: 12000 },
  { day: "Sun", attendance: 9800, capacity: 12000 },
]

const peakHoursData = [
  { hour: "08:00", count: 3200 },
  { hour: "09:00", count: 4800 },
  { hour: "10:00", count: 7200 },
  { hour: "11:00", count: 8900 },
  { hour: "12:00", count: 8500 },
  { hour: "13:00", count: 6800 },
  { hour: "14:00", count: 5900 },
  { hour: "15:00", count: 6200 },
  { hour: "16:00", count: 8100 },
  { hour: "17:00", count: 9400 },
  { hour: "18:00", count: 10200 },
  { hour: "19:00", count: 9800 },
  { hour: "20:00", count: 8600 },
  { hour: "21:00", count: 6400 },
  { hour: "22:00", count: 4200 },
]

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("today")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [historicalData] = useState(generateHistoricalData())

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const currentAttendance = 8500
  const previousAttendance = 7800
  const attendanceChange = currentAttendance - previousAttendance
  const attendanceChangePercent = ((attendanceChange / previousAttendance) * 100).toFixed(1)

  const peakAttendance = Math.max(...historicalData.map((d) => d.attendance))
  const avgAttendance = Math.floor(historicalData.reduce((sum, d) => sum + d.attendance, 0) / historicalData.length)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentAttendance.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {attendanceChange > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={attendanceChange > 0 ? "text-green-500" : "text-red-500"}>
                {attendanceChangePercent}% from yesterday
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakAttendance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Highest count today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAttendance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Daily average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity Usage</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((currentAttendance / 12000) * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of total capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Attendance Over Time
          </CardTitle>
          <CardDescription>Real-time crowd density throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="formattedTime" className="text-xs fill-muted-foreground" interval="preserveStartEnd" />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "hsl(var(--card-foreground))" }}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#attendanceGradient)"
                  strokeWidth={2}
                />
                {/* Threshold lines */}
                <Line
                  type="monotone"
                  dataKey={() => 8000}
                  stroke="#eab308"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey={() => 10000}
                  stroke="#dc2626"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-chart-1 rounded-full" />
              <span>Attendance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-yellow-500" />
              <span>Yellow Threshold (8,000)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-red-500" />
              <span>Red Threshold (10,000)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Trends</CardTitle>
            <CardDescription>Average daily attendance over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="attendance" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours Analysis</CardTitle>
            <CardDescription>Hourly attendance patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Event Summary</CardTitle>
          <CardDescription>Key insights and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Busiest Period</h4>
              <p className="text-2xl font-bold">6:00 PM - 7:00 PM</p>
              <p className="text-sm text-muted-foreground">Peak attendance: 10,200</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Capacity Utilization</h4>
              <p className="text-2xl font-bold">85.4%</p>
              <p className="text-sm text-muted-foreground">Average throughout the day</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Safety Status</h4>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Caution Level</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Above yellow threshold for 6 hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
