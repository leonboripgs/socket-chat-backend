
var ZipCodeSchema = require('../../schemas/zipcode_schema.js');


module.exports.getZipCodeData = async function (req, res) {
    console.log("[onboarding]->[get zipcode data]");
    try{
        var query = {"zipCode": req.body.zipcode};
        console.log(query);
        let codeData = await ZipCodeSchema.findOne(query);
        if(!codeData) {
            console.log("No zipcode");
            res.status(201).json({success: false, error: "Can not find Zipcode data"});
            return;
        }
        res.status(201).json({success: true, data: codeData});
    }catch(err) {
        res.status(401).json({success: false, error: err});
    }
}

module.exports.calcCarbonEmission = async function (req, res) {
    console.log("[onboarding]->[calc carbon emission]");
    try{
        var query = {'zipCode': req.body.zipcode};
        let codeData = await ZipCodeSchema.findOne(query);
        if(!codeData) {
            res.status(401, json({success: false, error: "Can not find Zipcode data"}));
        }
        var carbonEmission = codeData.totalHouseholdCarbonFootprint / (codeData.population / codeData.householdsPerZipCode);
        carbonEmission += req.body.diet;
        carbonEmission += req.body.car;
        carbonEmission += req.body.flight;
        console.log("Carbon emission value: ", carbonEmission);
        res.status(401).json({success: true, value: carbonEmission});
    }catch(err) {
        res.status(401).json({success: false, error: err});
    }
}