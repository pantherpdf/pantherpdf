# Reports

## Docker building
```sh
docker build -t reports-1 .
```

## Test html -> pdf
- Make container from image.
- Set eg: local host port: 7000, Host path: /Users/ibanic/projects/reports/worker, Container path: /app.
- Send empty POST request to http://localhost:7000/apiv1/convert
