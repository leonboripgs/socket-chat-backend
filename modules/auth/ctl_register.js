const ecc = require('eosjs-ecc');
const Random = require('random-seed-generator');
var MetaUserSchema = require('../../schemas/metauser_schema.js');
var CompanySchema = require('../../schemas/company_schema.js');
var bcrypt = require('bcryptjs');

module.exports.register = async function (req, res) {
	console.log("[auth]->[register]");
	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(req.body.password, salt);
	var userInfo = {
		name	:	req.body.name || "",
		email 	:   req.body.email || null,
		password:   hash,
		avatar: req.body.avatar || "",
		userType: req.body.userType || 0,
		facebookID: req.body.facebookID || "",
		twitterID: req.body.twitterID || "",
		instagramID: req.body.instagramID || "",
		googleID: req.body.googleID || "",
		offsetPercentage: 0
	}
	// setting inital offsetpercentage
	if(userInfo.userType == 0) {
		userInfo.offsetPercentage = 80;		// regular user 80% for white dots
	} else {
		userInfo. offsetPercentage = 10;	// influencers and company users
	}
	try {
		let metaUserQuery = await MetaUserSchema.find({ 'email' : userInfo.email });
		let companyQuery = await CompanySchema.find({ 'email' : userInfo.email });
		if(metaUserQuery.length || companyQuery.length) {
			console.log("Sorry, this email is already exist!");
			return res.status(200).json({
				success: false,
				errorString: "This email address is already registered to an existing user",
				username: "",
			}); 
		}
	} catch (error) {
		console.log(error); 
		res.status(400).json({success: false, error: error, description: "Error when checking if user already exists"});
	}
	// -- Creating Seeds --
	console.log("-- creating seeds --");
	let notifications = true;
	let offsetPercentage = 0;
	let carbonOffset = 0;
	let points = 0;
	// let privateKey = ecc.seedPrivate(userInfo.email);
	// let publicKey = ecc.privateToPublic(privateKey);
	let privateKey = "5KeSxrEgxCGPkhnt2qZGNVg11hmvRd69ngxb364Vv6af45N5TSL";
	let publicKey = "EOS8YCDcbLTfSpiXYZWrodT3435WtndiH6goqNxAYWiqDrNeJxS8S";
	let priKey = privateKey;
	bcrypt.hash(priKey, 10, function(err, hash) { privateKey = hash; });
	let username = Random.createWithSeeds(userInfo.email).string({
		length: 7,
		pool: '12345abcdefghijklmnopqrstuvwxyz'
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
			MetaUserSchema.create({
				...userInfo,
				username: username,
				notifications,
				offsetPercentage,
				carbonOffset,
				publicKey,
				privateKey,
				points,
			});

			console.info("\n\nMetauser blockchain account for " + username + " created in transaction:\n");
			console.log(eosTx);
			return res.status(201).json({
				success: true,
				errorString: "",
				username,
			});
		} else {
			return res.status(200).json({
				success: false,
				errorString: "error creating blockchain user",
				username,
			});
		}
	} catch(e) {
		console.log("EXCEPTION THROWN!:\n" + e);
		return res.status(500).json({
			success: false,
			errorString: "error creating user",
			username,
		});
	}
}