import { NextResponse } from 'next/server';
import { getLinkBySlug } from '@/lib/store';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;

    const link = await getLinkBySlug(slug);

    if (!link) {
      return NextResponse.redirect(new URL('/not-found', request.url));
    }

    // Update clicks (in memory) without awaiting
    link.clicks = (link.clicks || 0) + 1;

    // Perform the fast redirect
    return NextResponse.redirect(link.targetUrl, 302);
  } catch (error) {
    console.error('Redirect error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
