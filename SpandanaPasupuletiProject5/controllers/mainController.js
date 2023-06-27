const express = require("express");
const cart_model = require("../models/item_cart");
const user = require("../models/user");
const model = require("../models/item");
const save_model = require("../models/item_save");
const offer_model = require("../models/item_offer");
const res = require("express/lib/response");
const { modelName } = require("../models/item");
const { name } = require("ejs");

exports.about = (req, res) => {
  res.render("about");
};

exports.contact = (req, res) => {
  res.render("contact");
};

exports.login = (req, res) => {
  console.log("in login function");
  res.render("./user/login");
};

exports.authenticate = (req, res, next) => {
  console.log("in authenticate function");
  //authincate user's login details
  let email = req.body.email;
  if (email) {
    email = email.toLowerCase();
  }
  let password = req.body.password;
  console.log("email is " + email);
  console.log("pwd is " + password);
  user
    .findOne({ email: email })
    .then((user) => {
      if (user) {
        user.comparePassword(password).then((result) => {
          if (result) {
            req.session.user = user._id; // storing user info
            req.flash("success", "you have successfully logged in");
            res.redirect("/nav/profile");
          } else {
            req.flash("error", "wrong password");
            res.redirect("/nav/login");
          }
        });
      } else {
        req.flash("error", "No account found with this Email!! Please Signup");
        res.redirect("/nav/login");
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.signup = (req, res) => {
  console.log("in signup function");
  res.render("./user/signup");
};

exports.create = (req, res, next) => {
  console.log("in create function");
  let body = new user(req.body);
  if (body.email) {
    body.email = body.email.toLowerCase();
  }
  body
    .save()
    .then(() => {
      res.redirect("/nav/login");
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        req.flash("error", err.message);
        return res.redirect("/nav/signup");
      }
      if (err.code === 11000) {
        req.flash("error", "Email has been used");
        res.redirect("/nav/signup");
      }
      next(err);
    });
};

exports.msg = (req, res) => {
  res.render("message");
};

exports.profile = (req, res, next) => {
  console.log("in profile function");
  let USER = req.session.user;
  Promise.all([
    user.findById(USER),
    model.find({ CreatedBy: USER }),
    model.find({ Saved: true }),
    save_model.find({ SavedBy: USER }),
    model.find({ Offered: true }),
    offer_model.find({ OfferedBy: USER }),
  ])
    .then((results) => {
      const [user, items, saved, saves, offered, offers] = results;
      res.render("./user/profile", {
        user,
        items,
        saved,
        saves,
        offered,
        offers,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    else res.redirect("/");
  });
};

exports.cartitems = (req, res, next) => {
  console.log("inside cartitems function");
  let id = req.session.user;
  Promise.all([user.findById(id), cart_model.find({ AddedBy: id })])
    .then((results) => {
      const [user, items] = results;
      res.render("cart", { user, items });
    })
    .catch((err) => {
      next(err);
    });
};

exports.cartitem = (req, res, next) => {
  let id = req.params.id;
  cart_model
    .findById(id)
    .populate("AddedBy", "firstName lastName")
    .then((item) => {
      res.render("./item/carttrade", { item });
    })
    .catch((err) => {
      next(err);
    });
};

exports.cartedit = (req, res, next) => {
  let id = req.params.id;
  cart_model
    .findById(id)
    .then((item) => {
      res.render("./item/cartedit", { item });
    })
    .catch((err) => {
      next(err);
    });
};

exports.cartupdate = (req, res, next) => {
  let id = req.params.id;
  cart_model
    .findById(id)
    .then((item) => {
      let item_quantity = req.body.quantity;
      item.Quantity = item_quantity;
      cart_model
        .findByIdAndUpdate(id, item, {
          useFindAndModify: false,
          runValidators: true,
        })
        .then((item) => {
          req.flash("success", "Cart Item has been updated!!");
          res.redirect("/nav/cart/" + id);
        })
        .catch((err) => {
          if (err.name === "ValidationError") {
            err.status = 400;
          }
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.cartdelete = (req, res, next) => {
  let id = req.params.id;
  cart_model
    .findByIdAndDelete(id, { useFindAndModify: false })
    .then((item) => {
      req.flash("success", "Item has been deleted from Cart!!");
      res.redirect("/nav/cart");
    })
    .catch((err) => {
      next(err);
    });
};

exports.wishlist = (req, res, next) => {
  console.log("in wishlist");
  let id = req.session.user;
  Promise.all([user.findById(id), save_model.find({ SavedBy: id })])
    .then((results) => {
      const [user, items] = results;
      res.render("save", { user, items });
    })
    .catch((err) => {
      next(err);
    });
};

exports.managedelete = (req, res, next) => {
  res.send("in manage cancel");
};
