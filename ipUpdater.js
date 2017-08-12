const cp = require('child_process');
const fs = require("fs");

const iplog = "./iplog.txt";

let fetchIPProm = new Promise((res, rej)=>{
    let ipFetch = cp.execFile("dig",["+short", "myip.opendns.com", "@resolver1.opendns.com"])
    ipFetch.stdout.on("data", res);
    ipFetch.stderr.on("data", rej);
    ipFetch.on("close", c=>console.log('dig done, code: ', c))
});

let readFileProm = new Promise((res, rej)=>{
    fs.readFile(iplog, 'utf8', (err, conts)=>{
        err ? rej(err) : res(conts);
    });
});

Promise.all([fetchIPProm, readFileProm])
.then(ipAndoldConts=>{
    let [ip, oldConts] = ipAndoldConts;
    console.log("update IP in log to: ", ip);
    console.log("oldConts: ", oldConts);
    return new Promise((res, rej)=>{
        let newCont = oldConts + "\n" + new Date().toUTCString() + "\n" + ip;
        fs.writeFile(iplog, newCont, err=>{err ? rej(err): res() })
    });
})
.then(()=>{
    console.log("git add");
    return new Promise((res, rej)=>{
        let add = cp.execFile("git",["add", "."])
        add.stdout.on("data", d=>console.log('add data: ', d))
        add.stderr.on("data", rej);
        add.on("close", c=>{
            console.log('git add done, code: ', c);
            if(c===0) res();
        })
    })
})
.then(()=>{
    console.log("git commit");
    return new Promise((res, rej)=>{
        let commit = cp.execFile("git",["commit", "-m","\"updating IP\""])
        commit.stdout.on("data", d=>console.log('commit data: ', d))
        commit.stderr.on("data", rej);
        commit.on("close", c=>{
            console.log('git commit done, code: ', c);
            if(c===0) res();
        })
    })
})
.then(()=>{
    console.log("git push");
    return new Promise((res, rej)=>{
        let push = cp.execFile("git",["push"])
        push.stdout.on("data", d=>console.log('commit data: ', d));
        push.stderr.on("data", rej);
        push.on("close", c=>{
            console.log('git commit done, code: ', c);
            if(c===0) res();
        })
    })
})
.then(status=>{
    console.log("status="+status);
})
.catch((err)=>{
    console.log("err="+err);
})