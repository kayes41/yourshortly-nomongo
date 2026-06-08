'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkIcon, MousePointer2, Globe, Compass, Laptop, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return <div className="p-4 text-red-400">Failed to load analytics data.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-8 -mt-8"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Links</CardTitle>
            <LinkIcon className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-white">{data.totalLinks.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Clicks</CardTitle>
            <MousePointer2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-white">{data.totalClicks.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-400" /> Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topCountries.length === 0 ? (
              <p className="text-sm text-zinc-500">No data available</p>
            ) : (
              <div className="space-y-4">
                {data.topCountries.map((item: any) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">{item.name}</span>
                    <span className="text-sm font-medium text-zinc-400">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-400" /> Top Browsers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topBrowsers.length === 0 ? (
              <p className="text-sm text-zinc-500">No data available</p>
            ) : (
              <div className="space-y-4">
                {data.topBrowsers.map((item: any) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">{item.name}</span>
                    <span className="text-sm font-medium text-zinc-400">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Laptop className="h-5 w-5 text-purple-400" /> Top Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topDevices.length === 0 ? (
              <p className="text-sm text-zinc-500">No data available</p>
            ) : (
              <div className="space-y-4">
                {data.topDevices.map((item: any) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">{item.name}</span>
                    <span className="text-sm font-medium text-zinc-400">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg">Recent Global Click Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
             <p className="text-sm text-zinc-500">No clicks yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-400">
                    <th className="pb-3 font-medium">Time</th>
                    <th className="pb-3 font-medium">Location</th>
                    <th className="pb-3 font-medium">Device/Browser</th>
                    <th className="pb-3 font-medium">Referrer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {data.recentActivity.map((click: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-3 text-zinc-300">
                        {format(new Date(click.clicked_at), 'MMM d, yyyy HH:mm:ss')}
                      </td>
                      <td className="py-3 text-zinc-300">
                        {click.city !== 'Unknown' && click.city ? `${click.city}, ` : ''}{click.country}
                      </td>
                      <td className="py-3 text-zinc-300">
                        {click.device} • {click.browser}
                      </td>
                      <td className="py-3 text-zinc-500 max-w-[200px] truncate">
                        {click.referrer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
