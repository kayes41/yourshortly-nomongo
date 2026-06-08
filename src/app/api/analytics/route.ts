import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Get total links and total clicks
    const { count: totalLinks } = await supabaseAdmin.from('links').select('*', { count: 'exact', head: true });
    
    // Total clicks across all links
    const { data: linksData } = await supabaseAdmin.from('links').select('clicks');
    const totalClicks = linksData?.reduce((acc, link) => acc + (link.clicks || 0), 0) || 0;

    // 2. Get all clicks to calculate distributions
    // For a highly scalable app we might want to group by in SQL using RPCs, but for now we'll fetch recent clicks and aggregate
    // or just aggregate all clicks if it's small enough. Let's fetch the last 10,000 clicks for aggregation.
    const { data: clicks } = await supabaseAdmin
      .from('clicks')
      .select('country, device, browser, clicked_at, referrer, city')
      .order('clicked_at', { ascending: false })
      .limit(1000);

    const countryMap = new Map<string, number>();
    const browserMap = new Map<string, number>();
    const deviceMap = new Map<string, number>();

    (clicks || []).forEach(c => {
      countryMap.set(c.country || 'Unknown', (countryMap.get(c.country || 'Unknown') || 0) + 1);
      browserMap.set(c.browser || 'Unknown', (browserMap.get(c.browser || 'Unknown') || 0) + 1);
      deviceMap.set(c.device || 'Unknown', (deviceMap.get(c.device || 'Unknown') || 0) + 1);
    });

    const topCountries = Array.from(countryMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
    const topBrowsers = Array.from(browserMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
    const topDevices = Array.from(deviceMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
    const recentActivity = (clicks || []).slice(0, 10);

    return NextResponse.json({
      totalLinks: totalLinks || 0,
      totalClicks,
      topCountries,
      topBrowsers,
      topDevices,
      recentActivity
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
