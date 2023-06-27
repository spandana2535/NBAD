const express = require("express");
const router = express.Router();
const controller = require("../controllers/mainController");
const {
  isGuest,
  authenticated,
  isAddedBy,
  isSavedBy,
  isOfferedBy,
} = require("../middlewares/auth");
const {
  validateId,
  validateLogin,
  validateSignup,
  validationresult,
  cartquantity,
} = require("../middlewares/validator");
const { Limiter } = require("../middlewares/rateLimiters");
//get /nav/about renders about.ejs page
router.get("/about", controller.about);

//get /nav/contact renders contact.ejs page
router.get("/contact", controller.contact);

//get /nav/login renders login.ejs page
router.get("/login", isGuest, controller.login);

router.post(
  "/login",
  Limiter,
  isGuest,
  validateLogin,
  validationresult,
  controller.authenticate
);

//get /nav/signup renders signup.ejs page
router.get("/signup", isGuest, controller.signup);

router.post(
  "/signup",
  Limiter,
  isGuest,
  validateSignup,
  validationresult,
  controller.create
);

//get /nav/profile renders signup.ejs page
router.get("/profile", authenticated, controller.profile);

//get /nav/logout renders signup.ejs page
router.get("/logout", authenticated, controller.logout);

//get /nav/msg renders message.ejs page
router.get("/msg", controller.msg);

//get /nav/cart renders items which are already in cart
router.get("/cart", authenticated, controller.cartitems);

//get /nav/cart/id renders details of particular item in cart
router.get("/cart/:id", validateId, authenticated, controller.cartitem);

//get /nav/cart/id/edit renders edit form (only quantity)
router.get(
  "/cart/:id/edit",
  validateId,
  authenticated,
  isAddedBy,
  controller.cartedit
);

//put /nav/cart/id updates the particular item in cart
router.put(
  "/cart/:id",
  validateId,
  authenticated,
  isAddedBy,
  cartquantity,
  validationresult,
  controller.cartupdate
);

//delete /nav/cart/:id deletes items from the cart
router.delete(
  "/cart/:id",
  validateId,
  isAddedBy,
  authenticated,
  controller.cartdelete
);

//get /nav/save renders the whishlist page
router.get("/save", controller.wishlist);

module.exports = router;
