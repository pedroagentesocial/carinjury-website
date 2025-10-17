import type { APIRoute } from 'astro';

export const prerender = true; // Cambio a static para build

export const GET: APIRoute = async () => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.PUBLIC_GOOGLE_PLACE_ID;

  if (!key || !placeId) {
    return new Response(
      JSON.stringify({ error: 'Faltan GOOGLE_MAPS_API_KEY o PUBLIC_GOOGLE_PLACE_ID' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }

  // Place Details (devuelve ~5 reseñas)
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'name,rating,user_ratings_total,url,reviews');
  url.searchParams.set('key', key);

  try {
    const r = await fetch(url.toString());
    const data = await r.json();

    if (data.status !== 'OK') {
      return new Response(
        JSON.stringify({ error: data.status, details: data.error_message }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      );
    }

    const reviews = (data.result.reviews || []).map((rv: any) => ({
      author_name: rv.author_name,
      profile_photo_url: rv.profile_photo_url,
      rating: rv.rating,
      relative_time: rv.relative_time_description,
      text: rv.text,
      time: rv.time,
      author_url: rv.author_url || data.result.url
    }));

    return new Response(JSON.stringify({
      name: data.result.name,
      rating: data.result.rating,
      total: data.result.user_ratings_total,
      url: data.result.url,
      reviews
    }), { headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'FETCH_FAIL', details: String(e) }), {
      status: 500, headers: { 'content-type': 'application/json' }
    });
  }
};
