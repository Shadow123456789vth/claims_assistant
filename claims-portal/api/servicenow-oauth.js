export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {

  console.log("Incoming method:", req.method);

  // Allow preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {

    // Accept body safely
    const params = new URLSearchParams(req.body || {});

    const sn = await fetch(
      'https://nextgenbpmnp1.service-now.com/oauth_token.do',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      }
    );

    const text = await sn.text();

    return res.status(sn.status).send(text);

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
