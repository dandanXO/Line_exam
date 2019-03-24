var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');


const request = require('superagent')
const line_login = require("line-login");
const login = new line_login({
  channel_id: '1557998244',
  channel_secret: 'dec1d516aaf9cb5d3a314fd684cdb123',
  callback_url: 'http://dandan.tw/lcb',
  scope: "openid email profile",
  prompt: "consent",
  bot_prompt: "normal"
});


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Line Login Test' });
});

router.get('/lineLogin', login.auth());

router.get('/logout',(req,res,next)=>{
  req.session.destroy();
  res.redirect('/')
})

router.get('/lcb', function (req, res, next) {
  const code = req.query.code
  request
    .post('https://api.line.me/oauth2/v2.1/token')
    .send({
      grant_type:'authorization_code',
      code: code,
      redirect_uri:'http://dandan.tw/lcb',
      client_id:'1557998244',
      client_secret: 'dec1d516aaf9cb5d3a314fd684cdb123',
    })
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .then((result)=>{
      req.session.access_token = result.body.access_token
      req.session.userInfo = jwtDecode(result.body.id_token);
      res.redirect('/users')
    })
    .catch(e=>{
      console.log(e)
      res.redirect('/')
    })
    
});

module.exports = router;
