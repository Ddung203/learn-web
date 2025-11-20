# chocolearn-api

```bash
docker buildx create --use
docker buildx inspect --bootstrap
```

```bash
docker buildx build --platform linux/amd64 -t ddung203/choco-learn:v3-amd64 --push .
```

```bash
docker run --name chocolearn -p 8081:8080 -d --env-file /root/choco-learn/.env ddung203/choco-learn:v3-amd64
```

```bash
curl https://chocolearn-api.ddung203.id.vn/health
```
