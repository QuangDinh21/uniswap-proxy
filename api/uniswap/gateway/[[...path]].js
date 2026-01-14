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
    
    // Extract everything after /api/uniswap/gateway
    const restPath = pathPart.replace(/^\/?api\/uniswap\/gateway\/?/, "/").replace(/^\/$/, "");
    
    // Clean query string - remove [...path] leak
    let cleanQuery = queryPart ? `?${queryPart}` : "";
    cleanQuery = cleanQuery.replace(/&?\[\.\.\.path\]=[^&]*/g, "").replace(/^\?&/, "?").replace(/^\?$/, "");
  
    const upstream = `https://interface.gateway.uniswap.org/v2${restPath}${cleanQuery}`;
  
    console.log("ENDPOINT:", upstream); // For debugging
  
    try {
      const headers = { origin: "http://localhost:3000" };
      if (req.method === "POST") headers["content-type"] = "application/json";
  
      // Handle body - ensure it's always a valid object then stringify
      let body = undefined;
      if (req.method === "POST") {
        let bodyData = req.body;
        
        // If body is a string, try to parse it
        if (typeof bodyData === "string") {
          try {
            bodyData = JSON.parse(bodyData);
          } catch (e) {
            // If parse fails, keep as is
          }
        }
        
        // If body is empty or not an object, default to empty object
        if (!bodyData || typeof bodyData !== "object") {
          bodyData = {};
        }
        
        body = JSON.stringify(bodyData);
      }
  
      const upstreamResp = await fetch(upstream, {
        method: req.method,
        headers,
        body,
      });
  
      const text = await upstreamResp.text();
      return res.status(upstreamResp.status).send(text);
    } catch (e) {
      return res.status(502).json({ error: "Upstream fetch failed", detail: String(e) });
    }
  }