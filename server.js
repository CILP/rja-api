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

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// TODO: PUT, DELETE
const setEndpoint = (key) => {
    const resource = configFile[key];

    if (!resource.data && resource.dataUrl){
        resource.data = JSON.parse(fs.readFileSync(resource.dataUrl, 'utf8'));
    }

    if (resource.verb){
        resource.verb.forEach((httpMethod) => {

            const lcHttp = httpMethod.toLowerCase();

            if (lcHttp === 'post'){
                app[lcHttp](`/${key.toLowerCase()}`, (req, res) => {
                    resource.data.push(req.body);
                    res.json({status: 'success'});
                });
            } else if (lcHttp === 'get'){
                app[lcHttp](`/${key.toLowerCase()}`, (req, res) => {
                    res.json(resource.data);
                });
            } else if (lcHttp === 'delete'){

                app[lcHttp](`/${key.toLowerCase()}/:id`, (req, res) => {

                    const id = req.params.id ? +req.params.id : null;

                    if (id){
                        const deleted = resource.data.find(r => r.id === id);

                        if (deleted){
                            resource.data = resource.data.filter(r => r.id !== id);
                            res.json(deleted);
                        }
                    }
                });

                app[lcHttp](`/${key.toLowerCase()}`, (req, res) => {
                    resource.data = [];
                    res.json(resource.data);
                });
            }
        });
    } else {
        app.get(`/${key.toLowerCase()}`, (req, res) => {
            res.json(resource.data);
        });
    }
};

Object.keys(configFile).forEach(setEndpoint);

app.listen(rjaConfig.port, () => {
    console.info(`Server is runnig at port: ${rjaConfig.port}`);
});