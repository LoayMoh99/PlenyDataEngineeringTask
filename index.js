const fs = require("fs");
const mongoose = require('mongoose');
const faker = require("faker");
const { dropBrandCollection, updateBrandDocument, getAllBrandDocuments, getBrandDocumentsByQuery } = require("./controllers/brands-controller");
const { connectToDb, closeDbConnection } = require("./service/db");
const { } = require("./controllers/brands-controller");

runApp();

async function runApp() {
  /* 0. Prepare DB (connect and drop collection) */
  /******************************************** */
  // connect to the database
  await connectToDb();
  // drop the brands collection before seeding the data
  await dropBrandCollection();

  /* 1. Data Transformation */
  /************************ */

  // read the json file brands.json 
  const brandsData = fs.readFileSync("brands.json");
  const brands = JSON.parse(brandsData);

  // loop over the brands array and insert each brand object into the database
  for (let i = 0; i < brands.length; i++) {
    // use update function to insert or update the brand document (based on the existence of the brand in the database)
    await updateBrandDocument(brands[i]);
  }

  // get all the brand documents
  const new_brands_before_seed = await getAllBrandDocuments();
  console.log(new_brands_before_seed.length);
  // export the brands collection to a json file
  fs.writeFileSync("brands-beforeseed.json", JSON.stringify(new_brands_before_seed, null, 2));

  /* 2. Data Seeding */
  /***************** */

  // Ad 10 random brand seed objects to the database following the Seeds.xlsx file

  // Case1: Insert a perfect new brand document
  const brand1 = {
    brandName: faker.company.companyName(),
    yearFounded: faker.date.past().getFullYear({ min: 1600, max: new Date().getFullYear() }),
    headquarters: "Testcase 1 : " + faker.address.city(),
    numberOfLocations: faker.datatype.number({ min: 1, max: 100 }),
  };
  // use update function to insert or update the brand document (based on the existence of the brand in the database)
  await updateBrandDocument(brand1);  // Inserted successfully with no errors

  // Case2: Update a brand document with an existing id
  const brand2 = {
    _id: new mongoose.Types.ObjectId('66069ff93007b006635c0245'), // already existed
    brandName: faker.company.companyName(),
    yearFounded: faker.date.past().getFullYear({ min: 1600, max: new Date().getFullYear() }),
    headquarters: "Testcase 2 : " + faker.address.city(),
    numberOfLocations: faker.datatype.number({ min: 1, max: 100 }),
  };
  await updateBrandDocument(brand2);  // Updated successfully with no errors

  // Case3: Insert a new brand document with a typo in field name i.e. brandname
  const brand3 = {
    brandname: faker.company.companyName(),
    yearFounded: faker.date.past().getFullYear({ min: 1600, max: new Date().getFullYear() }),
    headquarters: "Testcase 3 : " + faker.address.city(),
    numberOfLocations: faker.datatype.number({ min: 1, max: 100 }),
  };
  await updateBrandDocument(brand3);  // Get the value from the typo field and Insert Successfully 

  // Case4: Insert a new brand document with an undefined/empty brand name
  const brand4 = {
    yearFounded: faker.date.past().getFullYear({ min: 1600, max: new Date().getFullYear() }),
    headquarters: "Testcase 4 : " + faker.address.city(),
    numberOfLocations: faker.datatype.number({ min: 1, max: 100 }),
  };
  await updateBrandDocument(brand4);
  //Write a default brand name and Insert Successfully 
  /*********************************6*************************/

  // Case5: Insert a new brand document with an array of brand names
  const brand5 = {
    brandName: ["First Element of Brandname Array", faker.company.companyName()],
    yearFounded: faker.date.past().getFullYear({ min: 1600, max: new Date().getFullYear() }),
    headquarters: "Testcase 5 : " + faker.address.city(),
    numberOfLocations: faker.datatype.number({ min: 1, max: 100 }),
  };
  await updateBrandDocument(brand5);  // Get the value of Array[0] and Insert Successfully 

  // Case6: Insert a new brand document with invalid yearFounded field "InvalidYear ; i.e. 2030/ 999 / undefined / null / .."
  const brand6 = {
    brandName: faker.company.companyName(),
    yearFounded: "InvalidYear",
    headquarters: "Testcase 6 : " + faker.address.city(),
    numberOfLocations: faker.datatype.number({ min: 1, max: 100 }),
  };
  await updateBrandDocument(brand6);  // Set the min value instead = 1600 and Insert Successfully  

  // Case7: Insert a new brand document with invalid numberOfLocations field "InvalidNumber ; i.e. -1/ 0 / undefined / null / .."
  const brand7 = {
    brandName: faker.company.companyName(),
    yearFounded: faker.date.past().getFullYear({ min: 1600, max: new Date().getFullYear() }),
    headquarters: "Testcase 7 : " + faker.address.city(),
    numberOfLocations: -99,
  };
  await updateBrandDocument(brand7);  // Set the min value instead = 1 and Insert Successfully

  // Case8: Insert a new brand document with a typo in headquarters field name i.e. headquarter/ headQuarters / headAddress / hqAddress / ..
  const brand8 = {
    brandName: faker.company.companyName(),
    yearFounded: faker.date.past().getFullYear({ min: 1600, max: new Date().getFullYear() }),
    headquarter: "Testcase 8 : " + faker.address.city(),
    numberOfLocations: faker.datatype.number({ min: 1, max: 100 }),
  };
  await updateBrandDocument(brand8);  // Get the value from the typo field and Insert Successfully

  // Case9: Insert a new brand document with an array of headquarters
  const brand9 = {
    brandName: faker.company.companyName(),
    yearFounded: faker.date.past().getFullYear({ min: 1600, max: new Date().getFullYear() }),
    headquarters: ["Testcase 9 : " + faker.address.city()],
    numberOfLocations: faker.datatype.number({ min: 1, max: 100 }),
  };
  await updateBrandDocument(brand9);  // Get the value of Array[0] and Insert Successfully

  // Case10: Insert a new brand document with all above cases (typo in brandname, invalid yearFounded, invalid numberOfLocations, typo in headquarters field name, array of brand names)
  const brand10 = {
    brandname: [faker.company.companyName()],
    yearFounded: "InvalidYear",
    headquarter: "Testcase 10 : " + faker.address.city(),
    numberOfLocations: -1,
  };
  await updateBrandDocument(brand10);  // "Fix all typeos in both fields and set the min value for both invalid field  and Insert Successfully "

  /* 3. Export the Brands collection  */
  /* ******************************** */
  // get all the brand documents
  const new_brands = await getAllBrandDocuments();
  console.log(new_brands.length);
  // export the brands collection to a json file
  fs.writeFileSync("brands-all-new.json", JSON.stringify(new_brands, null, 2));

  // save the brands after seed only in a separate file
  // get all the brand documents with headquarters containing "Testcase"
  // it should return 10 documents (9 new + 1 updated (first doc in the brands.json))
  const test_cases_brands = await getBrandDocumentsByQuery({ headquarters: /Testcase/i });
  fs.writeFileSync("brands-afterseed.json", JSON.stringify(test_cases_brands, null, 2));

}

// close the database connection when the process is interrupted i.e. CTRL+C 
process.on('SIGINT', async function () {
  // close the database connection
  await closeDbConnection();
  process.exit(0);
});