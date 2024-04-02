const Brands = require("../model/brands-schema");
const mongoose = require('mongoose');
const { validateAndTransformBrandDoc } = require("../utilis/validator");

// create a new brand document with correct schema adherence
async function createBrandDocument(brand) {
    const brandDoc = new Brands(brand);
    try {
        const brand_new = await brandDoc.save();
        console.log("Brand inserted successfully");
        return brand_new;
    } catch (_) {
        // validate the brand document and re-insert it
        const validatedBrand = validateAndTransformBrandDoc(brand);
        const validatedBrandDoc = new Brands(validatedBrand);
        try {
            const brand_new = await validatedBrandDoc.save();
            console.log("Brand inserted successfully");
            return brand_new;
        } catch (error_inner) {
            console.log("Brand insertion failed");
            console.log(error_inner);
            return null;
        }
    }
}

// update the brand document
async function updateBrandDocument(brand) {
    // check if the brand already exists
    let _id = brand?._id?.$oid ?? brand?._id ?? undefined;  // check if the brand has an id
    if (_id === undefined) {
        console.log("Brand doesn't have an Id -> Create a new brand document");
        return await createBrandDocument(brand);
    }
    const brand_res = await Brands.findOne(new mongoose.Types.ObjectId(_id));

    if (brand_res) {
        // update the brand document
        console.log("Brand already exists -> Update the brand document");
        const validatedBrand = validateAndTransformBrandDoc(brand);
        // remove the _id field from the validated brand object to avoid conflicts
        delete validatedBrand._id;
        _id = brand_res._id;
        return await Brands.findOneAndUpdate({ _id }, validatedBrand, { new: true });
    } else {
        // create a new brand document
        return await createBrandDocument(brand);
    }
}

// delete the brand document
async function deleteBrandDocument(brand) {
    // check if the brand already exists
    const _id = brand?._id?.$oid ?? brand?._id ?? undefined;  // check if the brand has an id
    if (_id === undefined) {
        console.log("Brand doesn't exist -> Nothing to delete");
    }
    const brand_res = await Brands.findOne(new mongoose.Types.ObjectId(_id));
    if (brand_res) {
        // delete the brand document
        console.log("Brand exists -> Delete the brand document");
        return await Brands.findOneAndDelete({ _id });
    } else {
        console.log("Brand doesn't exist -> Nothing to delete");
    }
}

// drop all the brand collection
async function dropBrandCollection() {
    // drop the brands collection before seeding the data
    await mongoose.connection.db.dropCollection("brands");
    console.log("Brands collection dropped successfully");
    return true;
}

// get all the brand documents
async function getAllBrandDocuments() {
    const brands = await Brands.find().sort({ updatedAt: 1 }); // sort by updatedAt ascending
    return brands;
}

// get the brand document by id
async function getBrandDocumentById(id) {
    const _id = new mongoose.Types.ObjectId(id ?? ""); // check if the brand has an id
    const brand = await Brands.findOne(_id)
    return brand;
}

// get the brand document by query in general
async function getBrandDocumentsByQuery(query) {
    const brand = await Brands.find(query)
    return brand;
}

// export the functions
module.exports = {
    getAllBrandDocuments,
    getBrandDocumentById,
    getBrandDocumentsByQuery,
    createBrandDocument,
    updateBrandDocument,
    deleteBrandDocument,
    dropBrandCollection,
};
