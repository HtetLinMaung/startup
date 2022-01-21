const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const docker = require("../utils/docker");
const githelper = require("../utils/git");
const { SERVER_ERROR, OK } = require("../constants/response-constants");
const app = require("../app");
const router = express.Router();
const { createProxyMiddleware } = require("http-proxy-middleware");

const buildContainer = ({ git, version, tag, app }, cb = () => {}) => {
  const gitarrs = git.split("/");
  const foldername = gitarrs[gitarrs.length - 1].replace(".git", "");
  const folderpath = path.join(__dirname, "..", "applications", foldername);
  fs.rm(folderpath, { recursive: true, force: true }, (err) => {
    if (err) {
      console.log(err);
      return cb(err, null);
    }
    githelper.clone("applications", git, (err) => {
      if (err) {
        console.log(err.message);
        return cb(err, null);
      }
      let dockerfile_contents = "";
      if (app == "node") {
        dockerfile_contents = `FROM node:${version || "latest"}

        WORKDIR /app

        COPY package.json .
        
        RUN npm i
        
        COPY . .
        
        CMD [ "npm", "start" ]`;
      }

      fs.writeFile(
        path.join(folderpath, "Dockerfile"),
        dockerfile_contents,
        "utf-8",
        (err) => {
          if (err) {
            console.log(err);
            return cb(err, null);
          }

          docker.build(`applications/${foldername}`, tag, (err) => {
            if (err) {
              return cb(err, null);
            }
            cb(null, tag);
          });
        }
      );
    });
  });
};

router.post("/test-cmd", (req, res) => {
  exec(`docker login`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(` ${stderr}`);
    }
    if (stdout) {
      console.log(`${stdout}`);
    }
  });
  res.json({ message: "ok" });
});

router.post("/build-image", async (req, res) => {
  buildContainer(req.body, (err, tag) => {
    let message = "success";
    let code = 200;
    let image = "";
    if (err) {
      message = err.message;
    } else {
      image = tag;
    }

    res.json({ code, message, image });
  });
});

router.post("/push-image", (req, res) => {
  docker.login(req.body.userid, req.body.password, (err) => {
    if (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
    docker.push(req.body.image, (err) => {
      if (err) {
        return res.status(500).json({ code: 500, message: err.message });
      }
      res.json({ code: 200, message: "push successful" });
    });
  });
});

router.post("/deploy", (req, res) => {
  buildContainer(req.body, (err, image) => {
    if (err) {
      return res.status(SERVER_ERROR.code).json(SERVER_ERROR);
    }
    try {
      docker.remove(req.body.containername, () => {
        docker.run(
          image,
          req.body.containername,
          `-d ${req.body.port ? `-p ${req.body.port}` : ""}`,
          (err) => {
            if (err) {
              return res.status(SERVER_ERROR.code).json(SERVER_ERROR);
            }
            app.use(
              `/${req.body.containername}`,
              createProxyMiddleware({
                target: `http://localhost:${req.body.port.split(":")[0]}`,
                changeOrigin: true,
              })
            );
            res.json({ ...OK, message: "deploy successful" });
          }
        );
      });
    } catch (err) {
      docker.run(
        image,
        req.body.containername,
        `-d -p ${req.body.port}`,
        (err) => {
          if (err) {
            return res.status(SERVER_ERROR.code).json(SERVER_ERROR);
          }
          res.json({ ...OK, message: "deploy successful" });
        }
      );
    }
  });
});

module.exports = router;
