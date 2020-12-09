const ecc = require('eosjs-ecc');
const Random = require('random-seed-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Metausers, Companies } = require("./models");

module.exports = function(app) {
  app.post('/checkHash', async function(req, res) {
    let { pass, hash } = req.body;
    bcrypt.compare(pass, hash, function(err, match) {
      return res.json(match);
    });
  });

  app.post('/signIn', async function(req, res) {
    let { email, password } = req.body;
    console.log("-- Sign In --");
    console.log(req.body);
    try {
      let metauser = await Metausers.findOne({ email });
      if (metauser) {
        if (password == metauser.password) {
          return res.json({
            success: true,
            errorString: "",
            metauser,
          });
        } else {
          return res.json({
            success: false,
            errorString: "password strings do not match",
            metauser: null,
          });
        }
      } else {
        return res.json({
          success: false,
          errorString: "No metauser found with that email address",
          metauser: null,
        });
      }
    } catch(e) {
      return res.json({
        success: false,
        errorString: "error when querying for metauser with matching username",
        metauser: null,
      });
    }
  });

  app.post('/searchMetausers', async function(req, res) {
    let { username } = req.body;
    try {
      let metauser = await Metausers.findOne({ username });
      if (metauser) {
        return res.json({
          success: true,
          errorString: "",
          metausers: [metauser],
        });
      } else {
        return res.json({
          success: false,
          errorString: "No metauser found with that username",
          metausers: [],
        });
      }
    } catch(e) {
      return res.json({
        success: false,
        errorString: "error when querying for metauser with matching username",
        metausers: [],
      });
    }
  });

  app.post('/setNotifications', async function(req, res) {
    let { username, notifications } = req.body;
    try {
      let metauser = await Metausers.findOne({ username });
      if (metauser) {
        metauser.notifications = notifications;
        metauser.save(function(err, doc) {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              errorString: "error updating notifications",
            });
          }
          return res.json({
            success: true,
            errorString: "",
          });
        });
      } else {
        return res.json({
          success: false,
          errorString: "No metauser found with that username",
        });
      }
    } catch(e) {
      console.log("Exception thrown:\n" + e);
      return res.json({
        success: false,
        errorString: "error when querying for metauser with matching username",
      });
    }
  });

  app.post('/linkFacebook', async function(req, res) {
    let { username, facebookID } = req.body;
    try {
      let metauser = await Metausers.findOne({ username });
      if (metauser) {
        metauser.facebookID = facebookID;
        metauser.save(function(err, doc) {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              errorString: "error updating facebookID",
            });
          }
          return res.json({
            success: true,
            errorString: "",
          });
        });
      } else {
        return res.json({
          success: false,
          errorString: "No metauser found with that username",
        });
      }
    } catch(e) {
      console.log("Exception thrown:\n" + e);
      return res.json({
        success: false,
        errorString: "error when querying for metauser with matching username",
      });
    }
  });

  app.post('/linkGoogle', async function(req, res) {
    let { username, googleID } = req.body;
    try {
      let metauser = await Metausers.findOne({ username });
      if (metauser) {
        metauser.googleID = googleID;
        metauser.save(function(err, doc) {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              errorString: "error updating googleID",
            });
          }
          return res.json({
            success: true,
            errorString: "",
          });
        });
      } else {
        return res.json({
          success: false,
          errorString: "No metauser found with that username",
        });
      }
    } catch(e) {
      console.log("Exception thrown:\n" + e);
      return res.json({
        success: false,
        errorString: "error when querying for metauser with matching username",
      });
    }
  });

  app.post('/changePercentage', async function(req, res) {
    let { username, percentage } = req.body;
    try {
      let metauser = await Metausers.findOne({ username });
      if (metauser) {
        metauser.percentage = percentage;
        metauser.save(function(err, doc) {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              errorString: "error updating percentage",
            });
          }
          return res.json({
            success: true,
            errorString: "",
          });
        });
      } else {
        return res.json({
          success: false,
          errorString: "No metauser found with that username",
        });
      }
    } catch(e) {
      console.log("Exception thrown:\n" + e);
      return res.json({
        success: false,
        errorString: "error when querying for metauser with matching username",
      });
    }
  });

  app.get('/testDeployment', async function(req, res) {
    console.log('successfully hit API endpoint!');
    return res.json({success: 'true, successfully deployed!'});
  });

  app.get('/getRecentMembers', async function(req, res) {
    try {
      let members = await Metausers.find().sort({_id: -1}).limit(25);
      console.log(members);
      return res.json({
        success: true,
        errorString: "",
        members,
      });
    } catch(e) {
      console.log("EXCEPTION THROWN!:\n" + e);
      return res.json({
        success: false,
        errorString: "error thrown when querying for recently registered metausers",
        members: [],
      });
    }
  });

  app.post('/sendDM', async function(req, res) { // REQUIRES PLAID AND DWOLLA
    console.log("Sending DM transaction with parameters:\n" + JSON.stringify(req.body));
    let {
      sender,
      recipient,
      amount,
      memo,
    } = req.body;
    amount = amount + " EOS";

    let currentBalance = await rpc.get_currency_balance('eosio.token', sender, 'EOS');
    if (currentBalance < amount) {
      return res.json({
        success: false,
        errorString: "not enough balance to transact with",
        newBalance: currentBalance,
      });
    }

    console.log("Transacting with amount of:\n" + amount + "\n");
    try {
      let eosTx = await api.transact({
        actions: [{
          account: 'eosio.token',
          name: 'send_dm',
          authorization: [{ // this uses master account's private key for signing
            actor: 'eosio.token',
            permission: 'active',
          }],
          data: {
            from: sender,
            to: recipient,
            quantity: amount,
            memo: memo,
          },
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      });

      if (eosTx.transaction_id) {
        console.info("\n\nDM sent successfully in transaction:\n");
        console.log(eosTx);
        let newBalance = await rpc.get_currency_balance('eosio.token', sender, 'EOS');
        return res.json({
          success: true,
          errorString: "",
          newBalance,
        });
      } else {
        return res.json({
          success: false,
          errorString: "failed to send DM",
          newBalance: currentBalance,
        });
      }
    } catch(e) {
      console.log("EXCEPTION THROWN!:\n" + e);
      return res.json({
        success: false,
        errorString: "failed transacting on blockchain",
        newBalance: currentBalance,
      });
    }
  });

  app.post('/acceptDM', async function(req, res) { // REQUIRES PLAID AND DWOLLA
    console.log("accepting DM transaction with parameters:\n" + JSON.stringify(req.body));
    let {
      sender,
      recipient,
      amount,
      memo,
      msg_id,
    } = req.body;
    amount = amount + " EOS";
    let currentBalance = await rpc.get_currency_balance('eosio.token', recipient, 'EOS');

    try {
      let eosTx = await api.transact({
        actions: [{
          account: 'eosio.token',
          name: 'accept_dm',
          authorization: [{ // this uses master account's private key for signing
            actor: 'eosio.token',
            permission: 'active',
          }],
          data: {
            from: sender,
            to: recipient,
            quantity: amount,
            memo: memo,
            msg_id: msg_id,
          },
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      });

      if (eosTx.transaction_id) {
        console.info("\n\nDM accepted successfully in transaction:\n");
        console.log(eosTx);
        let newBalance = await rpc.get_currency_balance('eosio.token', recipient, 'EOS');
        return res.json({
          success: true,
          errorString: "",
          newBalance:currentBalance,
        });
      } else {
        return res.json({
          success: false,
          errorString: "failed to accept DM",
          newBalance: currentBalance,
        });
      }
    } catch(e) {
      console.log("EXCEPTION THROWN!:\n" + e);
      return res.json({
        success: false,
        errorString: "failed transacting on blockchain",
        newBalance: currentBalance,
      });
    }
  });

  app.post('/cancelDM', async function(req, res) { // REQUIRES PLAID AND DWOLLA
    console.log("canceling DM transaction with parameters:\n" + JSON.stringify(req.body));
    let {
      sender,
      recipient,
      amount,
      memo,
      msg_id,
    } = req.body;
    amount = amount + " EOS";

    try {
      let eosTx = await api.transact({
        actions: [{
          account: 'eosio.token',
          name: 'cancel_dm',
          authorization: [{ // this uses master account's private key for signing
            actor: 'eosio.token',
            permission: 'active',
          }],
          data: {
            from: sender,
            to: recipient,
            quantity: amount,
            memo: memo,
            msg_id: msg_id,
          },
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      });

      if (eosTx.transaction_id) {
        console.info("\n\nDM canceled successfully in transaction:\n");
        console.log(eosTx);
        return res.json({
          success: true,
          errorString: "",
        });
      } else {
        return res.json({
          success: false,
          errorString: "failed to cancel DM",
        });
      }
    } catch(e) {
      console.log("EXCEPTION THROWN!:\n" + e);
      return res.json({
        success: false,
        errorString: "failed transacting on blockchain",
      });
    }
  });

  app.post('/createMetauser', async function(req, res) {
    console.log("Creating metauser with parameters:\n" + JSON.stringify(req.body));
    let {
      name,
      email,
      password,
      facebookID,
      twitterID,
      instagramID,
      googleID,
    } = req.body;

    try {
      console.log("getting meta user");
      let metauserQuery = await Metausers.find({ email });
      let companyQuery = await Companies.find({ email });
      console.log("getting company");
      if (metauserQuery.length || companyQuery.length) {
        console.log("Sorry, this account already exists!");
        return res.json({
          success: false,
          errorString: "This email address is already registered to an existing user",
          username: "",
        });
      }
    } catch(e) {
      console.log(e);
      return res.json({
        success: false,
        errorString: "error when checking if user already exists",
        username: "",
      });
    }
    console.log("-- creating seeds --");
    let notifications = true;
    let offsetPercentage = 0;
    let carbonOffset = 0;
    let points = 0;
    let privateKey = ecc.seedPrivate(email);
    let publicKey = ecc.privateToPublic(privateKey);
    let priKey = privateKey;
    bcrypt.hash(priKey, 10, function(err, hash) { privateKey = hash; });
    let username = Random.createWithSeeds(email).string({
      length: 6,
      pool: '12345'
    });

    console.log("\nGenerating unique attributes for metauser using email as seed:");
    console.log("\nUsername:\n" + username);
    console.log("\nPublic Key:\n" + publicKey);
    console.log("\nPrivate Key:\n" + privateKey + "\n");

    try {
      let eosTx = await api.transact({
        actions: [{
          account: 'eosio',
          name: 'newaccount',
          authorization: [{
            actor: 'eosio',
            permission: 'active',
          }],
          data: {
            creator: 'eosio',
            name: username,
            owner: {
              threshold: 1,
              keys: [{
                key: publicKey,
                weight: 1
              }],
              accounts: [],
              waits: []
            },
            active: {
              threshold: 1,
              keys: [{
                key: publicKey,
                weight: 1
              }],
              accounts: [],
              waits: []
            },
          },
        }
      ]}, {
        blocksBehind: 3,
        expireSeconds: 30,
      });

      if (eosTx.transaction_id) {
        Metausers.create({
          name,
          username,
          email,
          password,
          facebookID,
          twitterID,
          instagramID,
          googleID,
          notifications,
          offsetPercentage,
          carbonOffset,
          publicKey,
          privateKey,
          points,
        });

        console.info("\n\nMetauser blockchain account for " + username + " created in transaction:\n");
        console.log(eosTx);
        return res.json({
          success: true,
          errorString: "",
          username,
        });
      } else {
        return res.json({
          success: false,
          errorString: "error creating blockchain user",
          username,
        });
      }
    } catch(e) {
      console.log("EXCEPTION THROWN!:\n" + e);
      return res.json({
        success: false,
        errorString: "error creating user",
        username,
      });
    }
  });

  app.post('/createCompany', async function(req, res) {
    console.log("Creating company with parameters:\n" + JSON.stringify(req.body));
    let {
      name,
      email,
      description,
      password,
      facebookID,
      twitterID,
      instagramID,
      googleID,
    } = req.body;

    try {
      let metauserQuery = await Metausers.find({ email });
      let companyQuery = await Companies.find({ email });
      if (metauserQuery.length || companyQuery.length) {
        console.log("Sorry, this account already exists!");
        return res.json({
          success: false,
          errorString: "This email address is already registered to an existing company",
          username: "",
        });
      }
    } catch(e) {
      return res.json({
        success: false,
        errorString: "error when checking if company already exists",
        username: "",
      });
    }

    let notifications = true;
    let offsetPercentage = 0;
    let carbonOffset = 0;
    let score = 0;
    let points = 0;
    let privateKey = ecc.seedPrivate(email);
    let publicKey = ecc.privateToPublic(privateKey);
    let priKey = privateKey;
    bcrypt.hash(priKey, 10, function(err, hash) { privateKey = hash; });
    let username = Random.createWithSeeds(email).string({
      length: 6,
      pool: '12345'
    });

    console.log("\nGenerating unique attributes for company using email as seed:");
    console.log("\nUsername:\n" + username);
    console.log("\nPublic Key:\n" + publicKey);
    console.log("\nPrivate Key:\n" + privateKey + "\n");

    try {
      let eosTx = await api.transact({
        actions: [{
          account: 'eosio',
          name: 'newaccount',
          authorization: [{
            actor: 'eosio',
            permission: 'active',
          }],
          data: {
            creator: 'eosio',
            name: username,
            owner: {
              threshold: 1,
              keys: [{
                key: publicKey,
                weight: 1
              }],
              accounts: [],
              waits: []
            },
            active: {
              threshold: 1,
              keys: [{
                key: publicKey,
                weight: 1
              }],
              accounts: [],
              waits: []
            },
          },
        }
      ]}, {
        blocksBehind: 3,
        expireSeconds: 30,
      });

      if (eosTx.transaction_id) {
        Companies.create({
          name,
          username,
          description,
          email,
          password,
          facebookID,
          twitterID,
          instagramID,
          googleID,
          notifications,
          offsetPercentage,
          carbonOffset,
          publicKey,
          privateKey,
          points,
          score,
        });

        console.info("\n\nCompany blockchain account for " + username + " created in transaction:\n");
        console.log(eosTx);
        return res.json({
          success: true,
          errorString: "",
          username,
        });
      } else {
        return res.json({
          success: false,
          errorString: "error creating blockchain user",
          username,
        });
      }
    } catch(e) {
      console.log("EXCEPTION THROWN!:\n" + e);
      return res.json({
        success: false,
        errorString: "error creating user",
        username,
      });
    }
  });

  app.post('/changePassword', async function(req, res) {
    console.log("Changing password with params:\n" + JSON.stringify(req.body));
    let {
      username,
      password,
      newPass
    } = req.body;
    try {
      let metauser = await Metausers.findOne({ username });
      let company = await Companies.findOne({ username });
      if (metauser) {
        console.log("Changing metauser password:\n");
        if (password == metauser.password) {
          metauser.password = newPass;
          metauser.save(function(err, doc) {
            if (err) {
              console.log(err);
              return res.json({
                success: false,
                errorString: "error updating new password",
              });
            }
            return res.json({
              success: true,
              errorString: "",
            });
          });
        } else {
          return res.json({
            success: false,
            errorString: "password strings do not match",
            metauser: null,
          });
        }
      } else if (company) {
        console.log("Changing company password:\n");
        if (password == company.password) {
          company.password = newPass;
          company.save(function(err, doc) {
            if (err) {
              console.log(err);
              return res.json({
                success: false,
                errorString: "error updating new password",
              });
            }
            return res.json({
              success: true,
              errorString: "",
            });
          });
        } else {
          return res.json({
            success: false,
            errorString: "password strings do not match",
            metauser: null,
          });
        }
      } else {
        console.log("No metadallion account found with that username...\n");
        return res.json({
          success: false,
          errorString: "no metadallion account found with that username",
        });
      }
    } catch(e) {
      console.log(e);
      return res.json({
        success: false,
        errorString: "error when querying for account to change password",
      });
    }
  });

  app.post('/resetPassword', async function(req, res) {
    console.log("Requesting reset password with params:\n" + JSON.stringify(req.body));
    let {
      email,
    } = req.body;

    let token = jwt.sign(
      { email },
      'SECRET_KEY', // secret key for signing JWT
      [
        {
          expiresIn: "1h", // expiration time, need to confirm how long JWT should be valid for,
        },
      ]
    ); // signed jwt for user
    let url = "https://www.testurl.com"; // url of reset password site
    let content = '<h2>Please visit the following site to reset your Metadallion password:</h2><h3>'
      + url
      + '</h3>';

    try {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: '', // EMAIL ADDRESS HERE
          pass: '' // PASSWORD HERE
        },
      });

      let mailOptions = {
        from: 'SENDER EMAIL HERE', // sender address
        to: email, // list of receivers
        subject: 'Metadallion - Reset Password Link', // Subject line
        html: content // plain text body
      };

      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.log(err);
          return res.json({
            success: false,
            errorString: "error sending mail through nodemailer transporter object"
          });
        }
        console.log(info);
        return res.json({
          success: true,
          errorString: "",
        });
      });
    } catch(e) {
      console.log(e);
      return res.json({
        success: false,
        errorString: "error using nodemailer email library",
      });
    }
  });

  app.post('/confirmResetPassword', async function(req, res) {
    console.log("Confirming reset password with params:\n" + JSON.stringify(req.body));
    let {
      email,
      token,
      newPass,
    } = req.body;
    try {
      jwt.verify(
        token,
        "SECRET_KEY", // secret key for validatioln of JWT
        [
          {
            maxAge: "1h", // maximum valid age of JWT
          },
          (err, decoded) => {
            if (err) {
              console.log(err);
              return res.json({
                success: false,
                errorString: "error authenticating jwt",
              });
            }
          },
        ],
      );
    } catch(e) {
      console.log(e);
      return res.json({
        success: false,
        errorString: "error authenticating jwt",
      });
    }
    try {
      let metauser = await Metausers.findOne({ email });
      let company = await Companies.findOne({ email });
      if (metauser) {
        console.log("Resetting metauser password:\n");
        metauser.password = newPass;
        metauser.save(function(err, doc) {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              errorString: "error resetting user's password",
            });
          }
          return res.json({
            success: true,
            errorString: "",
          });
        });
      } else if (company) {
        console.log("Resetting company password:\n");
        company.password = newPass;
        company.save(function(err, doc) {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              errorString: "error resetting company's password",
            });
          }
          return res.json({
            success: true,
            errorString: "",
          });
        });
      } else {
        console.log("No metadallion account found with that username...\n");
        return res.json({
          success: false,
          errorString: "no account found with provided username",
        });
      }
    } catch(e) {
      console.log(e);
      return res.json({
        success: false,
        errorString: "error finding account to reset password",
      });
    }
  });
}
