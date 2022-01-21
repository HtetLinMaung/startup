const { exec } = require("child_process");

module.exports = {
  login: (userid, password, cb = () => {}) => {
    return new Promise((resolve, reject) => {
      exec(
        `docker login -u ${userid} --password ${password}`,
        (error, stdout, stderr) => {
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
        }
      );
    });
  },
  remove: (containername, cb = () => {}) => {
    return new Promise((resolve, reject) => {
      exec(`docker rm -f ${containername}`, (error, stdout, stderr) => {
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
  run: (image, containername, options = "", cb = () => {}) => {
    return new Promise((resolve, reject) => {
      exec(
        `docker run ${options} --name ${containername} ${image}`,
        (error, stdout, stderr) => {
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
        }
      );
    });
  },
  push: (image, cb = () => {}) => {
    return new Promise((resolve, reject) => {
      exec(`docker push ${image}`, (error, stdout, stderr) => {
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
  build: (filepath, tag, cb = () => {}) => {
    return new Promise((resolve, reject) => {
      exec(
        `cd ${filepath} && docker build -t ${tag} .`,
        (error, stdout, stderr) => {
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
        }
      );
    });
  },
};
