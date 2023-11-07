const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

//Get Page model
let Page = require('../models/page');

//Get pages index
router.get('/', isAdmin, async function(req, res) {
    try {
        const pages = await Page.find({}).sort({ sorting: 1 }).exec();
        res.render('admin/pages', {
            pages: pages
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//Get add page 
router.get('/add-page', isAdmin,  function(req, res) {
    
    let title = '';
    let slug = '';
    let content = '';

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    })
});

//Post add page 
router.post('/add-page', async function(req, res) {

    req.checkBody('title', 'title must have a value').notEmpty();
    req.checkBody('content', 'content must have a value').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug === '') slug = title.replace(/\s+/g, '-').toLowerCase();
    let content = req.body.content;

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        })
    } else {
        try {
            const page = await Page.findOne({ slug: slug });
    
            if (page) {
                req.flash('danger', 'Page slug exists, choose another.');
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                let newPage = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
    
                await newPage.save();
    
                const pages = await Page.find({}).sort({ sorting: 1 });
                req.app.locals.pages = pages;
    
                req.flash('success', 'Page added!');
                res.redirect('/admin/pages');
            }
        } catch (error) {
            console.log(error);
            // Handle the error appropriately, e.g., send an error response to the client
        }
    };
    
    
});

//Sort pages function
async function sortPages(ids) {
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const page = await Page.findById(id).exec();
        page.sorting = i + 1;
        await page.save();
    }
}

// Post reorder pages route handler
router.post('/reorder-pages', async function(req, res) {
    try {
        // Extract and clean up ids from the request body
        const ids = req.body['id[]'].map(id => id.trim());

        // Sort pages using async/await
        await sortPages(ids);

        // Retrieve sorted pages from the database
        const pages = await Page.find({}).sort({ sorting: 1 }).exec();
        
        // Update app.locals.pages with sorted pages
        req.app.locals.pages = pages;
        
        res.send('Pages reordered successfully.');
    } catch (err) {
        console.error('Error reordering pages:', err);
        res.status(500).send('Internal Server Error');
    }
});

//Get edit page 
router.get('/edit-page/:id', isAdmin, async function(req, res) {
    try {
        const page = await Page.findById(req.params.id).exec();
        if (!page) {
            return res.status(404).send('Page not found');
        }

        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

});

//Post edit page 
router.post('/edit-page/:id', async function(req, res) {
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();

    const title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug === '') slug = title.replace(/\s+/g, '-').toLowerCase();
    const content = req.body.content;
    const id = req.params.id;

    const errors = req.validationErrors();

    if (errors) {
        return res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    }

    try {
        const existingPage = await Page.findOne({ slug: slug, _id: { $ne: id } }).exec();
        if (existingPage) {
            req.flash('danger', 'Page slug exists, choose another.');
            return res.render('admin/edit_page', {
                title: title,
                slug: slug,
                content: content,
                id: id
            });
        }

        const page = await Page.findById(id).exec();
        if (!page) {
            req.flash('danger', 'Page not found.');
            return res.redirect('/admin/pages');
        }

        page.title = title;
        page.slug = slug;
        page.content = content;

        await page.save();

        const pages = await Page.find({}).sort({ sorting: 1 }).exec();
        req.app.locals.pages = pages;

        req.flash('success', 'Page updated!');
        res.redirect('/admin/pages/edit-page/' + id);
    } catch (error) {
        console.error(error);
        req.flash('danger', 'Error occurred while updating page.');
        res.redirect('/admin/pages');
    }
});

//Get delete page
router.get('/delete-page/:id', isAdmin, async function(req, res) {
    try {
        await Page.findByIdAndRemove(req.params.id);

        const pages = await Page.find({}).sort({ sorting: 1 });
        req.app.locals.pages = pages;

        req.flash('success', 'Page deleted!');
        res.redirect('/admin/pages/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }   
});
//Exports
module.exports = router;