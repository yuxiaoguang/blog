const mongdb = require('./db');
const markdown = require('markdown').markdown;
const moment = require('moment');
const util = require('util');

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

Post.searchAll = (name, callback) => {
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
};

Post.searchOne = (name, day, title, callback, options) => {
    mongdb.open((err, db) => {
        if(err) return callback(err);
        db.collection('posts', (err, collection) => {
            if(err){
                mongdb.close();
                return callback(err);
            }
            const query = {name: name, title: title, 'time.day': day};
            collection.findOne(query, (err, doc) => {
                mongdb.close();
                if(err) return callback(err);
                doc.post = markdown.toHTML(doc.post);
                callback(null, doc);
            });
        });
    });
};

Post.update = (name, day, title, post, callback, options) => {
    mongdb.open((err, db) => {
        if(err) return callback(err);
        db.collection('posts', (err, collection) => {
            if(err){
                mongdb.close();
                return callback(err);
            }
            const query = {name: name, 'time.day': day, title: title};
            var updateStr = {$set: { post : post }};
            collection.updateOne(query, updateStr, (err) => {
                mongdb.close();
                if(err) return callback(err);
                callback(null, doc);
            });
        });
    });
};

Post.remove = (name, day, title, callback, options) => {
    mongdb.open((err, db) => {
        if(err) return callback(err);
        db.collection('posts', (err, collection) => {
            if(err){
                mongdb.close();
                return callback(err);
            }
            const query = {name: name, 'time.day': day, title: title};
            collection.deleteOne(query, (err, result) => {
                mongdb.close();
                if(err) return callback(err);
                callback(null, result);
            });
        });
    });
}













