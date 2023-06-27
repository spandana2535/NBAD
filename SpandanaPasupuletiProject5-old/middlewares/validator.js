//checking whether the id is valid one or not
const { body, validationResult } = require("express-validator");

exports.validateId = (req, res, next) => {
  let id = req.params.id;
  //an objectId is a 24-bit Hex string
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    return next();
  } else {
    let err = new Error("Invalid Item id");
    err.status = 400;
    return next(err);
  }
};

exports.validateSignup = [
  body("firstName", "First Name cannot be empty").notEmpty().trim().escape(),
  body("lastName", "Last Name cannot be empty").notEmpty().trim().escape(),
  body("email", "Email must be a valid mail address")
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  body("password", "password must be atleast 8 char and atmost 64").isLength({
    min: 8,
    max: 64,
  }),
];

exports.validateLogin = [
  body("email", "Email must be a valid mail address")
    .isEmail()
    .trim()
    .escape()
    .normalizeEmail(),
  body("password", "password must be atleast 8 char and atmost 64").isLength({
    min: 8,
    max: 64,
  }),
];

exports.validationresult = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach((error) => {
      req.flash("error", error.msg);
    });
    return res.redirect("back");
  } else {
    return next();
  }
};

exports.validateitem = [
  body("Category", "Category cannot be empty").notEmpty().trim().escape(),
  body("Name", "Name cannot be empty").notEmpty().trim().escape(),
  body("StoreAddress", "StoreAddress cannot be empty")
    .notEmpty()
    .trim()
    .escape(),
  body("Details", "Details must be atleast 10 characters long")
    .isLength({ min: 10 })
    .trim()
    .escape(),
];

exports.cartquantity = [
  body("quantity", "quantity must be atleast 1 and not more than 20")
    .isLength({ min: 1, max: 20 })
    .trim()
    .escape(),
];

exports.saveitem = [
  body("Name", "Name cannot be empty").notEmpty().trim().escape(),
];
