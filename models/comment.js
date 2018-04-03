const mongodb = require('./db');

function Comment(name, day, title, comment) {
    this.name = name;
    this.day = day;
    this.title = title;
    this.comment = comment;
}

Comment.prototype.save = function (callback) {
    const name = this.name;
    const day = this.day;
    const title = this.title;
    const comment = this.comment;
    mongodb.open((err, db) => {
        if(err) return callback(err);
        db.collection('posts', (err, collection) => {
            const query = {name: name, 'time.day': day, title: title};
            const updateStr = {$push: {comments: comment}};
            collection.updateOne(query, updateStr, (err) => {
                mongodb.close();
                if(err) return callback(err);
                callback(null);
            })
        })
    })
}

module.exports = Comment;
