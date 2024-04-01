
const string_similarity = require('string-similarity');
const mongoose = require('mongoose');

// find similar strings utility function
function findSimilarMatches(filedName, keys) {
    const matches = string_similarity.findBestMatch(
        filedName,
        keys,
    );
    const best_match = matches.bestMatch.target;
    const best_match_rating = matches.bestMatch.rating;
    console.log(
        'Best Match ' + best_match + ' Rating ' + best_match_rating,
    );
    return {
        best_match,
        best_match_rating,
    };
}

// transform this data into a correct format based on a given schema
function validateAndTransformBrandDoc(brand) {
    if (brand === undefined || brand === null) {
        console.log('Brand Object is missing');
        return false;
    }
    // get the keys from the brand object
    const keys = Object.keys(brand);
    const invalidString = (str) => str === undefined || str === null || str === '' || typeof str !== 'string';
    const transformedBrand = {
        // generate a new id if not exist
        "_id": !invalidString(brand._id.$oid) ? brand._id.$oid : !invalidString(brand._id) ? brand._id : new mongoose.Types.ObjectId(),
    };

    // validate the brandName field
    if (invalidString(brand.brandName)) {
        // check in case for inner objects i.e. brand.name 
        if (brand.brand !== undefined && !invalidString(brand.brand.name)) {
            transformedBrand.brandName = brand.brand.name;
        }
        // check for near matches of brandName in the keys just in case a typo
        const { best_match, best_match_rating } = findSimilarMatches("brandName", keys);
        if (best_match_rating >= 0.7 && typeof brand[best_match] === 'string' && brand[best_match].length > 0) {
            transformedBrand.brandName = brand[best_match];
        }
        // check if the brandName is an array and has a valid string
        if (Array.isArray(brand.brandName) && brand.brandName.length > 0 && typeof brand.brandName[0] === 'string') {
            transformedBrand.brandName = brand.brandName[0].toString();
        }

        // use default value as a fallback
        if (invalidString(transformedBrand.brandName)) {
            console.log('Brand Name is missing/invalid and couldn\'t find a good fix -> use default value!');
            transformedBrand.brandName = 'Default Brand Name'; // use default value as a fallback
        }
    } else {
        transformedBrand.brandName = brand.brandName.toString();
    }

    // validate the yearFounded field
    let yearFounded = brand.yearFounded;
    if (yearFounded === undefined) {
        // check for yearCreated field instead
        if (brand.yearCreated !== undefined) {
            yearFounded = brand.yearCreated;
        } else {
            // check for near matches of yearFounded in the keys just in case a typo
            const { best_match, best_match_rating } = findSimilarMatches("yearFounded", keys);
            if (best_match_rating >= 0.7) {
                yearFounded = brand[best_match];
            } else {
                // check for near matches of yearCreated in the keys just in case a typo
                const { best_match, best_match_rating } = findSimilarMatches("yearCreated", keys);
                if (best_match_rating >= 0.7) {
                    yearFounded = brand[best_match];
                }
            }
        }
    }
    try {
        const parsedYearFounded = parseInt(yearFounded);
        if (isNaN(parsedYearFounded) || parsedYearFounded < 1600 || parsedYearFounded > new Date().getFullYear()) {
            throw new Error('Year Founded is not a valid number or out of range');
        }
        transformedBrand.yearFounded = parsedYearFounded;
    } catch (error) {
        console.log(error + '-> use min as default');
        transformedBrand.yearFounded = 1600; // use min value as default
    }

    // validate the numberOfLocations field
    let numberOfLocations = brand.numberOfLocations;
    if (numberOfLocations === undefined) {
        // check for near matches of numberOfLocations in the keys just in case a typo
        const { best_match, best_match_rating } = findSimilarMatches("numberOfLocations", keys);
        if (best_match_rating >= 0.7) {
            numberOfLocations = brand[best_match];
        }
    }
    try {
        const parsedNumberOfLocations = parseInt(numberOfLocations);
        if (isNaN(parsedNumberOfLocations) || parsedNumberOfLocations < 1) {
            throw new Error('Numder of locations is not a valid number or less than 1');
        }
        transformedBrand.numberOfLocations = parsedNumberOfLocations;
    } catch (error) {
        console.log(error + '-> use min as default');
        transformedBrand.numberOfLocations = 1; // use min value as default
    }

    // validate the headadress field
    if (invalidString(brand.headquarters)) {
        // check in case for inner objects i.e. headquarters.city
        if (brand.headquarters !== undefined && !invalidString(brand.headquarters.city)) {
            transformedBrand.brandName = brand.headquarters.city;
        }
        // check in case for inner objects i.e. head.city
        if (brand.head !== undefined && !invalidString(brand.head.city)) {
            transformedBrand.brandName = brand.head.city;
        }
        // check for hqAddress instead (worst typo)
        const { best_match3, best_match_rating3 } = findSimilarMatches("hqAddress", keys);
        if (best_match_rating3 >= 0.7 && typeof brand[best_match3] === 'string' && brand[best_match3].length > 0) {
            transformedBrand.headquarters = brand[best_match3];
        }
        // check for headAddress instead
        const { best_match2, best_match_rating2 } = findSimilarMatches("headAddress", keys);
        if (best_match_rating2 >= 0.7 && typeof brand[best_match2] === 'string' && brand[best_match2].length > 0) {
            transformedBrand.headquarters = brand[best_match2];
        }
        // check for near matches of headquarters in the keys just in case a typo (possible typo)
        const { best_match, best_match_rating } = findSimilarMatches("headquarters", keys);
        if (best_match_rating >= 0.7 && typeof brand[best_match] === 'string' && brand[best_match].length > 0) {
            transformedBrand.headquarters = brand[best_match];
        }
        // check if the brandName is an array and has a valid string
        if (Array.isArray(brand.headquarters) && brand.headquarters.length > 0 && typeof brand.headquarters[0] === 'string') {
            transformedBrand.headquarters = brand.headquarters[0].toString();
        }
        // use default value as a fallback
        if (invalidString(transformedBrand.headquarters)) {
            console.log('Headquarters is missing/invalid and couldn\'t find a good fix -> use default value!');
            transformedBrand.headquarters = 'Default Headquarters'; // use default value as a fallback
        }
    } else {
        transformedBrand.headquarters = brand.headquarters.toString();
    }

    return transformedBrand;
}

// export the utility functions
module.exports = {
    validateAndTransformBrandDoc,
    findSimilarMatches,
};