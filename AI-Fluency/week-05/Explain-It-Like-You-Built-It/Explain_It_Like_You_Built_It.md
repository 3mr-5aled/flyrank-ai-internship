# Explain It Like You Built It: How Model Context Protocol (MCP) Works Under the Hood

> **Track:** General AI Fluency | **Week:** 5 | **Phase:** Build+  
> **Author:** Amr Khaled Morcy  
> **Topic Picked:** Model Context Protocol (MCP) JSON-RPC 2.0 Stdio Integration

---

## The Core Concept: Teaching AI How to Use Real Tools

Imagine you hire a brilliant virtual assistant who lives inside a room with no windows, no internet, and no access to your computer's hard drive. They can answer questions using what they already memorized, but if you ask them: *"What's the weather in Cairo right now?"* or *"Can you read this document on my desktop?"*, they are stuck. They don't have hands to touch your computer.

The **Model Context Protocol (MCP)** is like giving that assistant a standard set of hands and a secure intercom system connected to your computer.

Instead of writing a custom, complicated adapter every time you want an AI to talk to a new app (like Notion, GitHub, or your local hard drive), MCP provides a **universal standard interface**—like a USB-C port for AI applications.

---

## How It Works Step-by-Step (In Plain Words)

In Week 4, I built a working MCP server in Node.js ([mcp_demo.js](file:///D:/03-Career/02-Internships/Flyrank%20AI%20Intern/Assignments/flyrank-ai-internship/AI-Fluency/week-04/FL-05-Agent-Concepts-and-MCP-Basics/mcp_demo.js)). Here is exactly how the client (like Claude Desktop) and the server talk to each other under the hood:

### 1. The Secret Pipe (`stdio`)
When the AI program starts up, it launches our MCP server script as a background process. They communicate through standard input and output streams—known as `stdio`. 

Think of `stdio` like a pair of walkie-talkies connected by a wire:
- The AI client types a message into `stdin` (Standard Input).
- Our MCP server listens, processes the command, and replies back on `stdout` (Standard Output).

Because both sides send formatted text over this pipe, no internet connection or web server setup is required. It runs completely locally on your computer.

---

### 2. The Language They Speak (JSON-RPC 2.0)
To prevent misunderstandings, the AI client and server speak a standard structured dialect called **JSON-RPC 2.0**. Every single message sent over the walkie-talkie wire looks like a structured envelope containing three main things:
1. **ID:** A tracking number (e.g., `id: 1`) so both sides know which answer matches which question.
2. **Method:** What action is requested (e.g., `"initialize"`, `"tools/list"`, or `"tools/call"`).
3. **Params:** The extra details or arguments needed to perform the action.

---

### 3. The Handshake: Establishing Trust
Before any work gets done, the client and server do a 3-step handshake:

1. **Client says (`initialize`):** *"Hello! I am Claude Client v1.0. I support protocol version 2024-11-05. Are you ready?"*
2. **Server replies:** *"Hello! I am SystemAndApiMCPServer v1.0. I am ready and I support tools, resources, and prompts."*
3. **Client asks (`tools/list`):** *"What tools do you have for me?"*
4. **Server replies with a catalog:** *"I have 3 tools available: `read_local_file`, `query_live_weather_api`, and `execute_data_analytics`."*

Now the AI model knows *exactly* what tools are available and what parameters each tool requires!

---

### 4. Executing a Tool Call (The Real Action)
When you ask the AI: *"Read the project README on my desktop"*, the AI model realizes it cannot read local files directly. It looks at its MCP catalog, formats a JSON-RPC request, and sends it down the `stdio` pipe:

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "read_local_file",
    "arguments": {
      "filePath": "C:\\Users\\Amr\\Desktop\\README.md"
    }
  }
}
```

Our MCP server receives this message, executes the standard JavaScript `fs.readFileSync` command on your machine, captures the text, and sends back the output envelope:

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "# My Project\nThis is the content of your local file..."
      }
    ]
  }
}
```

The AI reads this result as part of its context, synthesizes the information, and presents the answer to you in natural language!

---

## Why This Architecture is Brilliant

1. **Security & Human Control:** The AI never has raw access to your computer. It can only call the specific tools your MCP server explicitly exposes. You remain the human in the loop.
2. **Modular & Reusable:** You write an MCP server once (for weather, database access, or file reading), and any MCP-compatible AI client can use it immediately without rewriting code.
3. **Separation of Concerns:** The AI model handles reasoning and natural language, while the local MCP server handles execution and system access.

By building this myself in `mcp_demo.js`, I stopped viewing AI as a magical black box and began seeing it for what it truly is: a smart reasoning engine connected to deterministic code via standard software protocols.
