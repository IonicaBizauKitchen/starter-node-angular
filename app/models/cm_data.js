// grab the mongoose module
var mongoose = require('mongoose');
    require('mongoose-long')(mongoose);

var SchemaTypes = mongoose.Schema.Types;

// define our nerd model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('cm_data', {
    _id : {type : String},
    version : {type : String},
    battery : {type : SchemaTypes.Long},
    confidence : {type : SchemaTypes.Long},
    _rperm:[],
    longitude: {type: Number},
    _acl : {
        "*" : {
            r: {type: Boolean}

        }
    },
    _wperm: [],
    "accuracy" : {type : SchemaTypes.Long},
    "latitude" : {type: Number},
    "_created_at" : {type: Date},
    "_updated_at" : {type: Date},
    "model" : {type : String},
    "_p_user" : {type : String},
    "activity" : {type : String},
    loc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
    }

}, 'cm_data');
