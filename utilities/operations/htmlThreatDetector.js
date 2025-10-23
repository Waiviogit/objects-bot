const { promptWithJsonSchema } = require('./gptService');

const htmlThreatSchema = {
  type: 'object',
  properties: {
    // main numeric score: 0 (safe) — 10 (definitely malicious)
    threatLevel: {
      type: 'integer',
      minimum: 0,
      maximum: 10,
      description: [
        'Threat score for the HTML page on a scale from 0 to 10.',
        '0 = Pure HTML/CSS, no scripts or external resources (fully safe).',
        '1–2 = Only harmless inline scripts or trusted local scripts (very low risk).',
        '3–4 = Limited external or inline event handlers; mild indicators but no active threats (low–moderate risk).',
        '5–6 = Untrusted external resources, mixed inline JS, or forms referencing unknown origins (moderate risk).',
        '7–8 = Suspicious constructs like eval(), Function(), base64-encoded JS, or dynamic script injection (high risk).',
        '9–10 = Confirmed exploit patterns, obfuscated payloads, or known-malicious domains (critical risk).',
      ].join(' '),
    },
    summary: {
      type: 'string',
      description: 'One-sentence explanation of the result: why this page got the given threatLevel.',
    },
  },
};

const htmlThreatSchemaObject = {
  name: 'html_threat_schema',
  schema: htmlThreatSchema,
};

const htmlThreatDetector = async (content) => {
  const prompt = `You are an application security auditor validating a single HTML document by static inspection only (no execution).

Your task:
- Inspect the HTML code for potential security threats.
- Return a JSON object matching this schema:
  {
    "threatLevel": <integer 0–10>,
    "summary": "<one concise sentence explaining the reason>"
  }

Threat scale:
0 = Pure HTML/CSS, no scripts or external resources (fully safe).
1–2 = Only harmless inline or local scripts (very low risk).
3–4 = Some inline handlers or mild issues (low–moderate risk).
5–6 = Untrusted external scripts, forms to unknown origins (moderate risk).
7–8 = Suspicious constructs: eval(), Function(), base64 JS, dynamic injection (high risk).
9–10 = Confirmed malicious patterns, obfuscation, known-malicious domains (critical risk).

Inspect:
- <script> tags (inline/external)
- Inline event handlers (onclick, onload)
- External resources (scripts, links, iframes)
- Dangerous functions: eval, new Function, atob, document.write, innerHTML assignment
- Forms posting to third-party URLs
- Suspicious URL schemes (javascript:, data:)
- Security mitigations (CSP, SRI, sandbox)

Rules:
- Use the lowest score consistent with evidence.
- If ambiguous → choose the higher boundary within a band.
- No scripts/external links → must be 0.
- Output JSON only. No text or markdown.

Example output:
{
  "threatLevel": 6,
  "summary": "Contains inline scripts and form posting to unknown domain without CSP."
}

Now analyze this HTML: ${content}
`;

  const { result, error } = await promptWithJsonSchema({ prompt, jsonSchema: htmlThreatSchemaObject });
  if (error) return { error: null };
  if (!result) return { error: null };
  const { threatLevel, summary } = result;

  const threat = threatLevel > 5;
  if (!threat) return { error: null };

  const message = `Your update was detected as dangerous and was not posted.
Reason: ${summary}`;

  return { error: { status: 422, message } };
};

module.exports = {
  htmlThreatDetector,
};
