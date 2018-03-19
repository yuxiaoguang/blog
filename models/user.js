const mongodb = require('./db');
// function User(user) {
//     this.name = user.name;
// }
//
// User.prototype.save = function (callback) {
//     console.log('From Server ', this.name);
//     callback(this.name);
// }


function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}
//箭头函数有问题
User.prototype.save = function(callback) {
    console.log('Save User:', this);
    var user = {
        name: this.name,
        password: this.password,
        email: this.email
    };

    mongodb.open((err, db) => {
        "use strict";
        if(err) return callback(err); //错误，返回err信息
        //读取users 集合
        db.collection('users', (err, collection) => {
            if(err){
                mongodb.close();
                return callback(err); //错误，返回err信息
            }
            collection.insert(user, {safe: true}, (err, user) => {
                mongodb.close();
                if(err) return callback(err); //错误，返回err信息
                callback(null, user[0]); // 成功！err为null ，并返回存储后的用户文档
            });
        });
    });
};

User.get = (name, callback) => {
    mongodb.open((err, db) => {
        if(err) return callback(err); //失败，返回错误信息
        // 读取users集合
        db.collection('users', (err, collection) => {
            if(err) return callback(err); //失败，返回错误信息
            // 查找一条用户名（键值为name）为name的一个文档
            collection.findOne({name: name}, (err, user) => {
                mongodb.close();
                if(err) return callback(err); //失败，返回错误信息
                callback(null, user); // 成功， 返回查询的用户信息
            });
        });
    });
}

module.exports = User;













