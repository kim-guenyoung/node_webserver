const {odd, even} = require('./var');
const checkNumber = require('./func');

//os랑 path는 import느낌으로 항상 쓰는 것

const os = require('os');
const path = require('path');
// const fs = require('fs');
const fs = require('fs').promises;


fs.readFile('./readme.txt', (err, data) => {
    if(err){
        throw err;
    }
    console.log(data.toString());
})

fs.writeFile('./readme.txt', '읽었습니다!')
    .then(() => {
        return fs.readFile('./readme.txt')
    })
    .then((data) =>{
        console.log(data.toString());
    })
    .catch((err) =>{
        console.log(err);
    })

function checkStringOddOrEven(str){
    if(str.length %2){
        return odd;
    }
    else{
        return even;
    }
}

console.log(checkNumber(10000));
console.log(checkStringOddOrEven("helloo"));