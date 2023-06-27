const model = require("../models/item");
const cart_model = require("../models/item_cart");
const save_model = require("../models/item_save");
const offer_model = require("../models/item_offer");
/*Authorization rules:
if a user is not logged in(guest), then user can only access new account page and login page
Actions: signup for a new account/ login to the app 
Otherwise, user is redirected to the profile page */

//check if user is guest
exports.isGuest = (req, res, next) => {
  if (!req.session.user) {
    return next();
  } else {
    req.flash("error", "You are logged in already");
    return res.redirect("/nav/profile");
  }
};

/*Authorization rules:
if a user is logged in(authenticated), then user can access profile page and new Trade page
Actions: create a new item/ logout 
Otherwise, user is redirected to the login page */

//check if user is authenticated
exports.authenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  } else {
    req.flash("error", "You need to login first!");
    res.redirect("/nav/login");
  }
};

/* if the user is authenticated (logged in) and the item is createdBy the user, then user can
access edit Item page.
Actions: edit the item, delete the item
otherwise, the user is redirected to login page if the user is not logged in 
or redirected to error page if logged in but not the owner of the item.*/

//checks if the item is created by user or not
exports.isCreatedBy = (req, res, next) => {
  id = req.params.id;
  model
    .findById(id)
    .then((item) => {
      if (item) {
        if (item.CreatedBy == req.session.user) {
          console.log("Owner is same as user");
          return next();
        } else {
          let err = new Error("you are not authorised to perform action");
          err.status = 401;
          next(err);
        }
      } else {
        let error = new Error("No Item found with id  " + id);
        error.status = 404;
        next(error);
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.isAddedBy = (req, res, next) => {
  id = req.params.id;
  cart_model
    .findById(id)
    .then((item) => {
      if (item) {
        if (item.AddedBy == req.session.user) {
          console.log("Owner is same as user");
          return next();
        } else {
          let err = new Error("you are not authorised to perform action");
          err.status = 401;
          next(err);
        }
      } else {
        let error = new Error("No Item found with id  " + id);
        error.status = 404;
        next(error);
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.isSavedBy = (req, res, next) => {
  id = req.params.id;
  model
    .findById(id)
    .then((item) => {
      let name = item.Name;
      save_model
        .findOne({ Name: name })
        .then((item) => {
          if (item) {
            if (item.SavedBy == req.session.user) {
              console.log("Owner is same as user");
              return next();
            } else {
              let err = new Error("you are not authorised to perform action");
              err.status = 401;
              next(err);
            }
          } else {
            let error = new Error("No Item found with id  " + id);
            error.status = 404;
            next(error);
          }
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.isOfferedBy = (req, res, next) => {
  id = req.params.id;
  model
    .findById(id)
    .then((item) => {
      let name = item.Name;
      offer_model
        .findOne({ Name: name })
        .then((item) => {
          if (item) {
            if (item.OfferedBy == req.session.user) {
              console.log("Owner is same as user");
              return next();
            } else {
              let err = new Error("you are not authorised to perform action");
              err.status = 401;
              next(err);
            }
          } else {
            let error = new Error("No Item found with id  " + id);
            error.status = 404;
            next(error);
          }
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};
