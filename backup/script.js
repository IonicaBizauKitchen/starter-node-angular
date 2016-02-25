/**
 * Created by root on 2/26/16.
 */

use nodenigeria;
db.cm_data.find().forEach(function(doc) {
    doc.loc = [doc.longitude, doc.latitude];
    db.cm_data.save(doc);
});