const express = require("express");
const router = express.Router();
const fs = require('fs-extra');
const auth = require('../config/auth');
const isUser = auth.isUser; //if we want to acess all items only for logged in users

//Get Product model
let Product = require("../models/product");
//Get Product model
let Category = require("../models/category");

//Get all products

router.get("/", async function (req, res) {
  try {
    const products = await Product.find({});

    res.render("all_products", {
      title: "All products",
      products: products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
//Get all products by category

router.get("/:category", async function (req, res) {
  const categorySlug = req.params.category;

  try {
    const category = await Category.findOne({ slug: categorySlug }).exec();

    if (!category) {
      res.status(404).send("Category not found");
      return;
    }
    const products = await Product.find({ category: categorySlug }).exec();

    res.render("cat_products", {
      title: category.title,
      products: products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//Get all product details

router.get('/:category/:product', async function (req, res) {
  try {
      const product = await Product.findOne({ slug: req.params.product }).exec();
      const loggedIn = (req.isAuthenticated()) ? true : false;
      if (!product) {
          // Handle product not found case
          res.status(404).send('Product not found');
          return;
      }

      const galleryDir = `public/product_images/${product._id}/gallery`;
      let galleryImages;

      try {
          galleryImages = await fs.readdir(galleryDir);
      } catch (err) {
          // Handle error reading gallery images
          console.error(err);
          galleryImages = [];
      }

      res.render('product', {
          title: product.title,
          p: product,
          galleryImages: galleryImages,
          loggedIn: loggedIn
      });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});

//Exports
module.exports = router;
