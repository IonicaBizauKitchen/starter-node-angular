var mongoose = require('mongoose'),
    async = require('async'),
    extend = require('extend'),
    cm_data = mongoose.model('cm_data');
var json2csv = require('json2csv');
var fs = require('fs');


module.exports = function(app) {

// server routes =====query to add 2d locs
//    db.cm_data.find().forEach(function(doc) {
//        doc.loc = [doc.longitude, doc.latitude];
//        db.cm_data.save(doc);
//    });

    // server routes ===========================================================

    app.get('/query1', function(req, res){
        console.log("Query:" + JSON.stringify(req.query));
        console.time('one');
        async.waterfall([

            function(callback) {

                var diff = 5 * 60 * 1000; //5 minutes
                var queryEndTimestamp = new Date(req.query.end);
                var periods = [];
                var records = [];
                var start = new Date(req.query.start);
                var end =new Date(start.getTime() ) ;
                while(queryEndTimestamp.getTime() >=  start.getTime() + diff ){

                    periods.push({start : new Date(start), end : end, records: records});
                    end = new Date (end.setTime(end.getTime() + diff));
                    start = new Date (start.setTime((start.getTime() + diff)));
                }

                var fieldsToSearch = {}, limit = 1, skip = 0,  sort = '_created_at', sortType= -1;
                var sortQ = {};
                sortQ[sort] = sortType;

                fieldsToSearch._p_user = req.query.user;

                async.forEachOfSeries(periods, function (period, i, foreachcallback) {
                    fieldsToSearch._created_at = {'$gte': new Date(period.start), '$lt': new Date(period.end)};
                    var fields = "_p_user longitude latitude battery model version accuracy confidence activity -_id";
                    var prevData = [];

                    cm_data.find(fieldsToSearch, fields,{
                            skip: skip,
                            limit: limit,
                            sort:sortQ
                        },
                        function(err, data){
                            if (err){
                                console.log(err);
                                return foreachcallback(err);
                            }
                            if(data.length>0){
//                                console.log(JSON.stringify(data));
                                records.push({start: period.start, end:period.end, data: data[0]});
                            }else{
                                console.log("No data for this range starting: "+period.start+", using data from previous range.");
                                records.push({start: period.start, end:period.end, data: prevData[0]});
                            }
                            prevData = data;

                            foreachcallback();


                        });

                }, function (err) {
                    if (err)
                        console.error(err.message);
                    // configs is now a map of JSON data
                    callback(null, records);
                });

            },function(initialusers, callback) {
//                console.log("Initial User: " +JSON.stringify(initialusers));

                var fieldsToSearch = {}, limit = 50, skip = 0,  sort = '_created_at', sortType= -1;
                fieldsToSearch._p_user = {'$ne': req.query.user};
                var results = [];
                var maxDistance = parseInt(req.query.distance)/6371;
                var sortQ = {};
                sortQ[sort] = sortType;

                async.forEachOfSeries(initialusers, function (record, i, foreachcallback) {
                    var user = record.data;
//                    console.log("user : " + record.data);
                    var coords = [];
                    coords[0] = user.longitude;
                    coords[1] = user.latitude;
                    fieldsToSearch.loc = {
                        $near: coords,
                        $maxDistance: maxDistance
                    };
                    fieldsToSearch._created_at = {'$gte': new Date(record.start), '$lt': new Date(record.end)};
                    var fields = "_p_user longitude latitude battery model version accuracy confidence activity -_id";
                    console.log(fieldsToSearch);


                    cm_data.find(fieldsToSearch, fields,{
                            skip: skip,
                            limit: limit,
                            sort:sortQ
                        },
                        function(err, data){
                            if (err){
                                console.log(err);
                                return foreachcallback(err);
                            }

//                            console.log(JSON.stringify(data));
                            var current = [];
                            data.forEach(function(thisuser){
//                                console.log(JSON.stringify(thisuser));
                                var usrObj = {
                                    start: record.start,
                                    end: record.end,
                                    queryUserId: user._p_user,
                                    queryUserLong: user.longitude,
                                    queryUserLat: user.latitude,
                                    queryUserBattery: user.battery,
                                    queryUserModel: user.model,
                                    queryUserVersion: user.version,
                                    queryUserAccuracy: user.accuracy,
                                    queryUserConfidence: user.confidence,
                                    queryUserActivity: user.activity,
                                    userId: thisuser._p_user,
                                    userLong: thisuser.longitude,
                                    userLat: thisuser.latitude,
                                    userBattery: thisuser.battery,
                                    userModel: thisuser.model,
                                    userVersion: thisuser.version,
                                    userAccuracy: thisuser.accuracy,
                                    userConfidence: thisuser.confidence,
                                    userActivity: thisuser.activity
                                };
//                                var times = {start: record.start, end : record.end};
//                                extend(true, thisuser, usrObj, times);
//                                console.log(JSON.stringify(usrObj));
//                                console.log(JSON.stringify(times));
//                                console.log(JSON.stringify(usrObj));
                                current.push(usrObj);

                            });


                            results = results.concat(current);

                            foreachcallback();


                        });

                }, function (err) {
                    if (err)
                        console.error(err.message);
                    // configs is now a map of JSON data
                    callback(null, results);
                });

            }//,
//            function(unfilteredusers, callback) {
//                // arg1 now equals 'three'
//
//                callback(null, 'done');
//            }
        ], function (err, result) {
            if(err){
                res.send(500,err);
            }else{
                var fieldNames = ['Time Stamp',
                    'Query UserID',
                    'Longitude',
                    'Latitude',
                    'Battery',
                    'Model',
                    'Version',
                    'Accuracy',
                    'Confidence',
                    'Activity',
                    'Contact UserID',
                    'Longitude',
                    'Latitude',
                    'Battery',
                    'Model',
                    'Version',
                    'Accuracy',
                    'Confidence',
                    'Activity'];
                var fields = ['end',
                    'queryUserId',
                    'queryUserLong',
                    'queryUserLat',
                    'queryUserBattery',
                    'queryUserModel',
                    'queryUserVersion',
                    'queryUserAccuracy',
                    'queryUserConfidence',
                    'queryUserActivity',
                    'userId',
                    'userLong',
                    'userLat',
                    'userBattery',
                    'userModel',
                    'userVersion',
                    'userAccuracy',
                    'userConfidence',
                    'userActivity'];
                json2csv({ data: result, fields: fields, fieldNames: fieldNames, quotes: '' }, function(err, csv) {
                    if (err) console.log(err);
                    fs.writeFile('public/file.csv', csv, function(err) {
                        if (err) throw err;
                        console.log('file saved');
                    });
                });
                console.timeEnd('one');
                console.log("Final count: " + result.length);
                res.json(result);
            }
        });







    });

    app.get('/query2', function(req, res){
        console.log("Query:" + JSON.stringify(req.query));
        async.waterfall([

            function(callback) {

                var diff = 5 * 60 * 1000; //5 minutes
                var queryEndTimestamp = new Date(req.query.end);
                var periods = [];
                var records = [];
                var start = new Date(req.query.start);
                var end =new Date(start.getTime() ) ;
                while(queryEndTimestamp.getTime() >=  start.getTime() + diff ){

                    periods.push({start : new Date(start), end : end, records: records});
                    end = new Date (end.setTime(end.getTime() + diff));
                    start = new Date (start.setTime((start.getTime() + diff)));
                }

                var fieldsToSearch = {}, limit = 1, skip = 0,  sort = '_created_at', sortType= -1;
                var sortQ = {};
                sortQ[sort] = sortType;

//                fieldsToSearch._p_user = req.query.user;

                async.forEachOfSeries(periods, function (period, i, foreachcallback) {
                    fieldsToSearch._created_at = {'$gte': new Date(period.start), '$lt': new Date(period.end)};
                    var fields = "_p_user longitude latitude battery model version accuracy confidence activity -_id";
                    var prevData = [];

                    cm_data.find(fieldsToSearch, fields,{
                            skip: skip,
                            limit: limit,
                            sort:sortQ
                        },
                        function(err, data){
                            if (err){
                                console.log(err);
                                return foreachcallback(err);
                            }
                            if(data.length>0){
//                                console.log(JSON.stringify(data));
                                records.push({start: period.start, end:period.end, data: data[0]});
                            }else{
                                console.log("No data for this range starting: "+period.start+", using data from previous range.");
                                records.push({start: period.start, end:period.end, data: prevData[0]});
                            }
                            prevData = data;

                            foreachcallback();


                        });

                }, function (err) {
                    if (err)
                        console.error(err.message);
                    // configs is now a map of JSON data
                    callback(null, records);
                });

            },function(initialusers, callback) {
//                console.log("Initial User: " +JSON.stringify(initialusers));

                var fieldsToSearch = {}, limit = 50, skip = 0,  sort = '_created_at', sortType= -1;

                var results = [];
                var maxDistance = parseInt(req.query.distance)/6371;
                var sortQ = {};
                sortQ[sort] = sortType;

                async.forEachOfSeries(initialusers, function (record, i, foreachcallback) {
                    var user = record.data;
//                    console.log("user : " + record.data);
                    var coords = [];
                    coords[0] = user.longitude;
                    coords[1] = user.latitude;
                    fieldsToSearch.loc = {
                        $near: coords,
                        $maxDistance: maxDistance
                    };
                    fieldsToSearch._p_user = {'$ne': user._p_user};
                    fieldsToSearch._created_at = {'$gte': new Date(record.start), '$lt': new Date(record.end)};
                    var fields = "_p_user longitude latitude battery model version accuracy confidence activity -_id";


                    cm_data.find(fieldsToSearch, fields,{
                            skip: skip,
                            limit: limit,
                            sort:sortQ
                        },
                        function(err, data){
                            if (err){
                                console.log(err);
                                return foreachcallback(err);
                            }

//                            console.log(JSON.stringify(data));
                            var current = [];
                            data.forEach(function(thisuser){
//                                console.log(JSON.stringify(thisuser));
                                var usrObj = {
                                    start: record.start,
                                    end: record.end,
                                    queryUserId: user._p_user,
                                    queryUserLong: user.longitude,
                                    queryUserLat: user.latitude,
                                    queryUserBattery: user.battery,
                                    queryUserModel: user.model,
                                    queryUserVersion: user.version,
                                    queryUserAccuracy: user.accuracy,
                                    queryUserConfidence: user.confidence,
                                    queryUserActivity: user.activity,
                                    userId: thisuser._p_user,
                                    userLong: thisuser.longitude,
                                    userLat: thisuser.latitude,
                                    userBattery: thisuser.battery,
                                    userModel: thisuser.model,
                                    userVersion: thisuser.version,
                                    userAccuracy: thisuser.accuracy,
                                    userConfidence: thisuser.confidence,
                                    userActivity: thisuser.activity
                                };
//                                var times = {start: record.start, end : record.end};
//                                extend(true, thisuser, usrObj, times);
//                                console.log(JSON.stringify(usrObj));
//                                console.log(JSON.stringify(times));
//                                console.log(JSON.stringify(usrObj));
                                current.push(usrObj);

                            });


                            results = results.concat(current);

                            foreachcallback();


                        });

                }, function (err) {
                    if (err)
                        console.error(err.message);
                    // configs is now a map of JSON data
                    callback(null, results);
                });

            }//,
//            function(unfilteredusers, callback) {
//                // arg1 now equals 'three'
//
//                callback(null, 'done');
//            }
        ], function (err, result) {
            if(err){
                res.send(500,err);
            }else{
                var fieldNames = ['Time Stamp',
                    'Query UserID',
                    'Longitude',
                    'Latitude',
                    'Battery',
                    'Model',
                    'Version',
                    'Accuracy',
                    'Confidence',
                    'Activity',
                    'Contact UserID',
                    'Longitude',
                    'Latitude',
                    'Battery',
                    'Model',
                    'Version',
                    'Accuracy',
                    'Confidence',
                    'Activity'];
                var fields = ['end',
                    'queryUserId',
                    'queryUserLong',
                    'queryUserLat',
                    'queryUserBattery',
                    'queryUserModel',
                    'queryUserVersion',
                    'queryUserAccuracy',
                    'queryUserConfidence',
                    'queryUserActivity',
                    'userId',
                    'userLong',
                    'userLat',
                    'userBattery',
                    'userModel',
                    'userVersion',
                    'userAccuracy',
                    'userConfidence',
                    'userActivity'];
                json2csv({ data: result, fields: fields, fieldNames: fieldNames, quotes: '' }, function(err, csv) {
                    if (err) console.log(err);
                    fs.writeFile('public/file2.csv', csv, function(err) {
                        if (err) throw err;
                        console.log('file saved');
                    });
                });

                console.log("Final count: " + result.length);
                res.json(result);
            }
        });







    });

    app.get('*', function(req, res) {
        res.sendfile('./public/index.html');
    });

};