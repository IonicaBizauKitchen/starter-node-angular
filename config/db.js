var mongolaburl = '';
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development'){
    mongolaburl = 'mongodb://localhost/nodenigeria';

}
else {
    console.log(process.env.MONGOURL);
    mongolaburl = process.env.MONGOURL;
};

module.exports = {
	url : mongolaburl
}
