const { exec } = require("child_process");

module.exports = {
  clone: (filepath, git, cb = () => {}) => {
    return new Promise((resolve, reject) => {
      exec(`cd ${filepath} && git clone ${git}`, (error, stdout, stderr) => {
        const messages = [];
        if (error) {
          reject(error);
          return cb(error, messages);
        }

        if (stderr) {
          console.log(stderr);
          messages.push(stderr);
        }
        if (stdout) {
          console.log(stdout);
          messages.push(stdout);
        }
        resolve(messages);
        cb(null, messages);
      });
    });
  },
};
