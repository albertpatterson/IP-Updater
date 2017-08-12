const cp = require('child_process');


new Promise((res, rej)=>{
    let ipFetch = cp.execFile("dig",["+short", "myip.opendns.com", "@resolver1.opendns.com"])
    ipFetch.stdout.on("data", res);
    ipFetch.stderr.on("data", rej);
    ipFetch.on("close", c=>console.log('dig done, code: ', c))
})
.then((data)=>{
    console.log("ip="+data);
    return new Promise((res, rej)=>{
        let statFetch = cp.execFile("git",["status"])
        statFetch.stdout.on("data", res);
        statFetch.stderr.on("data", rej);
        statFetch.on("close", c=>console.log('git status done, code: ', c))
    })
})
.then((data)=>{
    console.log("status="+data);
})
.catch((err)=>{
    console.log("err="+err);
})