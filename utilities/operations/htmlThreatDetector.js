const { promptWithJsonSchema } = require('./gptService');

const htmlThreatSchema = {
  type: 'object',
  properties: {
    // main numeric score: 0 (safe) — 10 (definitely malicious)
    threatLevel: {
      type: 'integer',
      minimum: 0,
      maximum: 10,
    },
    summary: {
      type: 'string',
    },
  },
};

const htmlThreatSchemaObject = {
  name: 'html_threat_schema',
  schema: htmlThreatSchema,
};

const htmlThreatDetector = async (content) => {
  const prompt = `You are an application security auditor validating ONE HTML document by static inspection only (no execution).

Return JSON ONLY, matching:
{
  "threatLevel": <integer 0–10>,
  "summary": "<one concise sentence explaining the reason>"
}

Scoring rubric (mutually exclusive bands):
0  = Pure HTML/CSS. No <script>, no inline handlers, no external resources.
1–2 = Benign scripts ONLY:
      - <script type="application/ld+json"> structured data
      - Small inline scripts that do not read/modify DOM or use dangerous APIs
      - Local, same-origin script URLs without query params and without dynamic loaders
3–4 = Mild risk:
      - Inline event handlers (onclick, onload, onerror, etc.)
      - DOM writes limited to safe textContent usage
      - External resources from recognizable CDNs with SRI or CSP present
5–6 = Moderate:
      - External scripts without SRI/CSP (unknown trust)
      - Forms posting to third-party origins
      - iframe without sandbox
7–8 = High:
      - eval, new Function, setTimeout/Interval with string arg
      - atob/btoa + suspicious Base64 payloads
      - document.write / innerHTML assignment from untrusted strings
      - javascript: or data: URLs that execute JS
      - dynamic script injection (createElement('script'), appendChild) or obfuscation
9–10 = Critical:
      - Confirmed malware patterns, heavy obfuscation, crypto-miners, known malicious domains

Consider (but don’t over-penalize):
- CSP, SRI, sandbox, referrerpolicy (mitigations lower the band when applicable).
- Type "module" is not by itself risky.
- application/ld+json is SAFE.
- Analytics pixels alone are not high risk.

Rules:
- Use the LOWEST score consistent with the evidence found.
- If nothing clearly risky is present, return 1 (not 3+).
- If truly no scripts/external resources/inline handlers exist, return 0.
- Output JSON only, no prose, no Markdown, no backticks.

Now analyze this HTML exactly as given (do not execute it):
<<<BEGIN_HTML>>>
${content}
<<<END_HTML>>>`;

  const { result, error } = await promptWithJsonSchema({ prompt, jsonSchema: htmlThreatSchemaObject });
  if (error) return { error: null };
  if (!result) return { error: null };
  const { threatLevel, summary } = result;

  const threat = threatLevel > 5;
  if (!threat) return { error: null };

  const message = `Your update was detected as dangerous and was not posted. Threat: ${threatLevel};
Reason: ${summary}`;

  return { error: { status: 422, message } };
};

module.exports = {
  htmlThreatDetector,
};
