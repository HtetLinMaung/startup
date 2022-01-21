const express = require("express");
const fs = require("fs");
const path = require("path");
// const { exec } = require("child_process");
const docker = require("../utils/docker");
const githelper = require("../utils/git");
const { SERVER_ERROR, OK } = require("../constants/response-constants");
const Repository = require("../models/Repository");
const router = express.Router();

const buildImage = ({ git, version, tag, app }, cb = () => {}) => {
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
      } else {
        docker.build(`applications/${foldername}`, tag, (err) => {
          if (err) {
            return cb(err, null);
          }
          cb(null, tag);
        });
      }
    });
  });
};

// router.post("/test-cmd", (req, res) => {
//   exec(`docker login`, (error, stdout, stderr) => {
//     if (error) {
//       console.log(`error: ${error.message}`);
//       return;
//     }
//     if (stderr) {
//       console.log(` ${stderr}`);
//     }
//     if (stdout) {
//       console.log(`${stdout}`);
//     }
//   });
//   res.json({ message: "ok" });
// });

router.post("/build-image", async (req, res) => {
  try {
    let data = req.body;
    if (req.query.id) {
      const repository = await Repository.findById(req.query.id);
      if (repository) {
        data = repository._doc;
      } else {
        const repository = new Repository(req.body);
        await repository.save();
      }
    } else {
      const repository = new Repository(req.body);
      await repository.save();
    }
    buildImage(data, (err, tag) => {
      if (err) {
        return res
          .status(SERVER_ERROR.code)
          .json({ ...SERVER_ERROR, message: err.message });
      }

      docker.login(
        process.env.DOCKER_USERID,
        process.env.DOCKER_PASSWORD,
        (err) => {
          if (err) {
            return res
              .status(SERVER_ERROR.code)
              .json({ code: SERVER_ERROR.code, message: err.message });
          }
          docker.push(tag, (err) => {
            if (err) {
              return res
                .status(SERVER_ERROR.code)
                .json({ code: SERVER_ERROR.code, message: err.message });
            }
            res.json({ code: OK.code, message: "push successful" });
          });
        }
      );
    });
  } catch (err) {
    res.status(SERVER_ERROR.code).json(SERVER_ERROR);
  }
});

// router.post("/push-image", (req, res) => {
//   docker.login(req.body.userid, req.body.password, (err) => {
//     if (err) {
//       return res.status(500).json({ code: 500, message: err.message });
//     }
//     docker.push(req.body.image, (err) => {
//       if (err) {
//         return res.status(500).json({ code: 500, message: err.message });
//       }
//       res.json({ code: 200, message: "push successful" });
//     });
//   });
// });

// router.post("/deploy", (req, res) => {
//   buildImage(req.body, (err, image) => {
//     if (err) {
//       return res.status(SERVER_ERROR.code).json(SERVER_ERROR);
//     }
//     try {
//       docker.remove(req.body.containername, () => {
//         docker.run(
//           image,
//           req.body.containername,
//           `-d ${req.body.port ? `-p ${req.body.port}` : ""}`,
//           (err) => {
//             if (err) {
//               return res.status(SERVER_ERROR.code).json(SERVER_ERROR);
//             }
//             app.use(
//               `/${req.body.containername}`,
//               createProxyMiddleware({
//                 target: `http://localhost:${req.body.port.split(":")[0]}`,
//                 changeOrigin: true,
//               })
//             );
//             res.json({ ...OK, message: "deploy successful" });
//           }
//         );
//       });
//     } catch (err) {
//       docker.run(
//         image,
//         req.body.containername,
//         `-d -p ${req.body.port}`,
//         (err) => {
//           if (err) {
//             return res.status(SERVER_ERROR.code).json(SERVER_ERROR);
//           }
//           res.json({ ...OK, message: "deploy successful" });
//         }
//       );
//     }
//   });
// });

module.exports = router;
