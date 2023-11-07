const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

//Get Product model
let Product = require('../models/product');

//Get Category model
let Category = require('../models/category');

//Get products index
router.get('/', isAdmin, async function(req, res) {
    try {
        const count = await Product.countDocuments();
        const products = await Product.find();

        res.render('admin/products', {
            products: products,
            count: count
        });
    } catch (err) {
        res.status(500).send('Internal Server Error');
        console.error(err);
    }
});

//Get add product
router.get('/add-product', isAdmin, async function(req, res) {
    try {
        let title = '';
        let desc = '';
        let price = '';

        const categories = await  Category.find().exec();

        res.render('admin/add_product', {
            title: title,
            desc: desc,
            price: price,
            categories: categories
        })
    }

    catch (err) {
        res.status(500).send('Internal Server Error');
        console.error(err);
    }
    
});

//Post add product
router.post('/add-product', async function(req, res) {
    let imageFile;

    // Check if image was uploaded
    if (req.files && req.files.image) {
        imageFile = req.files.image.name;
    } else {
        imageFile = '';
    }

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    let title = req.body.title;
    const slug = title.replace(/\s+/g, '-').toLowerCase();
    const desc = req.body.desc;
    const price = req.body.price;
    const category = req.body.category;

    let errors = req.validationErrors();

    if (errors) {
        try {
            const categories = await Category.find().exec();
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    } else {
        try {
            const product = await Product.findOne({ slug: slug }).exec();
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                const categories = await Category.find().exec();
                res.render('admin/add_product', {
                    title: title,
                    desc: desc,
                    categories: categories,
                    price: price
                });
            } else {
                const price2 = parseFloat(price).toFixed(2);
                const product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                await product.save();

                mkdirp('public/product_images/'+product._id, function(err) {
                    return console.log(err);
                });
                mkdirp('public/product_images/'+product._id + '/gallery', function(err) {
                    return console.log(err);
                });
                mkdirp('public/product_images/'+product._id + '/gallery/thumbs', function(err) {
                    return console.log(err);
                });

                if (imageFile != '') {
                    const productImage = req.files.image;
                    const path = 'public/product_images/' + product._id + '/' + imageFile;

                    productImage.mv(path, function(err) {
                        return console.log(err);
                    })
                }

                req.flash('success', 'Product added!');
                res.redirect('/admin/products');
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    }
})

//Get edit product 
router.get('/edit-product/:id', isAdmin, async function(req, res) {
    let errors;

    if (req.session.errors) 
        errors = req.session.errors;
    req.session.errors = null;

    try {
        const categories = await Category.find();
        const p = await Product.findById(req.params.id);

        const galleryDir = 'public/product_images/' + p._id + '/gallery';
        let galleryImages = null;

        const files = await fs.promises.readdir(galleryDir);
        galleryImages = files;

        res.render('admin/edit_product', {
            title: p.title,
            errors: errors,
            desc: p.desc,
            categories: categories,
            category: p.category.replace(/\s+/g, '-').toLowerCase(),
            price: parseFloat(p.price).toFixed(2),
            image: p.image,
            galleryImages: galleryImages,
            id: p._id
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin/products');
    }
});

//Post edit product 
router.post('/edit-product/:id', async function(req, res) {
    let imageFile;

    // Check if image was uploaded
    if (req.files && req.files.image) {
        imageFile = req.files.image.name;
    } else {
        imageFile = '';
    }

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('desc', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    let title = req.body.title;
    const slug = title.replace(/\s+/g, '-').toLowerCase();
    const desc = req.body.desc;
    const price = req.body.price;
    const category = req.body.category;
    const pimage = req.body.pimage;
    const id = req.params.id;

    let errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        try {
            const product = await Product.findOne({ slug: slug, _id: { $ne: id } }).exec();
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                const product = await Product.findById(id).exec();
                if (!product) {
                    req.flash('danger', 'Product not found.');
                    res.redirect('/admin/products');
                    return;
                }

                product.title = title;
                product.slug = slug;
                product.desc = desc;
                product.price = parseFloat(price).toFixed(2);
                product.category = category;
                if (imageFile !== "") {
                    product.image = imageFile;
                }

                await product.save();

                if (imageFile !== "") {
                    if (pimage !== "") {
                        await fs.remove(`public/product_images/${id}/${pimage}`);
                    }

                    const productImage = req.files.image;
                    const path = `public/product_images/${id}/${imageFile}`;

                    await productImage.mv(path);
                }

                req.flash('success', 'Product edited!');
                res.redirect('/admin/products/edit-product/' + id);
            }
        } catch (err) {
            console.error(err);
            req.flash('danger', 'Internal Server Error');
            res.redirect('/admin/products');
        }
    }
});

//Post product gallery
router.post('/product-gallery/:id', function(req, res) {
    const productImage = req.files.file;
     const id = req.params.id;
     const path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
     const thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;
    
     productImage.mv(path, function (err) {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function(buf) {
            fs.writeFileSync(thumbsPath, buf);
        }); 
     });

     res.sendStatus(200);
     
});
//Get delete image
router.get('/delete-image/:image', isAdmin, function(req, res) {
    
    const originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    const thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);     
                }
            });
        }
    })
});

//Get delete product
router.get('/delete-product/:id', isAdmin, async function(req, res) {
    const id = req.params.id;
    const path = 'public/product_images/' + id;

    try {
        await fs.remove(path);
        
        const deletedProduct = await Product.findByIdAndRemove(id);

        if (deletedProduct) {
            req.flash('success', 'Product deleted!');
        } else {
            req.flash('danger', 'Product not found.');
        }
        
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        req.flash('danger', 'Failed to delete product.');
        res.redirect('/admin/products');
    }
});

//Exports
module.exports = router;