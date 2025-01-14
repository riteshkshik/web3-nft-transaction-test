const express = require("express");
const { getMetadata } = require("../controllers/nftController.js");
const requireAuth = require("../middleware/requireAuth.js");

const router = express.Router();

router.use(requireAuth);

router.post("/get-metadata", getMetadata);


module.exports = router;
