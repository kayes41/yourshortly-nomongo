import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;

    const { data: link, error } = await supabaseAdmin
      .from('links')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error || !link) {
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

    const { data: updatedLink, error } = await supabaseAdmin
      .from('links')
      .update({ original_url: targetUrl })
      .eq('slug', slug)
      .select()
      .single();

    if (error || !updatedLink) {
      return NextResponse.json({ error: 'Link not found or failed to update' }, { status: 404 });
    }

    return NextResponse.json(updatedLink);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;

    const { error } = await supabaseAdmin
      .from('links')
      .delete()
      .eq('slug', slug);
    
    if (error) {
      return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}
