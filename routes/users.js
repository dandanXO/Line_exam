var express = require('express');
var router = express.Router();
var Users = require('../models/users');

/* GET users listing. */
router.get('/', isLogin, function (req, res, next) {
  let email = req.session.userInfo.email
  Users.findOne({ 'email': email }, function (err, user) {
    if (err) {
      console.log(err)
      return
    }
    if (user) {
      res.redirect('/users/dashboard')
      return
    }
    let newUser = new Users();
    newUser.email = email;
    newUser.save(function (err, result) {
      if (err) {
        console.log(err)
        return
      }
      res.redirect('/users/dashboard')
      return
    });
  });
});

router.get('/dashboard',isLogin,(req,res,next)=>{
  const userName = req.session.userInfo.name
  let email = req.session.userInfo.email
  Users.findOne({ 'email': email }, function (err, user) {
   if(err){
    res.redirect('/')
     return
   }
   res.render('dashboard', { userName:userName ,stores:user.store});
  })

 
})

router.post('/add',isLogin,(req,res,next)=>{
  let email = req.session.userInfo.email
  let name = req.body.name
  let phone = req.body.phoneNumber
  let address = req.body.address
  let sotre = {name:name, phoneNumber:phone,address:address }
  Users.update({ 'email': email },{ $push: {"store":sotre}}, {  safe: true, upsert: true}, 
  function (err, user) {
    if(err){
      console.log(err);
      return res.send(err);
   }
   res.redirect('/users/dashboard')
  })
  //res.redirect('/users/dashboard')
})

router.post('/update',isLogin,(req,res,next)=>{
  let email = req.session.userInfo.email
  let name = req.body.name
  let phone = req.body.phoneNumber
  let address = req.body.address
  let id = req.body.id
  let sotre = {name:name, phoneNumber:phone,address:address }
 Users.update({'email':email,"store._id": id},{'$set':{'store.$.name':name,'store.$.phoneNumber':phone,'store.$.address':address}},function(err){
  if(err){
    console.log(err)
    res.send(err)
    return
  }
  res.redirect('/users/dashboard')
 })
 
})

router.post('/delete',isLogin,(req,res,next)=>{
  let email = req.session.userInfo.email
  let id = req.body.id
  Users.updateOne({ 'email': email }, { $pull: { store: {_id:id} } },{ multi: true },
  function (err, user) {
    if(err){
      console.log(err);
      return res.send(err);
   }
   res.redirect('/users/dashboard')
  })
  //res.redirect('/users/dashboard')
})

function isLogin(req, res, next) {
  if (req.session.userInfo) {
    return next();
  }
  res.redirect('/');
}
module.exports = router;
