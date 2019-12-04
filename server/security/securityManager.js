/* 
* Generated by
* 
*      _____ _          __  __      _     _
*     / ____| |        / _|/ _|    | |   | |
*    | (___ | | ____ _| |_| |_ ___ | | __| | ___ _ __
*     \___ \| |/ / _` |  _|  _/ _ \| |/ _` |/ _ \ '__|
*     ____) |   < (_| | | | || (_) | | (_| |  __/ |
*    |_____/|_|\_\__,_|_| |_| \___/|_|\__,_|\___|_|
*
* The code generator that works in many programming languages
*
*			https://www.skaffolder.com
*
*
* You can generate the code from the command-line
*       https://npmjs.com/package/skaffolder-cli
*
*       npm install -g skaffodler-cli
*
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
* To remove this comment please upgrade your plan here: 
*      https://app.skaffolder.com/#!/upgrade
*
* Or get up to 70% discount sharing your unique link:
*       https://app.skaffolder.com/#!/register?friend=5de817f719b9e3132aba8f19
*
* You will get 10% discount for each one of your friends
* 
*/
// Dependencies
import jsonwebtoken from "jsonwebtoken";
import cors from "cors";
import helmet from "helmet";
// Properties
import properties from "../properties";
// Errors
import ErrorManager from "../classes/ErrorManager";
import Errors from "../classes/Errors";
import UserModel from "../models/Zmoki_db/UserModel";

/**
 * Middleware JWT
 * @param {string, array} roles Authorized role, null for all
 */
export const authorize = (roles = []) => {
  // Roles param can be a single role string (e.g. Role.User or 'User')
  // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
  if (typeof roles === "string") {
    roles = [roles];
  }

  return [
    // Authenticate JWT token and attach user to request object (req.user)
    async (req, res, next) => {
      let token =
        req.headers.authorization &&
        req.headers.authorization.replace("Bearer ", "");

      if (!token) {
        const safeErr = ErrorManager.getSafeError(
          new Errors.INVALID_AUTH_HEADER()
        );
        res.status(safeErr.status).json(safeErr);
      } else {
        let decodedUser = null;
        try {
          decodedUser = jsonwebtoken.verify(token, properties.tokenSecret);
        } catch (err) {
          // Token not valid
          const safeErr = ErrorManager.getSafeError(new Errors.JWT_INVALID());
          return res.status(safeErr.status).json(safeErr);
        }

        if (decodedUser && hasRole(roles, decodedUser)) {
          req.user = decodedUser;
          next();
        } else {
          const safeErr = ErrorManager.getSafeError(new Errors.UNAUTHORIZED());
          res.status(safeErr.status).json(safeErr);
        }
      }
    }
  ];
};

export const initSecurity = app => {
  app.use(helmet());
  app.use(cors());
};

// ---------------- UTILS FUNCTIONS ---------------- //

/**
 * Check if user has role
 * @param {*} roles String or array of roles to check
 * @param {*} user Current logged user
 */
var hasRole = function(roles, user) {
  return (
    roles == undefined ||
    (user != undefined && roles.length == 0) ||
    (user != undefined && roles.indexOf("PUBLIC") != -1) ||
    (user != undefined && user.roles.indexOf("ADMIN") != -1) ||
    (user != undefined && findOne(roles, user.roles))
  );
};

/**
 * Find value in array
 * @param {*} array1
 * @param {*} array2
 */
var findOne = function(array1, array2) {
  for (var i in array1) {
    for (var j in array2) {
      if (array1[i] == array2[j]) return true;
    }
  }

  return false;
};
