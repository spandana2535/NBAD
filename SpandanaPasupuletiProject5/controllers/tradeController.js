const express = require("express");
const model = require("../models/item");
const cart_model = require("../models/item_cart");
const save_model = require("../models/item_save");
const offer_model = require("../models/item_offer");
const res = require("express/lib/response");
const { promise } = require("bcrypt/promises");

//get /items: gives all items
exports.index = (req, res, next) => {
  model
    .find()
    .then((items) => {
      res.render("./item/trades", { items });
    })
    .catch((err) => {
      next(err);
    });
};

//get items/new : sends a form to create a new item
exports.new = (req, res) => {
  res.render("./item/newtrade");
};

//post /items: creates a new item
exports.create = (req, res, next) => {
  let newItem = new model(req.body);
  newItem.CreatedBy = req.session.user;
  newItem.Status = "Available";
  newItem.offerName = "";
  newItem.Saved = false;
  newItem.Offered = false;
  newItem
    .save()
    .then((newItem) => {
      req.flash("success", "Succesfully created a new Trade!");
      res.redirect("/items");
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        err.status = 400;
      }
      next(err);
    });
};

//get /items:id : gives the item with that particular id
exports.show = (req, res, next) => {
  let id = req.params.id;
  model
    .findById(id)
    .populate("CreatedBy", "firstName lastName")
    .then((item) => {
      if (item) {
        res.render("./item/trade", { item });
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

//get /items/:id/edit send a form to edit the item
exports.edit = (req, res, next) => {
  let id = req.params.id;
  model
    .findById(id)
    .then((item) => {
      res.render("./item/edit", { item });
    })
    .catch((err) => {
      next(err);
    });
};

//put /items/:id updates a particular item
exports.update =(req,res,next)=>{
  let item = req.body;
  let id = req.params.id;
   model.findByIdAndUpdate(id,item,{useFindAndModify:false, runValidators:true})
   .then((item)=>{
       if(item){
           res.redirect('/items/'+id);
          }else{
           let error = new Error('No Item found with id  ' + id);
           error.status = 404;
           next(error);
          }
   })
   .catch(err=>{
       if(err.name === 'ValidationError'){
           err.status = 400;
       }
       next(err);
   });
  
};


//delete /items/:id : deletes a particular item of an id
exports.delete = (req, res, next) => {
  let id = req.params.id;
  model
    .findById(id)
    .then((item) => {
      let name = item.offerName;
      Promise.all([
        offer_model.findOneAndDelete(
          { Name: name },
          { useFindAndModify: false }
        ),
        model.findByIdAndDelete(id, { useFindAndModify: false }),
        model.findOneAndUpdate({Name:name},{Status:"Available", Offered:false})
      ])
        .then((results) => {
          const [offer, item, item2] = results;
        })
        .catch((err) => {
          next(err);
        });
      req.flash("success", "Succesfylly deleted an Item");
      res.redirect("/items");
    })
    .catch((err) => {
      next(err);
    });
};

exports.cart = (req, res, next) => {
  let id = req.params.id;
  model
    .findById(id)
    .then((item) => {
      let item_quantity = req.body.quantity;
      item.Quantity = item_quantity;
      let name = item.Name;
      let newCartItem = new cart_model({
        Name: item.Name,
        Quantity: item.Quantity,
      });
      newCartItem.AddedBy = req.session.user;
      cart_model.findOne({ Name: name }).then((item) => {
        if (!item) {
          newCartItem
            .save()
            .then((newCartItem) => {
              req.flash("success", "Item Added to your cart");
              res.render("./item/cartpage", { newCartItem });
            })
            .catch((err) => {
              if (err.name === "ValidationError") {
                err.status = 400;
              }
              next(err);
            });
        } else {
          req.flash("error", "Item already added to cart");
          res.redirect("/nav/cart");
        }
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.save = (req, res, next) => {
  console.log("in save");
  let id = req.params.id;
  model
    .findByIdAndUpdate(
      id,
      { Saved: true },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    )
    .then((item) => {
      let name = item.Name;
      let newSaveItem = new save_model({
        Name: item.Name,
        Category: item.Category,
        Status: item.Status,
      });
      newSaveItem.SavedBy = req.session.user;
      save_model
        .findOne({ Name: name })
        .then((item) => {
          if (!item) {
            newSaveItem
              .save()
              .then((newSaveItem) => {
                req.flash("success", "Item Added to Wishlist");
                res.redirect("/nav/profile");
              })
              .catch((err) => {
                if (err.name === "ValidationError") {
                  err.status = 400;
                }
                next(err);
              });
          } else {
            req.flash("error", "item already saved");
            res.redirect("/nav/save");
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

exports.trade = (req, res, next) => {
  console.log("in trade");
  let user = req.session.user;
  iD = req.params.id;
  model
    .findByIdAndUpdate(
      iD,
      { Status: "Offer Pending", Offered: true },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    )
    .then((item) => {
      let newOfferItem = new offer_model({
        Name: item.Name,
        Status: "Offer Pending",
        Category: item.Category,
        OfferedBy: user,
      });
      newOfferItem.save().then((offer) => {
        model
          .find({ CreatedBy: user })
          .then((items) => {
            res.render("./item/item-trade", { items });
          })
          .catch((err) => {
            next(err);
          });
      });
    })
    .catch((err) => {
      next(err);
    })

    .catch((err) => {
      next(err);
    });
};

exports.tradeitem = (req, res, next) => {
  console.log("in trade item");
  let id = req.params.id;
  let user = req.session.user;
  Promise.all([
    model.findByIdAndUpdate(
      id,
      { Status: "Offer Pending" },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    ),
    offer_model.findOne({ OfferedBy: user }).sort({ _id: -1 }),
  ])
    .then((results) => {
      const [item, Offered] = results;
      let name = Offered.Name;
      model
        .findByIdAndUpdate(
          id,
          { offerName: name },
          {
            useFindAndModify: false,
            runValidators: true,
          }
        )
        .then((item) => {
          req.flash("success", "Offer Created");
          res.redirect("/nav/profile");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.manage = (req, res, next) => {
  console.log("in manage offer function");
  let id = req.params.id;
  let user = req.session.user;
  model
    .findById(id)
    .then((item) => {
      if (item.offerName === "") {
        let name = item.Name;
        model
          .findOne({ offerName: name })
          .then((item) => {
            res.render("./item/manage", { item });
          })
          .catch((err) => {
            next(err);
          });
      } else {
        let name = item.offerName;
        offer_model
          .findOne({ Name: name })
          .then((offer) => {
            res.render("./item/manageoffer", { item, offer });
          })
          .catch((err) => {
            next(err);
          });
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.accept = (req, res, next) => {
  console.log("in accept");
  let id = req.params.id;
  model
    .findByIdAndUpdate(
      id,
      { Status: "Traded" },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    )
    .then((item) => {
      let name = item.offerName;

      Promise.all([
        model.findOneAndUpdate(
          { Name: name },
          { Status: "Traded" },
          {
            useFindAndModify: false,
            runValidators: true,
          }
        ),
        offer_model.findOneAndDelete(
          { Name: name },
          { useFindAndModify: false }
        ),
      ])
        .then((results) => {
          const [item, offer] = results;
          req.flash("success", "Offer has been accepted by You!!");
          res.redirect("/nav/profile");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.reject = (req, res, next) => {
  console.log("in reject");
  let id = req.params.id;
  model
    .findByIdAndUpdate(
      id,
      { Status: "Available", offerName: "" },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    )
    .then((item) => {
      let name = item.offerName;
      Promise.all([
        model.findOneAndUpdate(
          { Name: name },
          { Status: "Available", Offered:false },
          {
            useFindAndModify: false,
            runValidators: true,
          }
        ),
        offer_model.findOneAndDelete({ Name: name }),
      ])
        .then((results) => {
          const [item, offer] = results;
          let name = item.Name;
          let status = item.Status;
          if (item.Saved) {
            save_model
              .findOneAndUpdate(
                { Name: name },
                { Status: status },
                {
                  useFindAndModify: false,
                  runValidators: true,
                }
              )
              .then((save) => {})
              .catch((err) => {
                next(err);
              });
          }
          req.flash("success", "Offer has been rejected by You!!");
          res.redirect("/nav/profile");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.savedelete = (req, res, next) => {
  console.log("in save delete");
  let id = req.params.id;
  model
    .findByIdAndUpdate(id, { Saved: false })
    .then((item) => {
      let name = item.Name;

      save_model
        .findOneAndDelete({ Name: name }, { useFindAndModify: false })
        .then((save) => {
          req.flash("success", "Item Unsaved");
          res.redirect("back");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.offerdelete = (req, res, next) => {
  console.log("in offer delete");
  let id = req.params.id;
  model
    .findByIdAndUpdate(
      id,
      { Status: "Available", Offered: false },
      {
        useFindAndModify: false,
        runValidators: true,
      }
    )
    .then((item) => {
      let name = item.Name;

      Promise.all([
        model.findOneAndUpdate(
          { offerName: name },
          { Status: "Available", offerName: "" }
        ),
        offer_model.findOneAndDelete(
          { Name: name },
          { useFindAndModify: false }
        ),
      ])
        .then((results) => {
          const [item, offer] = results;
          req.flash("success", "Offer has been cancelled by You!!");
          res.redirect("/nav/profile");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.manageofferdelete = (req, res, next) => {
  console.log("in manage-offer delete");
  let id = req.params.id;
  model
    .findByIdAndUpdate(id, { Status: "Available", offerName: "" })
    .then((item) => {
      let name = item.offerName;
      Promise.all([
        offer_model.findOneAndDelete({ Name: name }),
        model.findOneAndUpdate(
          { Name: name },
          { Status: "Available", Offered: false }
        ),
      ])
        .then((results) => {
          const [offer, item] = results;
          req.flash("success", "Offer cancelled by You!!");
          res.redirect("/nav/profile");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};
