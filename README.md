# Web-FIK

node.js server with ejs template that shows balloon informations (Now mock data). The apiKey and ttnEndpoint is in file config.json and that file is in gitignore. So you must make that by yourself. Example:
```json
 {
    "ttnEndpoint": "https://example-things-network.com",
    "apiKey": "your_api_key_here"
  }
  ```

Start server with:
```bash
node index.js
```

Necessery to have:
```bash
npm install express ejs
npm install express axios
npm install express fs
```

- [node.js](https://nodejs.org/en)
- [EJS](https://ejs.co/)
- [fs](https://nodejs.org/api/fs.html)