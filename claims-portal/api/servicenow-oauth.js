module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    // Handle body - it might be a string or stream in Vercel
    let body = req.body;
    if (typeof body === 'object' && !(body instanceof String)) {
      body = JSON.stringify(body);
    }

    console.log('[servicenow-oauth] Forwarding body:', body);

    const response = await fetch(
      'https://nextgenbpmnp1.service-now.com/oauth_token.do',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
      }
    );

    const text = await response.text();
    console.log('[servicenow-oauth] ServiceNow response:', response.status, text);

    // Always return JSON
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = response.status;

    // Parse ServiceNow response and return it
    let responseData;
    try {
      responseData = JSON.parse(text);
    } catch {
      // If ServiceNow didn't return JSON, wrap it
      responseData = { error: 'Invalid response from ServiceNow', raw: text };
    }

    res.end(JSON.stringify(responseData));

  } catch (err) {
    console.error('[servicenow-oauth] Error:', err);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
};
