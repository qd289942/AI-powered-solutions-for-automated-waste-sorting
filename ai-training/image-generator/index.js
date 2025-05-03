const https = require('node:https');
const express = require('express');
const multer  = require('multer')
const fs = require('fs');
const app = express();
const port = 3001;

var storage = multer.diskStorage(
    {
        destination: './images/',
        filename: function ( req, file, cb ) {

            cb( null, Date.now()+".jpg");
        }
    }
);
const upload = multer(storage)

const options = {
    key: fs.readFileSync("./secrets/server.key"),
    cert: fs.readFileSync("./secrets/server.crt"),
};
const httpsServer = https.createServer(options, app);

app.get('/', (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

app.post('/image', upload.single('image_file'), function (req, res, next) {
    console.log(req.file)
    fs.writeFileSync('./images/' + Date.now() + ".jpg", req.file.buffer)
    res.sendStatus(200)
})

httpsServer.listen(port, () => {
  console.log(`Example app listening at https://localhost:${port}`);
});