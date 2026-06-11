exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { skills, time, budget, goal, location } = JSON.parse(event.body);

    const prompt = `You are a side hustle expert. Based on this profile, suggest exactly 5 personalized side hustles.

Profile:
- Skills: ${skills}
- Daily time: ${time}
- Budget: ${budget}
- Goal: ${goal}
- Location: ${location}

Respond ONLY in this exact JSON format with no other text:
{"hustles":[{"name":"name","emoji":"emoji","monthly_earning":"$X-$Y/month","time_to_first":"X weeks","difficulty":"Easy/Medium/Hard","why_fit":"one sentence why perfect for them","first_step":"exact action they can take today"}]}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!data.content || !data.content[0]) {
      throw new Error('Invalid API response');
    }

    let text = data.content[0].text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
