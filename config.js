module.exports = function (app, express, mongoose) {

    var config = this;

    var allowCrossDomain = function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.header('Access-Control-Allow-Headers', 'Content-Type');

        // intercept OPTIONS method
        if ('OPTIONS' == req.method) {
            res.send(200);
        }
        else {
            next();
        }
    };


    //generic config
    app.configure(function () {
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(allowCrossDomain);
        app.use(express.session({ secret:'topsecret' }));
        app.use(express.methodOverride());
        app.use(app.router);
    });

    //env specific config
    app.configure('development', function () {
        app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));

        app.mongoose.connect('mongodb://localhost/turnament');
    });

    /*app.configure('production', function(){
     app.use(express.errorHandler());

     app.mongoose.connect('mongodb://flame.mongohq.com:27087/nodemvr');
     });*/

    return config;

};