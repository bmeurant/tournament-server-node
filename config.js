module.exports = function(app, express, mongoose){

  var config = this;

  //generic config
  app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'topsecret' }));
    app.use(express.methodOverride());
    app.use(app.router);
  });

  //env specific config
  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

    app.mongoose.connect('mongodb://localhost/turnament');
  });

  /*app.configure('production', function(){
    app.use(express.errorHandler());

    app.mongoose.connect('mongodb://flame.mongohq.com:27087/nodemvr');
  });*/

  return config;

};