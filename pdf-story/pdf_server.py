from flask import Flask, request, jsonify
from flask_cors import CORS
from pdfminer.high_level import extract_text
import requests
import json
import re

app = Flask(__name__)
CORS(app)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "ministral-pdf"

AGENT1_PROMPT = """You are a text summarizer for educational content. 
Your job is to condense the following raw text into a clean, structured summary.
- Remove any formatting artifacts, page numbers, headers, footers
- Group related sentences together by topic
- Keep all important concepts, definitions, and explanations
- If the material has a clear order (progression, chapters, steps), keep it.
- Output plain text only, no JSON, no markdown
- Be concise but do not lose important information

Text:
{text}

Response:"""

AGENT2_PROMPT = """You are a JSON converter for educational content.
Convert the following study material summary into a JSON array.
Each element must have exactly two keys: "title" (topic name) and "summary" (2-3 sentence explanation).
Group related ideas into single topics. Generate at most 12 topics.
If the content has a clear order (steps, chapters, progression), preserve it.

Return ONLY a JSON array. No explanation, no markdown formatting, no code blocks. Example format:
[{{"title": "Introduction to Neural Networks", "summary": "Neural networks are..."}}, {{"title": "Backpropagation", "summary": "Backpropagation is..."}}]


Summary:
{text}

[{{"""

AGENT3_PROMPT = """You are a JSON validator and fixer.
You will receive a JSON array where each element should have a "title" string and a "summary" string.
Your job:
- If the JSON is valid and all elements have both fields, return it as-is
- If any element is missing a field, add a sensible placeholder
- If the JSON is malformed, fix it
- If an element has extra fields, remove them

Example of valid json structure:
[{{"title": "Introduction to Neural Networks", "summary": "Neural networks are..."}}, {{"title": "Backpropagation", "summary": "Backpropagation is..."}}]

Return ONLY one corrected JSON array that is valid, no explanation, no markdown formatting, no code blocks, no adaptations, no other JSONs.

JSON to validate:
{text}

Validated JSON:"""


def clean_json_response(raw):
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r'^```[a-zA-Z]*\n?', '', raw)
        raw = re.sub(r'```$', '', raw)
    return raw.strip().replace('\n', '')


@app.route('/extract', methods=['POST'])
def extract():
    try:
        file = request.files.get('pdf')
        if file is None:
            return jsonify({'error': 'No file received'}), 400
        text = extract_text(file.stream)
        text = re.sub(r'([.,!?;:])([^\s])', r'\1 \2', text)
        return jsonify({'text': text})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


def call_ollama(prompt):
    response = requests.post(OLLAMA_URL, json={
        "model": MODEL_NAME,
        "stream": False,
        "prompt": prompt
    })
    response.raise_for_status()
    return response.json()["response"].strip()


def call_ollama_json(prompt):
    raw = call_ollama(prompt)
    return "[{" + raw  # reattach the primer

def call_ollama_validate(prompt):
    raw = call_ollama(prompt)
    return clean_json_response(raw)

@app.route('/generate', methods=['POST'])
def generate():
    validated = None
    try:
        text = request.json.get('text', '')

        summary = call_ollama(AGENT1_PROMPT.format(text=text[:8000]))
        print("Summary complete:", len(summary))

        raw_json = call_ollama_json(AGENT2_PROMPT.format(text=summary))
        print("JSON complete:", raw_json[:30] + '...')

        validated = call_ollama_validate(AGENT3_PROMPT.format(text=raw_json))
        print("Validation complete:", validated[:30] + '...')

        parsed = json.loads(validated)
        return jsonify(parsed)

    except json.JSONDecodeError:
        print("Failed to parse:", validated)
        return jsonify({'error': 'Model did not return valid JSON', 'raw': validated}), 500
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=5050)
