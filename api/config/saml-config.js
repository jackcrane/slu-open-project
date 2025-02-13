// https://dev-31211352.okta.com/app/dev-31211352_slucammanagementplatform2_1/exkkf5auoaNG9Ogwg5d7/sso/saml
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export default {
  entryPoint: "https://auth.slu.edu/app/sso/saml",
  issuer: "slu-open-project",
  callbackUrl: process.env.BASE_URL + "/assertion",
  cert: fs.readFileSync("./okta.cert", "utf-8"), // Add X.509 certificate here
  login:
    "https://auth.slu.edu/app/slu_sluopenproject_1/exkvyuwwmsE8VTbxh297/sso/saml",
};
