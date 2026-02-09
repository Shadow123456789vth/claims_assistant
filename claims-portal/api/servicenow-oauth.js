export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {

  // DEBUG log (visible in Vercel logs)
  console.log("METHOD:", req.method);
  console.log("BODY:", req.body);

  // Allow both POST and OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      received: req.method
    });
  }

  try {

    // Convert body to urlencoded string
    const params = new URLSearchParams(req.body);

    const snResponse = await fetch(
      'https://nextgenbpmnp1.service-now.com/oauth_token.do',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      }
    );

    const text = await snResponse.text();

    return res.status(snResponse.status).send(text);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
