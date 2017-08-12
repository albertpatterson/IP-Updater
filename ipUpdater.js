const cp = require('child_process');
const fs = require("fs");

const iplog = "./iplog.txt";

new Promise((res, rej)=>{
    let ipFetch = cp.execFile("dig",["+short", "myip.opendns.com", "@resolver1.opendns.com"])
    ipFetch.stdout.on("data", res);
    ipFetch.stderr.on("data", rej);
    ipFetch.on("close", c=>console.log('dig done, code: ', c))
})
.then(ip=>{
    console.log("update IP in log to: ", ip);
    return new Promise((res, rej)=>{
        fs.writeFile(iplog, ip, err=>{err ? rej(err): res() })
    });
})
.then(()=>{
    console.log("git status");
    return new Promise((res, rej)=>{
        let statFetch = cp.execFile("git",["status"])
        statFetch.stdout.on("data", res);
        statFetch.stderr.on("data", rej);
        statFetch.on("close", c=>console.log('git status done, code: ', c))
    })
})
.then(status=>{
    console.log("status="+status);
})
.catch((err)=>{
    console.log("err="+err);
})