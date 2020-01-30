const express = require('express');
const app = express();
const path = require('path');
const request = require('superagent');

//Proxies 'Evidence Tree' request to the Rainbird Community environment
app.get('/applications/components/rainbird-analysis-ui/:whyAnalysis', function(req, res) {
    res.redirect('https://app.rainbird.ai' + req.originalUrl);
});

app.use('/components', express.static(path.join(__dirname, 'components')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/applications', express.static(path.join(__dirname, 'dist')));

app.set('views', __dirname);
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    //Contains a demo agent id
    return res.render('agent', {
        id: 'dbd8b876-56d6-4db0-acaa-0c250619e26d',
        api: 'https://api.rainbird.ai',
        syncToken: undefined,
    });
});

//Proxies 'config' request to the Rainbird Community environment
app.get('/agent/:id/config', function(req, res) {
    request.get('https://app.rainbird.ai/agent/' + req.params.id + '/config')
        .end(function (err, response){
            res.send(response.body);
        });
});

//Proxies 'start' request to the Rainbird Community environment
app.get('/agent/:id/start/contextId', function(req, res) {
    request.get('https://app.rainbird.ai/agent/' + req.params.id + '/start')
        .end(function (err, response){
            res.send(response.body);
        });
});

app.listen(8080, function() {
    console.log('Web server started on port: 8080.');
    console.log('To run example \'Speaks\' goal, browse to: http://localhost:8080/');
});
