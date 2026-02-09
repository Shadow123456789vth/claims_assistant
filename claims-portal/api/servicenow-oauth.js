module.exports = async (req, res) => {

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
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

    res.statusCode = response.status;
    res.end(text);

  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
};
