const express = require("express");
const router = express.Router();
//Get Product model
let Product = require("../models/product");

//Get add product to cart

router.get("/add/:product", async function (req, res) {
  try {
    const slug = req.params.product;
    const product = await Product.findOne({ slug: slug }).exec();

    if (!product) {
      req.flash("error", "Product not found!");
      return res.redirect("back");
    }

    if (!req.session.cart) {
      req.session.cart = [];
    }

    let newItem = true;
    for (let i = 0; i < req.session.cart.length; i++) {
      if (req.session.cart[i].title === slug) {
        req.session.cart[i].qty++;
        newItem = false;
        break;
      }
    }

    if (newItem) {
      req.session.cart.push({
        title: slug,
        qty: 1,
        price: parseFloat(product.price).toFixed(2),
        image: "/product_images/" + product._id + "/" + product.image,
      });
    }
    console.log(req.session.cart);

    req.flash("success", "Product added!");
    res.redirect("back");
  } catch (error) {
    console.error(error);
    req.flash("error", "Error occurred while adding the product.");
    res.redirect("back");
  }
});

//Get checkout page

router.get("/checkout", function (req, res) {

  if (req.session.cart && req.session.cart.length == 0) {
    delete req.session.cart;
    res.redirect('/cart/checkout')
  }

  res.render('checkout', {
    title: 'Checkout',
    cart: req.session.cart
  })
});
//Get update product

router.get("/update/:product", function (req, res) {

  const slug = req.params.product;
  const cart = req.session.cart;
  const action = req.query.action;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].title == slug) {
      switch(action) {
        case "add":
          cart[i].qty++;
          break;
        case "remove":
          cart[i].qty--;
          if (cart[i].qty < 1) cart.splice(i, 1);
          break;
        case "clear":
          cart.splice(i, 1);
          if (cart.length == 0) delete req.session.cart;
          break;
        default:
          console.log('update problem');
          break;
      }
      break;
    }
    
  }

  req.flash("success", "Cart updated!");
  res.redirect("/cart/checkout");

})

//Get clear cart page

router.get("/clear", function (req, res) {

  delete req.session.cart;
  
  req.flash('success', 'Cart cleared!');
  res.redirect('/cart/checkout')
});

//Get buy now

router.get("/buynow", function (req, res) {

  delete req.session.cart;
  
  res.sendStatus(200);
});

//Exports
module.exports = router;
