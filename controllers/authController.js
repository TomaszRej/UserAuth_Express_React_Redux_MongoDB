//const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('config');
const io = require('../socket');

validateRegisterInput = require('../validation/register')
validateLoginInput = require('../validation/login');

exports.getUsers = async (req, res, next) => {
  console.log(req.userId, 'req.userId z decodedddd')
  //console.log(req.userId, 'decodedddd')
  try {
    const users = await User.find();
    res.status(200).json({ users: users })

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.registerUser = async (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);



  // Check Validation
  if (!isValid) {

    return res.status(400).json({ "message": errors });
  }

  const { name, email, password } = req.body;


  try {
    // checking if user exist
    const user = await User.findOne({ email })
    console.log(user, 'user')

    if (user !== null) return res.status(400).json({ message: 'User with this email address already exist' });

    const hashedPw = await bcrypt.hash(password, 12);
    const newUser = new User({ name, email, password: hashedPw });
    const result = await newUser.save();

    io.getIO().emit('users', { action: 'create', user: newUser })
    res.status(201).json({ message: "User created!", userId: result._id })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error('A user with this email could not be found.');
      error.statusCode = 401;
      throw error;
    }

    //loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password!');
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
        name: user.name,

        test:'test' 
      },
      'mojJSONwebTokenVerySecret',
      { expiresIn: '1h'}
    );

    const decodedToken = jwt.verify(token, config.get('jwtSecret'));


    res.status(200).json({ userId: user._id.toString(), user: user, token: token, tokenExp: decodedToken.exp, tokenIat: decodedToken.iat  });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

