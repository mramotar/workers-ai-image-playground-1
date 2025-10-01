// a next.js route that handles a JSON post request with prompt and model
// and calls the Cloudflare Workers AI model

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { model, ...inputs } = await req.json();  // Extract model and inputs
  const baseUrl = 'https://gateway.ai.cloudflare.com/v1/f3189377abb73756cfd065dee198e191/ai-image-generation-01/workers-ai/';
  const fullUrl = `${baseUrl}${model}`;

  try {
    const gatewayResponse = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,  // Store token in .env
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    });

    if (!gatewayResponse.ok) {
      const errorText = await gatewayResponse.text();
      return new NextResponse(errorText, { status: gatewayResponse.status });
    }

    const blob = await gatewayResponse.blob();
    return new NextResponse(await blob.arrayBuffer(), {
      headers: {
        'Content-Type': gatewayResponse.headers.get('Content-Type') || 'image/png',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
