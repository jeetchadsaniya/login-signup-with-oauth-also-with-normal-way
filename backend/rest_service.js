const {
  registerController,
  loginController,
  getDashboard,
  changePassword,
} = require("./controllers/userControllers");
const { requireSignIn } = require("./middlewares/authMiddleware");
const url = require("url");
const querystring = require("querystring");
const formidable = require("formidable");
const { setHeader } = require("./utils/setHeader");
const { sendForgetPasswordMail } = require("./utils/ForgotPasswordMail");
const { googleOauthHandler } = require("./controllers/sessionControllers");

class RestService {
  constructor(router) {
    this.router = router;
  }

  init() {
    this.userRoutes();
    return async (req, res) => {
      setHeader(res);

      switch (req.method) {
        case "GET":
          this.handleRequest(req, res, this.router._getRoutes);
          break;
        case "POST":
          this.handleRequest(req, res, this.router._postRoutes);
          break;
        case "PUT":
          this.handleRequest(req, res, this.router._putRoutes);
          break;
        case "DELETE":
          this.handleRequest(req, res, this.router._deleteRoutes);
          break;
        case "OPTIONS":
          const headers = {
            "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "Content-Type, *",
            "Access-Control-Allow-Credentials": true,
          };
          res.writeHead(204, headers);
          res.end();
          return;
        default:
          break;
      }
    };
  }

  userRoutes() {
    this.router.getRoutes("/", (req, res) => {
      res.statusCode = 200;
      res.end("HomePage");
    });
    this.router.getRoutes(
      "/api/v1/user/sessions/oauth/google",
      googleOauthHandler
    );
    this.router.postRoutes("/api/v1/user/register", registerController);
    this.router.postRoutes("/api/v1/user/login", loginController);
    this.router.postRoutes(
      "/api/v1/user/forget-password",
      sendForgetPasswordMail
    );
    this.router.postRoutes("/api/v1/user/change-password", changePassword);
    this.router.getRoutes("/api/v1/user/dashboard", getDashboard, [
      requireSignIn,
    ]);
  }

  async handleRequest(req, res, routes) {
    const parseUrl = url.parse(req.url, true);
    req.query = parseUrl.query;
    await this.parseRequestBody(req);

    //handle params
    const isNormalUrl = routes[parseUrl.pathname];
    if (isNormalUrl) {
      const parseUrl = url.parse(req.url, true);
      req.url = parseUrl.pathname;
      await this.excuteFun(req, res, routes);
    }
    //for param request
    else {
      if (this.matchParam(req, routes)) {
        await this.excuteFun(req, res, routes);
      } else {
        res.statusCode = 404;
        res.end("Rotutes Not Found");
      }
    }
  }

  matchParam(req, routes) {
    const parseUrl = url.parse(req.url, true);
    let paramUrlInclude = false;
    let UrlMatch = false;
    const request = parseUrl.pathname;
    const pattern = "[\\w-]+";
    for (const url in routes) {
      if (url.includes(":")) {
        paramUrlInclude = true;
        const routeRegex = new RegExp(
          url.replace(/:([^/]+)/g, (match, paramName) => {
            return `(?<${paramName}>${pattern})`;
          })
        );
        const match = routeRegex.exec(request);
        if (match) {
          UrlMatch = match;

          const matchedParams = {};

          for (const [paramName, paramValue] of Object.entries(match.groups)) {
            matchedParams[paramName] = paramValue;
          }
          req.param = matchedParams;
          req.url = url;
          return matchedParams;
        }
      }
    }
    if (!paramUrlInclude || !UrlMatch) {
      return false;
    }
  }

  async excuteFun(req, res, routes) {
    for (let i = 0; i < routes[req.url].length; i++) {
      try {
        await routes[req.url][i](req, res);
      } catch (error) {
        console.log("-------", error.message);
        break;
      }
    }
  }

  async parseRequestBody(req) {
    const contentType =
      req.headers["Content-Type"] || req.headers["content-type"];
    let body;
    if (contentType) {
      if (contentType.includes("application/json")) {
        body = await this.parseJsonBody(req);
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        body = await this.parseUrlEncodedBody(req);
      } else if (contentType.includes("multipart/form-data")) {
        body = await this.parseFormDataBody(req);
      } else if (contentType.includes("text/plain")) {
        body = await this.parsePlainTextBody(req);
      } else {
        body = null;
      }
    }
    req.body = body;
  }

  async parseJsonBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async parseUrlEncodedBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        resolve(querystring.parse(body));
      });
    });
  }

  async parseFormDataBody(req) {
    return new Promise((resolve, reject) => {
      const form = new formidable.IncomingForm();

      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
        } else {
          resolve({ fields, files });
        }
      });
    });
  }

  async parsePlainTextBody(req) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        resolve(body);
      });
    });
  }
}

module.exports = {
  RestService,
};
