export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"] || "Content-Type,Authorization"
    );
    if (req.method === "OPTIONS") return res.status(204).end();
  
    // Parse URL directly
    const url = req.url || "";
  
    // Split path and query
    const [pathPart, queryPart] = url.split("?");
  
    // Extract everything after /api/uniswap/base
    const restPath = pathPart.replace(/^\/?api\/uniswap\/base\/?/, "/").replace(/^\/$/, "");
  
    // Clean query string - remove [...path] leak
    let cleanQuery = queryPart ? `?${queryPart}` : "";
    cleanQuery = cleanQuery.replace(/&?\[\.\.\.path\]=[^&]*/g, "").replace(/^\?&/, "?").replace(/^\?$/, "");
  
    const upstream = `https://interface.gateway.uniswap.org${restPath}${cleanQuery}`;
  
    console.log("ENDPOINT:", upstream);
  
    try {
      const headers = { origin: "http://localhost:3000" };
      if (req.method === "POST") headers["content-type"] = "application/json";
  
      const upstreamResp = await fetch(upstream, {
        method: req.method,
        headers,
        body: req.method === "POST" ? JSON.stringify(req.body ?? {}) : undefined,
      });
  
      const text = await upstreamResp.text();
      return res.status(upstreamResp.status).send(text);
    } catch (e) {
      return res.status(502).json({ error: "Upstream fetch failed", detail: String(e) });
    }
  }
  