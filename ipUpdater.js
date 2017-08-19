module.exports = {
    /**
     * update the IP address shown in a file on github, such as a readme
     * 
     * @param {string} filePath 
     * @returns Promise<>
     */
    updateIpOnGitHub: function(filePath){
        
        // compare the ip in the file to the current one and update the file if ips are different
        return compareAndUpdateFile(filePath)
        // push the updated file to github if it was changed
        .then(updated => {
            if(updated){
                pushUpdateToGitHub();
            }else{
                console.log('ip address not updated')
            }
        })
        .then(()=>console.log("operation complete"))
        .catch(console.log)
    }
}

const cp = require('child_process');
const fs = require("fs");

// regular eexpression to match an ip address that is part of a url in a file
const ipRegExp = /\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;

/**
 * compare the current IP to the IP in the file and update the file if needed
 * 
 * @returns {Promise<Boolean>} promise resolved with a boolean indicating if the file was updated
 */
function compareAndUpdateFile(filePath){

    // fetch the current IP
    let fetchIPProm = new Promise((res, rej)=>{
        let ipFetch = cp.execFile("dig",["+short", "myip.opendns.com", "@resolver1.opendns.com"])
        ipFetch.stdout.on("data", ip=>res(ip.trim()));
        ipFetch.stderr.on("data", rej);
        ipFetch.on("close", c=>console.log('dig done, code: ', c))
    });
    
    // get the text from the file containing the IP
    let readFileProm = new Promise((res, rej)=>{
        fs.readFile(filePath, 'utf8', (err, conts)=>{
            err ? rej(err) : res(conts);
        });
    });

   return Promise.all([fetchIPProm, readFileProm])
    .then(ipAndOldConts=>{
        // compare the current IP to that in the file and update the file contents if needed

        let [ip, oldConts] = ipAndOldConts;
        console.log('current ip: '+ ip);

        let ipMatch = oldConts.match(ipRegExp);
        
        if(!ipMatch){
            throw new Error("No IP found in file");
        }

        let ipInFile = ipMatch[0].slice(2);
        console.log('ip found in file: '+ ipInFile);

        return new Promise((res, rej)=>{
            if(ipInFile !== ip){
                // update the file contents if the ips do not match
                let newConts = oldConts.replace(ipRegExp, '//'+ip);
                fs.writeFile(filePath, newConts, (err, data)=>{
                    err ? rej(err) : res(true);
                })
            }else{
                // resolve immediately if no update is required
                res(false);
            }
        })
    })
}


/**
 * push the changes to the file to gitHub if needed
 * 
 * @returns 
 */
function pushUpdateToGitHub(){
    
    return new Promise((res, rej)=>{
        // add all changes to staging area

        let add = cp.execFile("git",["add", "."])
        add.stdout.on("data", d=>console.log('add data: ', d))
        add.stderr.on("data", rej);
        add.on("close", c=>{
            console.log('git add done, code: ', c);
            if(c===0) res();
        })
    })
    .then(()=>{
        // commit changes

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
        // push all changes to github

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
    });
} 