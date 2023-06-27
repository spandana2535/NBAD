const express = require("express");
const router = express.Router();
const controller = require("../controllers/tradeController");
const {
  authenticated,
  isCreatedBy,
  isOfferedBy,
  isSavedBy,
} = require("../middlewares/auth");
const {
  validateId,
  validateitem,
  validationresult,
  cartquantity,
  saveitem,
} = require("../middlewares/validator");
//get /items: gives all items
router.get("/", controller.index);

//get items/new : sends a form to create a new item (join us!)
router.get("/new", authenticated, controller.new);

//post /items: creates a new item
router.post(
  "/",
  authenticated,
  validateitem,
  validationresult,
  controller.create
);

//get /items:id : gives an item with that particular id
router.get("/:id", validateId, controller.show);

//get /items/:id/edit sends a form to edit the item of that particular id
router.get(
  "/:id/edit",
  validateId,
  authenticated,
  isCreatedBy,
  controller.edit
);

//put /items/:id updates the particular item of that id
router.put(
  "/:id",
  validateId,
  authenticated,
  isCreatedBy,
  validateitem,
  validationresult,
  controller.update
);

//delete /items/:id : deletes the particular item of that id
router.delete(
  "/:id",
  validateId,
  authenticated,
  isCreatedBy,
  controller.delete
);

//post /items/id posts items to cart
router.post(
  "/:id",
  validateId,
  authenticated,
  cartquantity,
  validationresult,
  controller.cart
);

//post /items/id/save posts ietms to whishlist
router.post(
  "/:id/save",
  validateId,
  authenticated,
  saveitem,
  validationresult,
  controller.save
);

router.get("/:id/trade", validateId, authenticated, controller.trade);

router.get("/:id/tradeitem", authenticated, controller.tradeitem);

router.get("/:id/manage", validateId, authenticated, controller.manage);

router.get("/:id/accept", validateId, authenticated, controller.accept);

router.get("/:id/reject", validateId, authenticated, controller.reject);

////delete /items/id/save deletes items from the whishlist
router.delete(
  "/:id/savedelete",
  validateId,
  authenticated,
  isSavedBy,
  controller.savedelete
);

router.delete(
  "/:id/offerdelete",
  validateId,
  authenticated,
  isOfferedBy,
  controller.offerdelete
);

router.delete(
  "/:id/manageofferdelete",
  validateId,
  controller.manageofferdelete
);

module.exports = router;
