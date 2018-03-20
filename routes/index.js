
const crypto = require('crypto'),
      User = require('../models/user.js');
      Post = require('../models/post.js');
module.exports = (app) => {
  app.get('/', checkLogin);
  app.get('/', (req, res) => {
    Post.get(null, (err, posts) => {
      if(err){
        req.flash('error', '获取博文失败');
        posts = [];
      }
      res.render('home.ejs', {
          title: '主页',
          user: req.session.user,
          posts: posts
      });
    })
  });
  app.get('/reg', checkNotLogin);
  app.get('/reg', (req, res) => {
    res.render('reg.ejs', {
      title: '注册页',
      user: req.session.user
    });
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
    if(!newUser.name){
        req.flash('error', '用户名不能为空');
        return res.redirect('/reg');
    }
    User.get(newUser.name, (err, user) => {
      if(err){
        req.flash('error', '检查当前用户报错');
        return;
      }
      // 检查插入的用户是否已经存在
      if(user){
        req.flash('error', '用户 ' + newUser.name + ' 已存在');
        return res.redirect('/reg');
      }
      newUser.save((err, user) => {
        if(err){
          req.flash('error', '保存用户失败');
          return;
        }
        req.session.user = user;
        req.flash('info', '注册成功');
        res.redirect('/');
      });
    });
  });

  app.get('/login', checkNotLogin);
  app.get('/login', (req, res) => {
    res.render('login.ejs', {
        title: '登录页',
        user: req.session.user
    });
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
        return;
      }
      if(callbackUser && callbackUser.password === user.password){
        req.flash('info', '登录成功');
        req.session.user = callbackUser;
        return res.redirect('/');
      }
      req.flash('error', '登录失败');
      res.redirect('/login');
    });
  });

  app.get('/post', checkLogin);
  app.get('/post', (req, res) => {
    "use strict";
    res.render('post.ejs', {
      title: '发表',
      user: req.session.user
    });
  });
  app.post('/post', (req, res) => {
    let currentUser = req.session.user;
        post = new Post(currentUser.name, req.body.title, req.body.post);
    post.save((err) => {
      if(err) {
        req.flash('error', '发布失败');
        return res.redirect('/');
      }
      req.flash('info', '发布成功');
      res.redirect('/');
    });
  });

  app.get('/logout', checkLogin);
  app.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('info', '登出成功');
    res.redirect('/');
  });

  function checkLogin(req, res, next) {
      if(!req.session.user){
        req.flash('error', '未登录');
        res.redirect('/login');
      }
      next();
  }

  function checkNotLogin(req, res, next) {
      if(req.session.user){
        req.flash('error', '已登录');
        res.redirect('back');
      }
      next();
  }

}

