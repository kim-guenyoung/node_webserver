const url = require('url');

const {URL} = url;
const myURL = new URL("ttps://blog.naver.com/bl00nomars");

console.log('new URL(): ', myURL);
console.log('url.format(): ', url.format(myURL));
console.log("---------------------");
const parsedUrl = url.parse("https://blog.naver.com/bl00nomars");
console.log('url.parse(): ', parsedUrl);
console.log('url.format(): ', url.format(parsedUrl));