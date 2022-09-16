var bcrypt = require('bcrypt');


function generateHashes(registerCode, accessCode) {
    var saltRounds = 10;

    // generate registration code hash
    bcrypt.hash(registerCode, saltRounds, function (err, hash) {
        console.log(hash);
    });
    
    // generate access code hash
    bcrypt.hash(accessCode, saltRounds, function (err, hash) {
        console.log(hash);
    });
}

generateHashes(process.argv[2], process.argv[3]);
