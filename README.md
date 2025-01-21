# Web-FIK - set of tools for stratospheric baloons

![Control dashboard illustration](doc/img/Control_Dasboard_illustration.png)

## Overview
Web-FIK is a sophisticated toolkit for rapid visualization of data from stratospheric balloons, utilizing multiple communication channels, specifically SiK with MAVLINK packets and Lora TTN. It extracts data from the TTN network and from scripts in tracking vehicles that receive Sik packets (mavlink) using ISM02A or TFSIK modems. The data is immediately sent to a server, visualized, and forwarded to amateur.sondehub.org.

![Screenshot 2023-12-02 at 19-47-46 UJF](https://github.com/ODZ-UJF-AV-CR/Web-FIK/assets/5196729/13da7159-cbff-4126-8152-a9d6690a923d)


## Components

### Ground App (GAPP)
- **Technology**: Node.js web application.
- **Functionality**: Visualizes the status of components or experiments on a stratospheric balloon.
- **Details**: Uses ejs templates.

### Car Data Pump (CDP)
- **Technology**: Python3
- **Functionality**:
  - Receives mavlink data from SiK radio receivers.
  - Determines car location via GPSD.
  - Forwards data to GAPP and sondehub.
- **Implementation**: The `car` directory in the repository contains relevant code and setup details.

### LORA Data Pump (LDP)
- **Technology**: Python.
- **Functionality**:
  - Downloads packets from the Lora The things network.
  - Sends packets to the GAPP server and sondehub.org.


![image](https://github.com/user-attachments/assets/8dfd11a1-afeb-48da-ba00-321a28b19594)

---

# Aditional notes

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
