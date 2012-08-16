/**
 * Author: Baptiste Meurant <baptiste.meurant@gmail.com>
 * Date: 19/07/12
 * Time: 08:47
 */

fs = require('fs');
util = require('util');
url = require('url');

module.exports = function (app, models) {

    app.get('/api', function (req, res) {
        res.send('App is running');
    });

    app.get('/api/participants*', function (request, response) {

        var url_parts = url.parse(request.url, true);
        var params = url_parts.query;

        response.header('Access-Control-Allow-Origin', '*');
        var options = {
            perPage:params.perPage || 10,
            delta:params.delta || 0,
            page:params.page || 1
        };
        var query = models.participant.find();
        query.paginate(options, function (err, res) {
            if (err) {
                return response.send("Cannot fetch participants", null, 400);
            }
            else {
                var page = {}
                page.content = res.results;
                page.number = res.current;
                page.numberOfElements = res.results ? res.results.length : 0;
                page.totalElements = res.count;
                page.totalPages = res.last;
                page.hasContent = res.results && res.results.length > 0;
                page.hasNextPage = res.next != null;
                page.hasPreviousPage = res.prev != null;
                page.isFirstPage = res.prev == null;
                page.isLastPage = res.next == null;

                return response.send(page);
            }
        });
    });

    app.post('/api/participant', function (req, res) {
        var participant;
        console.log("POST participant: ");
        participant = new models.participant({
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email == '' ? null : req.body.email
        });
        participant.save(function (err) {
            if (!err) {
                console.log("participant " + participant.firstname + " " + participant.lastname + " created");
                return res.send(participant);
            } else {
                console.log("Cannot post participant with body: " + req.body);
                return res.send("Cannot post participant with body: " + req.body, null, 400);
            }
        });

    });

    app.get('/api/participant/:id', function (req, res) {
        return models.participant.findById(req.params.id, function (err, participant) {
            if (participant != null) {
                return res.send(participant);
            } else {
                console.log("Cannot find any participant with id: " + req.params.id);
                return res.send("Cannot find any participant with id: " + req.params.id, null, 404);
            }
        });
    });

    app.post('/api/participant/:id/photo', function (req, res) {

        var isError = false;
        var responseError, status, picture_url;

        models.participant.findById(req.params.id, function (err, participant) {

            if (err) {
                responseError = err.message;
                status = 400;
                isError = true
            }
            else {
                if (participant == null) {
                    responseError = "Cannot find any participant with id: " + req.params.id;
                    status = 404;
                    isError = true
                }
                else {
                    picture_url = participant.getPictureUrl();
                }
            }

            if (isError) {
                return res.send(responseError, null, status);
            }
            if (picture_url) {
                fs.unlink(picture_url);
            }
            var ins, ous, type;
            ins = fs.createReadStream(req.files.file.path);
            type = (req.files.file.type.split('/'))[1];
            ous = fs.createWriteStream('./participants/photos/' + req.params.id + '.' + type);

            util.pump(ins, ous, function (err) {
                if (err) {
                    next(err);
                } else {
                    //res.redirect('/photos');
                }
            });
            res.send('Uploaded new photo for participant ' + req.params.id);

        });

    });

    app.get('/api/participant/:id/photo', function (req, res) {
        getPhoto(req, res, null);
    });

    app.get('/api/participant/:id/min-photo', function (req, res) {
        getPhoto(req, res, 'min');
    });

    function getPhoto(req, res, type) {
        res.header('Accept-Ranges', 'bytes');
        models.participant.findById(req.params.id, function (err, participant) {

            var img;
            var isError = false;
            var responseError, status, picture_url;

            if (err) {
                responseError = err.message;
                status = 400;
                isError = true
            }
            else {
                if (participant == null) {
                    responseError = "Cannot find any participant with id: " + req.params.id;
                    status = 404;
                    isError = true
                }
                else {

                    picture_url = participant.getPictureUrl();

                    if (!picture_url) {
                        responseError = "Cannot find any photo for participant with id: " + req.params.id;
                        status = 404;
                        isError = true
                    }
                }
            }

            if (isError) {
                return res.send(responseError, null, status);
            }
            img = fs.readFileSync(picture_url);

            var imgType = (picture_url.substring(picture_url.lastIndexOf('.') + 1, picture_url.length));

            if ((type != null) && (type == 'min')) {
                res.header('Cache-Control', 'public, max-age=3600');
            }

            res.writeHead(200, {
                'Content-Type':'image/' + imgType,
                'Content-Length':img.length
            });
            res.end(img, 'binary');
        });
    }

    app.delete('/api/participant/:id/photo', function (req, res) {
            var img;
            var isError = false;
            var responseError, status, picture_url;

            models.participant.findById(req.params.id, function (err, participant) {

                if (err) {
                    responseError = err.message;
                    status = 400;
                    isError = true
                }
                else {
                    if (!participant) {
                        responseError = "Cannot find any participant with id: " + req.params.id;
                        status = 404;
                        isError = true
                    }
                    else {
                        picture_url = participant.getPictureUrl();
                    }
                }

                if (isError) {
                    return res.send(responseError, null, status);
                }
                if (picture_url) {
                    fs.unlink(picture_url);
                }

            });
            console.log("photo deleted for participant " + req.params.id);
            res.send('Deleted photo for participant ' + req.params.id);
        }
    )
    ;

    app.put('/api/participant/:id', function (req, res) {
        console.log("PUT participant: " + req.params.id + ": ");
        console.log(req.body);
        models.participant.findById(req.params.id, function (err, participant) {
            participant.firstname = req.body.firstname;
            participant.lastname = req.body.lastname;
            participant.email = req.body.email == '' ? null : req.body.email;
            return participant.save(function (err) {
                if (!err) {
                    console.log("participant " + req.params.id + " updated");
                    return res.send(participant);
                } else {
                    console.log(err);
                    return res.send("cannot update participant: " + req.params.id, null, 400);
                }
            });
        });
    });

    app.delete('/api/participant/:id', function (req, res) {
        return models.participant.findById(req.params.id, function (err, participant) {
            if (participant != null) {
                return participant.remove(function (err) {
                    if (!err) {
                        console.log("participant " + req.params.id + " removed");
                        return res.send('');
                    } else {
                        console.log(err);
                        return res.send("cannot remove participant: " + req.params.id, null, 400);
                    }
                });
            }
            else {
                return res.send("cannot remove participant: " + req.params.id, null, 404);
            }
        });
    });

};