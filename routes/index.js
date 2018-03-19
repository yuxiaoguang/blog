
const crypto = require('crypto'),
      User = require('../models/user.js');
module.exports = (app) => {
  app.get('/', (req, res) => {
    res.render('home.ejs', {title: '主页'});
  });

  app.get('/reg', (req, res) => {
    res.render('reg.ejs', {title: '注册页'});
  });
  app.post('/reg', (req, res) => {
    let name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];
    //检验用户两次输入的密码是否一致
    if(password_re != password){
      req.flash('error', '两次输入的密码不一致');
      return res.redirect('/reg');//返回注册主页
    }
    const md5 = crypto.createHash('md5');
    password = md5.update(req.body.password).digest('hex');
    const newUser = new User({
        name: name,
        password: password,
        email: req.body.email
    });
    User.get(newUser.name, (err, user) => {
      if(err){
        req.flash('error', '检查当前用户报错');
        return res.redirect('/reg');
      }
      // 检查插入的用户是否已经存在
      if(user){
        req.flash('error', '用户 <b>' + newUser.name + '</b> 已存在');
        return res.redirect('/reg');
      }
      newUser.save((err, user) => {
        if(err){
          req.flash('error', '保存用户失败');
          return res.redirect('/reg');
        }
        req.session.user = user;
        req.flash('success', '注册成功');
        res.redirect('/');
      });
    });
  });

  app.get('/login', (req, res) => {
    res.render('login.ejs', {title: '登录页'});
  });
  app.post('/login', (req, res) => {
    const user = new User({
      name: req.body.name,
      password: req.body.password
    });
    user.password = crypto.createHash('md5').update(user.password).digest('hex');

    User.get(user.name, (err, callbackUser) => {
      if(err) {
        req.flash('error', '获取用户失败');
        return console.error('Error', '获取用户失败');
      }
      if(callbackUser && callbackUser.password === user.password){
        req.flash('success', '登录成功');
        console.log('success', '登录成功');
        res.redirect('/');
        return;
      }
      req.flash('error', '登录失败');
      console.error('error', '登录失败');
      res.redirect('/login');
    });
  });

  app.get('/post', (req, res) => {
    "use strict";
    res.render('post.ejs', {title: '发表'});
  });
  app.post('/post', (req, res) => {
    "use strict";
    // TODO:
  });

  app.get('/logout', (req, res) => {
    "use strict";
    // TODO:
  });

}












