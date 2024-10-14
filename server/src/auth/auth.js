import express from 'express'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import crypto from 'crypto'
import { Mongo } from '../database/mongo.js'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

const collectionName = 'users'

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, callback) => {
      const user = await Mongo.db
        .collection(collectionName)
        .findOne({ email: email })

      if (!user) {
        return callback(null, false)
      }

      const saltBuffer = user.salt.saltBuffer

      crypto.pbkdf2(
        password,
        saltBuffer,
        310000,
        16,
        'sha256',
        (err, hashedPassword) => {
          if (err) {
            return callback(null, false)
          }

          const userPasswordBuffer = Buffer.from(user.password.buffer)

          if (!crypto.timingSafeEqual(userPasswordBuffer, hashedPassword)) {
            return callback(null, false)
          }

          const { password, salt, ...rest } = user

          return callback(null, rest)
        }
      )
    }
  )
)

const authRouter = express.Router()

authRouter.post('/signup', async (req, res) => {
  const checkUser = await Mongo.db.collection(collectionName).findOne({
    email: req.body.email,
  })

  if (checkUser) {
    return res.status(500).send({
      sucess: false,
      statusCode: 500,
      body: {
        text: 'User already exists!',
      },
    })
  }

  const salt = crypto.randomBytes(16)
  crypto.pbkdf2(
    req.body.password,
    salt,
    310000,
    16,
    'sha256',
    async (err, hashedPassword) => {
      if (err) {
        return res.status(500).send({
          sucess: false,
          statusCode: 500,
          body: {
            text: 'Error on crypto password',
            error: err,
          },
        })
      }

      const result = await Mongo.db.collection(collectionName).insertOne({
        email: req.body.email,
        password: hashedPassword,
        salt,
      })

      if (result.insertedId) {
        const user = await Mongo.db
          .collection(collectionName)
          .findOne({ _id: new ObjectId(result.insertedId) })

        const token = jwt.sign(user, 'laranjaTaybr')

        return res.send({
          sucess: true,
          statusCode: 200,
          body: {
            text: 'User created successfully!',
            token,
            user,
            logged: true,
          },
        })
      }
    }
  )
})

authRouter.post('/login', (req, res) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      return res.send()
    }
  })
})

export default authRouter
