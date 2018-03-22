const mongdb = require('./db');
const markdown = require('markdown').markdown;
const moment = require('moment');
const util = require('util');

console.log('markdown method：'+ util.inspect(markdown, true))

function Post(name, title, post) {
    this.name = name;
    this.title = title;
    this.post = post;
}

module.exports = Post;

Post.prototype.save = function (callback) {
    let date = moment();
    let time = {
        date: date,
        year: date.format('YYYY'),
        month: date.format('YYYY-MM'),
        day: date.format('YYYY-MM-DD'),
        minute: date.format('YYYY-MM-DD HH:mm')
    };
    let post = {
        name: this.name,
        time: time,
        title: this.title,
        post: this.post
    };

    mongdb.open((err, db) => {
        if(err) {
            return callback(err);
        }
        db.collection('posts', (err, collation) => {
            if(err) {
                mongdb.close();
                return callback(err);
            }
            collation.insert(post, {safe: true}, (err) => {
                mongdb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

Post.get = (name, callback) => {
    mongdb.open((err, db) => {
        if(err) return callback(err);
        db.collection('posts', (err, collection) => {
            if(err){
                mongdb.close();
                return callback(err);
            }
            const query = {};
            if(name) query.name = name;
            collection.find(query).sort({time: -1}).toArray((err, docs) => {
                mongdb.close();
                if(err) return callback(err);
                docs.forEach((doc, index) => {
                    doc.post = markdown.toHTML(doc.post);
                })
                callback(null, docs);
            });
        });
    });
}















