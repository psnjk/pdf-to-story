# PDF to Story

Converts a PDF into a sequential, readable story using a local LLM.

## How it works

1. Upload a PDF on the first screen
2. The text is extracted and passed through a three-agent pipeline:
    - Agent 1 summarizes and cleans the raw text
    - Agent 2 converts it into a structured JSON list of topics
    - Agent 3 validates and repairs the JSON output
3. The result is displayed as a scrollable list of topic cards

## Stack

- React Native (Expo)
- Python / Flask (PDF extraction + Ollama proxy)
- Ollama (local LLM inference)

## Requirements

- Node.js
- Python 3.10+
- Ollama running locally with a model of your choice

## Setup

### Python server
`pip install -r requirements.txt`
`python pdf_server.py`

### Expo app
npm install
npx expo start

Open in browser with `w`, or scan the QR code with Expo Go on your phone.

## Configuration

In `pdf_server.py`, set your model name:
MODEL_NAME = "your-model-name"