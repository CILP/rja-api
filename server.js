const express = require('express'),
      fs = require('fs'),
      bodyParser = require('body-parser'),
      app = express();

const rjaConfig = JSON.parse(fs.readFileSync('rja.config.json', 'utf8'));
const configFile = JSON.parse(fs.readFileSync('template.json', 'utf8'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

Object.keys(configFile).forEach((key) => {

    const resource = configFile[key];

    if (resource.verb){
        resource.verb.forEach((httpMethod) => {

            const lcHttp = httpMethod.toLowerCase();

            if (lcHttp === 'post'){
                app[lcHttp](`/${key.toLowerCase()}`, (req, res) => {
                    resource.data.push(req.body);
                    res.json({status: 'success'});
                });
            } else {
                app[lcHttp](`/${key.toLowerCase()}`, (req, res) => {
                    res.json(resource.data);
                });
            }
        });
    } else {
        app.get(`/${key.toLowerCase()}`, (req, res) => {
            res.json(resource.data);
        });
    }
});

app.listen(rjaConfig.port, () => {
    console.info(`Server is runnig at port: ${rjaConfig.port}`);
});