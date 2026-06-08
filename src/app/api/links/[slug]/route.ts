import { NextResponse } from 'next/server';
import { getLinkBySlug, updateLink, deleteLink } from '@/lib/store';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;

    const link = await getLinkBySlug(slug);
    
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch link' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;
    const { targetUrl } = await request.json();

    if (!targetUrl) {
      return NextResponse.json({ error: 'Target URL is required' }, { status: 400 });
    }

    try {
      new URL(targetUrl);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid Target URL format' }, { status: 400 });
    }

    const updatedLink = await updateLink(slug, targetUrl);

    if (!updatedLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json(updatedLink);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;

    const deletedLink = await deleteLink(slug);
    
    if (!deletedLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}
