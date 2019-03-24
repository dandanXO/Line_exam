var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');
const request = require('superagent');
const Admin = require('../models/admin')
const Users = require('../models/users');
router.get('/', function (req, res, next) {
    res.status(200).json({ message: 'api test' })
});

router.post('/auth', function (req, res, next) {
    Admin.findOne({ 'name': 'admin' }, function (err, user) {
        if (err) throw err
       
        if (req.body.username === user.name && req.body.password === user.password) {
            const token = jwt.sign({
                "admin": "true",
                "userName": "admin",
                "iat": 1516239022
            },
                process.env.JWT_key
            )
            req.session.userInfo = token
            return res.status(200).json({
                success: true,
                message: 'Enjoy your token',
                token: token
            })
        } else {
            res.status(200).json({ message: 'Authenticate failed. User not found or passwors wrong' })
        }
    })

})

router.use(function (req, res, next) {
    const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.session.userInfo
    if (token) {
       
        jwt.verify(token, process.env.JWT_key, function (err, decoded) {
            if (err) {
                if(err.name == "TokenExpiredError"){
                    var refreshedToken = jwt.sign({
                        success: true,
                        }, app.get('superSecret'), {
                            expiresIn: '5d'
                        });
                    request.apiToken = refreshedToken;
                    next();
                  }else if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' })
                  }
            } else {
                req.decoded = decoded
                next()
            }
        })
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        })
    }
})

/* need auth api routes*/
router.get('/getAlluserName', function (req, res) {
    let usersEmail = []
    Users.find({}, { 'email': 1 }, function (err, user) {
        if (err) {
            console.log(err)
            res.json({ err: err, message: 'Failed to get all user name' })
            return
        }
        res.status(200).json({ allUser: user })
    })
})
router.get('/getUserData/:email', function (req, res) {
    const email = req.params.email
    
    Users.findOne({ 'email': email }, function (err, user) {
        if (err) {
            console.log(err)
            res.json({ err: err, message: 'Failed to get all user name' })
            return
        }
        res.status(200).json({ user: user })
    })
})
router.post('/add/:email', function (req, res) {
    const email = req.params.email
    let name = req.body.name
    let phone = req.body.phoneNumber
    let address = req.body.address
    let sotre = { name: name, phoneNumber: phone, address: address }
    Users.update({ 'email': email }, { $push: { "store": sotre } }, { safe: true, upsert: true },
        function (err, user) {
            if (err) {
                console.log(err);
                return res.send(err);
            }
            res.status(200).json({ success: true ,message:`safe add new store`});
        })

})

router.patch('/update/:email/:id', function (req, res) {
    const email = req.params.email
    const id = req.params.id
    let name = req.body.name
    let phone = req.body.phoneNumber
    let address = req.body.address
   
    Users.update({ 'email': email, "store._id": id }, { '$set': { 'store.$.name': name, 'store.$.phoneNumber': phone, 'store.$.address': address } }, function (err) {
        if (err) {
            console.log(err)
            res.send(err)
            return
        }
        res.status(200).json({ success: true,message:`safe update id: ${id}` });
    })
})

router.delete('/delete/:email/:id', function (req, res) {
    const email = req.params.email
    const id = req.params.id
    Users.updateOne({ 'email': email }, { $pull: { store: { _id: id } } }, { multi: true },
        function (err, user) {
            if (err) {
                console.log(err);
                return res.send(err);
            }
            res.status(200).json({ success: true,message:`safe delete id: ${id}` });
        })
})



module.exports = router;