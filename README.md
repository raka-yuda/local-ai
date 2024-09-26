# AI Chat Assistant

This project is an AI-powered chat assistant built with Next.js, Chakra UI, and integrated with the Anthropic API. It provides a user-friendly interface for interacting with an AI assistant, complete with code highlighting and markdown support.

## Features

- Real-time chat interface
- Code block highlighting and copying
- Markdown support for messages
- Responsive design with a collapsible sidebar
- Integration with Anthropic's Claude AI model
- Dedicated MDX chat page for easy copying of code blocks

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm (v6 or later)
- An Anthropic API key

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/ai-chat-assistant.git
   cd ai-chat-assistant
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

## Running the Project

To run the project in development mode:

```
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.