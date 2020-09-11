const express = require('express');
const app = express();
const path = require('path');
const request = require('superagent');

//Proxies 'Evidence Tree' request to the Rainbird Community environment
app.get('/applications/components/rainbird-analysis-ui/:whyAnalysis', function (
  req,
  res
) {
  res.redirect('https://test-api.rainbird.ai' + req.originalUrl);
});

app.use('/components', express.static(path.join(__dirname, 'components')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/applications', express.static(path.join(__dirname, 'dist')));

app.set('views', __dirname);
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  //Contains a demo agent id
  return res.render('agent', {
    id: '01654c11-a842-4b1e-ad98-b20c348fd947',
    api: 'https://test-api.rainbird.ai',
    syncToken: undefined,
    engine: 'Experimental (Beta)',
    displayMode: 'slim',
  });
});

//Proxies 'config' request to the Rainbird Test environment
app.get('/agent/:id/config', function (req, res) {
  request
    .get('https://test.rainbird.ai/agent/' + req.params.id + '/config')
    .end(function (err, response) {
      res.send(response.body);
    });
  });
  
  //Proxies 'start' request to the Rainbird Test environment
  app.get('/agent/:id/start/contextId', function (req, res) {
    const headers = {};
    const engine = req.headers['x-rainbird-engine'];
    if (engine !== undefined) headers['x-rainbird-engine'] = engine;
    request
    .get('https://test.rainbird.ai/agent/' + req.params.id + '/start')
    .set(headers)
    .end(function (err, response) {
      res.send(response.body);
    });
});

app.listen(8080, function () {
  console.log('Web server started on port: 8080.');
  console.log(
    "To run example 'Speaks' goal, browse to: http://localhost:8080/"
  );
});
