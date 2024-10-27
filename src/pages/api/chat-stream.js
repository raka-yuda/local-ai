import { Readable } from 'stream';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, provider } = req.body;

    // Set the endpoint and headers based on the provider
    let apiUrl, headers, bodyData;
    if (provider === 'anthropic') {
      apiUrl = 'https://api.anthropic.com/v1/messages';
      headers = {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      };
      bodyData = JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 2024,
        messages: [{ role: "user", content: message }],
        stream: true
      });
    } else if (provider === 'openai') {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      };
      bodyData = JSON.stringify({
        model: "gpt-4", // or "gpt-3.5-turbo"
        messages: [{ role: "user", content: message }],
        max_tokens: 2024,
        stream: true
      });
    } else {
      return res.status(400).json({ message: 'Invalid provider specified' });
    }

    const response = await fetch(apiUrl, { method: 'POST', headers, body: bodyData });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        res.write('event: done\ndata: {}\n\n');
        break;
      }

      const chunk = decoder.decode(value);

      if (provider === 'anthropic') {
        res.write(chunk);
      } else if (provider === 'openai') {
        const parsed = chunk
          .split('\n')
          .filter(line => line.trim().startsWith('data: '))
          .map(line => JSON.parse(line.replace('data: ', '')));

        parsed.forEach(event => {
          if (event.choices && event.choices[0].delta && event.choices[0].delta.content) {
            res.write(`data: ${JSON.stringify({ content: event.choices[0].delta.content })}\n\n`);
          }
        });
      }
    }

    res.end();
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
}
