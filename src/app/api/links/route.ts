import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { customAlphabet } from 'nanoid';

// Alphanumeric alphabet: uppercase, lowercase, numbers
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const generateSlug = customAlphabet(alphabet, 32); // Random length between 24 and 40 could be tricky to do purely randomly without bias, let's just use 32 as a solid middle ground, or we can randomise the length.

function getRandomLength(min = 24, max = 40) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortField = searchParams.get('sortField') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('links')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`slug.ilike.%${search}%,original_url.ilike.%${search}%`);
    }

    query = query
      .order(sortField, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: links, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      links,
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { targetUrl, customAlias } = await request.json();

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Target URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(targetUrl);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid Target URL format' },
        { status: 400 }
      );
    }

    let slug = customAlias;

    if (slug) {
      const { data: existing } = await supabaseAdmin
        .from('links')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Custom alias is already in use' },
          { status: 400 }
        );
      }
    } else {
      let isUnique = false;
      while (!isUnique) {
        const length = getRandomLength(24, 40);
        const dynamicGenerate = customAlphabet(alphabet, length);
        slug = dynamicGenerate();
        
        const { data: existing } = await supabaseAdmin
          .from('links')
          .select('id')
          .eq('slug', slug)
          .single();
          
        if (!existing) {
          isUnique = true;
        }
      }
    }

    const { data: link, error } = await supabaseAdmin
      .from('links')
      .insert([
        {
          slug,
          original_url: targetUrl,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Failed to create link:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}
