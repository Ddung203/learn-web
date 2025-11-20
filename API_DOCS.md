## API Endpoints

### Public Endpoints

#### GET /api/v1/voices

List available English voices.

```bash
curl https://unvicarious-laronda-impeccably.ngrok-free.dev/api/v1/voices
```

Response:

```json
[
  {
    "id": "larynx:mary_ann-glow_tts",
    "name": "mary_ann-glow_tts",
    "engine": "larynx",
    "gender": "F"
  }
]
```

#### GET /api/v1/tts

Generate speech from text with voice selection.

Parameters:

- `text` (required): Text to convert (max 100 chars, alphanumeric + spaces/punctuation)
- `voice` (required): Voice ID from `/voices` endpoint

```bash
curl "https://unvicarious-laronda-impeccably.ngrok-free.dev/api/v1/tts?text=Hello%20world&voice=larynx:mary_ann-glow_tts" \
  --output speech.wav
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>TTS Preview</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
      }
      input,
      select,
      button {
        padding: 10px;
        font-size: 16px;
        margin: 5px 0;
      }
      input {
        width: 100%;
        box-sizing: border-box;
      }
      select {
        width: 100%;
      }
      button {
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        width: 100%;
      }
      button:hover {
        background: #0056b3;
      }
      audio {
        width: 100%;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <input
      type="text"
      id="text"
      placeholder="Enter text (max 100 chars)"
      maxlength="100"
    />
    <select id="voice"></select>
    <button onclick="preview()">Preview</button>
    <audio
      id="audio"
      controls
      crossorigin="anonymous"
    ></audio>
    <script>
      const API =
        'https://unvicarious-laronda-impeccably.ngrok-free.dev/api/v1';

      fetch(`${API}/voices`, { headers: { 'ngrok-skip-browser-warning': '1' } })
        .then((r) => r.json())
        .then((voices) => {
          const select = document.getElementById('voice');
          voices.forEach((v) => {
            const opt = document.createElement('option');
            opt.value = v.id;
            opt.textContent = `${v.name} (${v.engine})`;
            select.appendChild(opt);
          });
        });

      async function preview() {
        const text = document.getElementById('text').value.trim();
        const voice = document.getElementById('voice').value;
        if (!text || !voice) return;

        const audio = document.getElementById('audio');

        // build URL with params
        const url = `${API}/tts?text=${encodeURIComponent(
          text
        )}&voice=${encodeURIComponent(voice)}`;

        try {
          const res = await fetch(url, {
            headers: { 'ngrok-skip-browser-warning': '1' },
          });

          if (!res.ok) {
            const txt = await res.text();
            console.error('TTS error', res.status, txt);
            alert('TTS request failed: ' + res.status);
            return;
          }

          // verify content-type roughly
          const ct = res.headers.get('Content-Type') || '';
          if (!ct.includes('audio')) {
            const txt = await res.text();
            console.error('unexpected response (not audio):', ct, txt);
            alert('Server did not return audio.');
            return;
          }

          const blob = await res.blob();
          // revoke previous objectURL to avoid memory leak
          if (audio._objUrl) {
            URL.revokeObjectURL(audio._objUrl);
          }
          const objUrl = URL.createObjectURL(blob);
          audio._objUrl = objUrl;
          audio.src = objUrl;
          audio.play().catch((e) => {
            console.warn('play() rejected', e);
          });
        } catch (err) {
          console.error('fetch failed', err);
          alert('Network error: ' + err.message);
        }
      }
    </script>
  </body>
</html>
```
