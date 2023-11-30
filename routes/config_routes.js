const indexR = require("./index");
const usersR = require("./users");
const tablesR = require("./tables");

exports.routesInit = (app) => {
  app.use("/",indexR);
  app.use("/users",usersR);
  app.use("/tables",tablesR)
}

// add here all the routes you have