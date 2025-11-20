## curl

```bash
curl --location 'https://api.dictionaryapi.dev/api/v2/entries/en/word'
```

## success response

```json
[
  {
    "word": "word",
    "phonetic": "/wɜːd/"
  }
]
```

## fail response

```json
{
  "title": "No Definitions Found",
  "message": "Sorry pal, we couldn't find definitions for the word you were looking for.",
  "resolution": "You can try the search again at later time or head to the web instead."
}
```
