const JWT = require("./jwt");

exports.isUser = function (req, res, next) {
    const token = req.headers.authorization;

    if(token) {
        try {
            const jwt = new JWT('z&R8tWb*2k@7Y$L!9sFpCqG3eJ#nTmWp');
            const  decoded = jwt.decode(token);
            next();
        } catch (error) {
            req.flash('danger', 'Please log in.');
            res.redirect('/users/login');
        }
    } else {
        req.flash('danger', 'Log in please');
        res.redirect('/users/login');
    }
}

exports.isAdmin = function (req, res, next) {
    if(req.isAuthenticated() && req.user && req.user.admin === 1) {
        next()
    } else {
        req.flash('danger', 'Please log in as admin');
        res.redirect('/users/login');
    }
} 
