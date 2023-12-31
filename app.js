const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const config = require("./config/database");
const bodyParser = require("body-parser");
const session = require("express-session");
const expressValidator = require("express-validator");
const fileUpload = require("express-fileupload");
const passport = require('passport');
const createIndexes = require("./config/createIndex");

//connect to db
mongoose.connect(config.database);
mongoose.connect("mongodb://localhost/clothingStore");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function () {
  console.log("Connected to MongoDb");

  createIndexes.createCategoryIndexes();
  createIndexes.createPageIndex();
  createIndexes.createProductIndexes();
  createIndexes.createUserIndexes();
});

//Init app
const app = express();

//View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Set up public folder
app.use(express.static(path.join(__dirname, "public")));

//Set global errors variable
app.locals.errors = null;

//Get page model
const Page = require("./models/page");

async function getAllPages() {
  try {
    const pages = await Page.find({}).sort({ sorting: 1 }).exec();
    return pages;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all categories to pass to header.ejs
getAllPages()
  .then((pages) => {
    app.locals.pages = pages;
  })
  .catch((err) => {
    console.error("Error fetching pages:", err);
  });

//Get Category model
const Category = require("./models/category");

async function getAllCategories() {
  try {
    const categories = await Category.find({});
    return categories;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Get all categories to pass to header.ejs
getAllCategories()
  .then((categories) => {
    app.locals.categories = categories;
  })
  .catch((err) => {
    console.error("Error fetching pages:", err);
  });

//Express fileUpload middleware
app.use(fileUpload());

//Body Parser middleware
//
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Express Session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
  })
);

//Expression Validator middleware
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      let namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
    customValidators: {
      isImage: function (value, filename) {
        const extension = path.extname(filename).toLowerCase();
        switch (extension) {
          case ".jpg":
            return ".jpg";
          case ".jpeg":
            return ".jpeg";
          case ".png":
            return ".png";
          case "":
            return ".jpg";
          default:
            return false;
        }
      },
    },
  })
);

//Express Messages middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

//Passport  Config
require('./config/passport')(passport);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next) {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
})

//Set routes
var pages = require("./routes/pages.js");
var products = require("./routes/products.js");
var cart = require("./routes/cart.js");
var users = require("./routes/users.js");
const adminPages = require("./routes/admin_pages.js");
const adminCategories = require("./routes/admin_categories.js");
const adminProducts = require("./routes/admin_products.js");

app.use("/admin/pages", adminPages);
app.use("/admin/categories", adminCategories);
app.use("/admin/products", adminProducts);
app.use("/products", products);
app.use("/cart", cart);
app.use("/users", users);
app.use("/", pages);

//Start the server
const port = 3000;
app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});
