import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Globe, Laptop, Compass, MousePointer2 } from "lucide-react";
import NextLink from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function StatsPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;

  const { data: link, error: linkError } = await supabaseAdmin
    .from('links')
    .select('id, original_url, clicks')
    .eq('slug', slug)
    .single();

  if (linkError || !link) {
    notFound();
  }

  const { data: clicksData, error: clicksError } = await supabaseAdmin
    .from('clicks')
    .select('*')
    .eq('link_id', link.id)
    .order('clicked_at', { ascending: false });

  if (clicksError) {
    console.error('Failed to fetch clicks:', clicksError);
  }

  const clicks = clicksData || [];

  // Calculate stats
  const countryMap = new Map<string, number>();
  const browserMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();

  clicks.forEach(c => {
    countryMap.set(c.country || 'Unknown', (countryMap.get(c.country || 'Unknown') || 0) + 1);
    browserMap.set(c.browser || 'Unknown', (browserMap.get(c.browser || 'Unknown') || 0) + 1);
    deviceMap.set(c.device || 'Unknown', (deviceMap.get(c.device || 'Unknown') || 0) + 1);
  });

  const topCountries = Array.from(countryMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topBrowsers = Array.from(browserMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topDevices = Array.from(deviceMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const recentClicks = clicks.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <NextLink href="/dashboard" className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </NextLink>
        <div>
          <h1 className="text-2xl font-bold">Stats for {slug}</h1>
          <a href={link.original_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate max-w-md block">
            {link.original_url}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Clicks</CardTitle>
            <MousePointer2 className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{link.clicks.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-400" /> Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCountries.length === 0 ? (
              <p className="text-sm text-zinc-500">No data available</p>
            ) : (
              <div className="space-y-4">
                {topCountries.map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="text-sm">{country}</span>
                    <span className="text-sm font-medium text-zinc-400">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-400" /> Top Browsers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topBrowsers.length === 0 ? (
              <p className="text-sm text-zinc-500">No data available</p>
            ) : (
              <div className="space-y-4">
                {topBrowsers.map(([browser, count]) => (
                  <div key={browser} className="flex items-center justify-between">
                    <span className="text-sm">{browser}</span>
                    <span className="text-sm font-medium text-zinc-400">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Laptop className="h-5 w-5 text-purple-400" /> Top Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topDevices.length === 0 ? (
              <p className="text-sm text-zinc-500">No data available</p>
            ) : (
              <div className="space-y-4">
                {topDevices.map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <span className="text-sm">{device}</span>
                    <span className="text-sm font-medium text-zinc-400">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg">Recent Click Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentClicks.length === 0 ? (
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
                  {recentClicks.map(click => (
                    <tr key={click.id}>
                      <td className="py-3 text-zinc-300">
                        {format(new Date(click.clicked_at), 'MMM d, yyyy HH:mm:ss')}
                      </td>
                      <td className="py-3 text-zinc-300">
                        {click.city !== 'Unknown' ? `${click.city}, ` : ''}{click.country}
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
