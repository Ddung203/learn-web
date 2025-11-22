# Mimic3 TTS Wrapper

## API Endpoints

BaseURL: https://tts.ddung203.id.vn

### Health Check

```bash
GET /health
```

Response:

```json
{
  "status": "ok",
  "mimic3": "ok",
  "voices_count": 5
}
```

### Lấy danh sách voices

```bash
GET /api/v1/voices
```

Response

```json
[
  {
    "description": "Default UK English voice",
    "key": "en_UK/apope_low",
    "language": "en_UK",
    "language_native": "English (UK)",
    "name": "Andrew"
  },
  {
    "description": "",
    "key": "en_US/m-ailabs_low",
    "language": "en_US",
    "language_native": "English (US)",
    "name": "Miner"
  },
  {
    "description": "",
    "key": "en_US/m-ailabs_low#judy_bieber",
    "language": "en_US",
    "language_native": "English (US)",
    "name": "Judy"
  },
  {
    "description": "",
    "key": "en_US/m-ailabs_low#mary_ann",
    "language": "en_US",
    "language_native": "English (US)",
    "name": "Mary"
  },
  {
    "description": "",
    "key": "en_US/ljspeech_low",
    "language": "en_US",
    "language_native": "English (US)",
    "name": "Lily"
  }
]
```

### Text to Speech

```bash
GET /api/v1/tts?text=Hello%20world&voice=en_UK/apope_low&length_scale=1.0
```

Query Parameters:

- `text` (required): Text to convert to speech
- `voice` (optional): Voice ID (default: `en_UK/apope_low`)
- `length_scale` (optional): Speech speed multiplier (default: `1.0`)

Returns: WAV audio file
