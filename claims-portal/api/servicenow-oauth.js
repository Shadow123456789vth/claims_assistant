module.exports = async (req, res) => {

  res.setHeader('Content-Type', 'application/json');

  // Basic debug response
  return res.end(JSON.stringify({
    message: "API route is working ✅",
    method: req.method,
    body: req.body || null,
    time: new Date().toISOString()
  }));
};
