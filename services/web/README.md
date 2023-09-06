## Социальная сеть Otus

### Запуск приложения:
```bash
docker compose up -d
```
### Остановка приложения:
```bash
docker compose stop
```

### API

POST http://0.0.0.0:3000/user/register

POST http://0.0.0.0:3000/login

GET http://0.0.0.0:3000/user/get/:id