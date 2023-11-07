const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

//Get Category model
let Category = require('../models/category');
const { render } = require('ejs');

//Get category index
router.get('/', isAdmin, async function(req, res) {
    try {
        const categories = await Category.find({}).sort({ sorting: 1 }).exec();
        res.render('admin/categories', {
            categories: categories
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//Get add category
router.get('/add-category', isAdmin, function(req, res) {
    
    let title = '';

    res.render('admin/add_category', {
        title: title
    })
});

//Post add category 
router.post('/add-category', function(req, res) {

    req.checkBody('title', 'title must have a value').notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_category', {
            errors: errors,
            title: title
        })
    } else {
        let categories;
        Category.findOne({slug: slug})
            .then (category => {
            if (category) {
                req.flash('danger', 'Category title exists, choose another.');
                res.render('admin/add_category', {
                    title: title
                });
            } else {
                let newCategory = new Category({
                    title: title,
                    slug: slug
                });

                return newCategory.save();
            } 
        })
        
        .then(() => {
            return Category.find().exec();
        })
        .then(allCategories => {
            categories = allCategories
            req.app.locals.categories = categories;
            req.flash('success', 'Category added!');
            res.redirect('/admin/categories');
        })
        .catch(error => {
            console.log(error);
        }); 
    }
    
});

//Get edit category 
router.get('/edit-category/:id', isAdmin, async function(req, res) {
    try {
        const category = await Category.findById(req.params.id).exec();
        if (!category) {
            return res.status(404).send('Category not found');
        }


        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

});

//Post edit category 
router.post('/edit-category/:id', async function(req, res) {
    req.checkBody('title', 'Title must have a value').notEmpty();

    const title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    const id = req.params.id;

    const errors = req.validationErrors();

    if (errors) {
        return res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id
        });
    }

    try {
        const existingCategory = await Category.findOne({ slug: slug, _id: { $ne: id } }).exec();
        if (existingCategory) {
            req.flash('danger', 'Category title exists, choose another.');
            return res.render('admin/edit_category', {
                title: title,
                id: id
            });
        }

        const category = await Category.findById(id).exec();
        if (!category) {
            req.flash('danger', 'Category not found.');
            return res.redirect('/admin/categories');
        }

        category.title = title;
        category.slug = slug;

        await category.save();

        const categories = await Category.find().exec();
        req.app.locals.categories = categories;

        req.flash('success', 'Category updated!');
        res.redirect('/admin/categories/edit-category/' + id);
    } catch (error) {
        console.error(error);
        req.flash('danger', 'Error occurred while updating category.');
        res.redirect('/admin/category');
    }
});

//Get delete category
router.get('/delete-category/:id', isAdmin, async function(req, res) {
    try {
        await Category.findByIdAndRemove(req.params.id);

        const categories = await Category.find().exec();
        req.app.locals.categories = categories;

        req.flash('success', 'Category deleted!');
        res.redirect('/admin/categories/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }   
    
});

//Exports
module.exports = router;