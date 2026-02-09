export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {

    const response = await fetch(
      'https://nextgenbpmnp1.service-now.com/oauth_token.do',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: req.body
      }
    );

    const text = await response.text();

    res.status(response.status).send(text);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
