var rapi = {
    respond: function (answers, callback) {
        $.ajax({
            type: 'POST',
            url: rapi.yolandaUrl + '/' + rapi.sessionID + "/response",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({answers:answers}),
            success: function (data, status) {
                callback(null, data);
            },
            error: function (data, status) {
                console.error(data);
                callback(data);
            }
        });
    },
    query: function(query, callback) {
        $.ajax({
            type: 'POST',
            url: rapi.yolandaUrl + '/' + rapi.sessionID + "/query",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(query),
            success: function (data, status) {
                console.log('data', data);
                callback(null, data);
            },
            error: function (data, status) {
                console.error(data);
                callback(data);
            }
        });
    },
    getAgentConfig: function(url, callback) {
        $.ajax({
            type: 'GET',
            url: url,
            success: function (agent) {
                rapi.showEvidence = agent.showEvidence;
                callback(null, agent);
            },
            error: function (data, status) {
                callback(data);
            }
        });
    },
    getSessionID: function(url, callback) {
        $.ajax({
            type: 'GET',
            url: url,
            success: function (data) {
                rapi.sessionID = data.sessionId;
                callback(null, data);
            },
            error: function (data) {
                callback(data);
            }
        });
    },
    setYolandaURL: function(url) {
        rapi.yolandaUrl = url;
    },
    sessionID: '',
    yolandaUrl: '',
    showEvidence: false,
    currentGoal: null
};
