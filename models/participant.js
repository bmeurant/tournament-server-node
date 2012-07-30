/**
 * Author: Baptiste Meurant <baptiste.meurant@gmail.com>
 * Date: 19/07/12
 * Time: 08:45
 */
fs = require('fs');

module.exports = function (mongoose) {
    var Schema = mongoose.Schema;

    var Participant = new Schema({
        firstname:{ type:String, required:true },
        lastname:{ type:String, required:true }
    });

    Participant.methods.toJSON = function () {
        var obj = this.toObject();
        var picture_url = this.getPictureUrl();
        if (picture_url) {
            obj.picture_url = "/participant/" + this.id + "/photo";
            obj.pict_min = "/participant/" + this.id + "/min-photo";
        }
        obj.id =    this.id;
        return obj;
    }

    Participant.method('getPictureUrl', function () {
        var pict_url;

        var formats = ['gif', 'GIF', 'jpg', 'jpeg', 'JPG', 'JPEG', 'png', 'PNG'];
        var format;
        var img_name = './participants/photos/' + this.id;

        for (var i = 0; i < formats.length; i++) {
            format = formats[i];
            if (fs.existsSync(img_name + '.' + format)) {
                pict_url = img_name + '.' + format;
                break;
            }
        }

        return pict_url;
    });

    this.model = mongoose.model('Participant', Participant);

    return this;
};
