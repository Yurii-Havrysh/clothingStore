const express = require("express");
const router = express.Router();
//Get Page model
let Page = require("../models/page");

//Get

router.get("/", async function (req, res) {
    try {
        const page = await Page.findOne({ slug: 'home' });

          res.render("index", {
            title: page.title,
            content: page.content
          });

      } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      }
});

//Get a page

router.get("/:slug", async function (req, res) {
  try {
    const slug = req.params.slug;
    const page = await Page.findOne({ slug: slug });

    if (!page) {
      res.redirect("/");
    } else {
      res.render("index", {
        title: page.title,
        content: page.content,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//Exports
module.exports = router;
