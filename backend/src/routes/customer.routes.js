const express = require("express");
const router = express.Router();
const customerController = require("../controller/customer.controller");

router.post("/", customerController.create);
router.get("/", customerController.getAll);
router.get("/:id", customerController.getById);
router.put("/:id", customerController.update);
router.delete("/:id", customerController.delete);

module.exports = router;
