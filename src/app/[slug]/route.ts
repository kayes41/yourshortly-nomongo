import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { userAgent } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;

    const { data: link, error } = await supabaseAdmin
      .from('links')
      .select('id, original_url')
      .eq('slug', slug)
      .single();

    if (error || !link) {
      return NextResponse.redirect(new URL('/invalid-link', request.url));
    }

    // Capture analytics asynchronously
    const { device, browser } = userAgent(request);
    
    // Attempt to extract headers from the request
    const reqHeaders = new Headers(request.headers);
    const country = reqHeaders.get('x-vercel-ip-country') || reqHeaders.get('cf-ipcountry') || 'Unknown';
    const city = reqHeaders.get('x-vercel-ip-city') || 'Unknown';
    const referrer = reqHeaders.get('referer') || 'Direct';

    // Increment clicks and record the click in the database
    // Next.js serverless functions might terminate background tasks if not awaited,
    // so we should await them in Next.js 14+ unless using waitUntil() (Next.js 15 Edge) or similar.
    // For safety, we will await the DB calls, Supabase is very fast.
    
    await Promise.all([
      supabaseAdmin.rpc('increment_clicks', { row_id: link.id }),
      supabaseAdmin.from('clicks').insert({
        link_id: link.id,
        country: country.substring(0, 50),
        city: city.substring(0, 100),
        browser: browser.name || 'Unknown',
        device: device.type === 'mobile' ? 'Mobile' : device.type === 'tablet' ? 'Tablet' : 'Desktop',
        referrer: referrer.substring(0, 500)
      })
    ]).catch(err => console.error('Failed to record analytics:', err));

    // Wait! Since increment_clicks is an RPC we need to define it or just use an update query
    // Since we didn't create `increment_clicks` RPC in our SQL, we should update the SQL or just do an update query.
    // Actually it's safer to just let the RPC fail if we don't define it, or better yet, define the RPC in SQL.
    // Alternatively, just do: update links set clicks = clicks + 1 where id = link.id
    // But Supabase JS doesn't support atomic increments without RPC. Let's just do an RPC in SQL and add it to the setup file,
    // or we can select clicks, increment and update. For a fast redirect, RPC is best.

    // Perform the fast redirect
    return NextResponse.redirect(link.original_url, 302);
  } catch (error) {
    console.error('Redirect error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
