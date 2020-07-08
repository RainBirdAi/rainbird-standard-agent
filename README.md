# Rainbird Standard Agent

The Rainbird Standard Agent is an 'agent' implementation for use with [Rainbird](https://rainbird.ai/), supporting interactions and displaying the end result/results.

This repository can be used as a starting point for your own UI implementation.  It contains front-end code and a supporting backend server which can be used to quickly have a look at the standard agent without having to serve the code in your own application.

Rainbird is an AI-powered cognitive reasoning engine that enables companies to automate complex decision-making at scale.

## Getting Started

To see how the standard agent looks and to run an interaction against a basic knowledge map, please install the following pre-requisites and run the steps below:

### Pre-requisites

```
node
npm
bower
gulp
```

### Install and startup

```
npm install
bower install
gulp build
node server.js
```

An interaction against an example knowledge map should be accessible on localhost:

http://localhost:8080/

When the agent loads, a list of configured 'goals' will be displayed.  The example agent contains a single 'speaks' goal which can be run by clicking on the 'speaks' button.  The agent should then support a basic interaction between the user and Rainbird until an answer is reached.

## Project Layout

### Front end

The front-end code is an Angular 1 application located in the ./source directory.  The agent.js file contains a 'rbAgent' module which is loaded by the agent.ejs file if running the server component.  On application load, a request is made to the Rainbird configuration URL to retrieve the agent's configuration and the initial webpage displaying a list of available 'goals' is displayed.  

The functionality of the agent itself which includes preparing questions for display and submitting user's answers is found in ./source/tryGoal/component/tryGoalController.js.  Communication with the Rainbird API is carried out using source/tryGoal/tryGoal_service.js.  

Third party components which are being used include bootstrap and ng-showdown.

### Back end

A basic back end has been included which can be used to quickly serve the front end code.  The included web server proxies some requests made on localhost by the existing code to the Rainbird Community environment.  

When creating your own implementation, you will need to retrieve the appropriate agent id from the Rainbird configuration portal, the URLs of the configuration portal itself and the Rainbird API for the appropriate environment that you are connecting to.

## Resources

* [Rainbird API documentation](https://rainbird-ai.gitlab.io/rainbird-docs/)
