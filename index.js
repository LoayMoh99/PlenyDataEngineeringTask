const Brands = require("./model/brands-schema");
const fs = require("fs");
const { validateAndTransformBrandDoc } = require("./utilis/validator");
const { connectToDb } = require("./service/db");

// connect to the database
connectToDb().then(() => {
  /* 1. Data Transformation */
  /************************ */

  // // read the json file brands.json 
  // const brandsData = fs.readFileSync("brands.json");
  // const brands = JSON.parse(brandsData);

  // // loop over the brands array and insert each brand object into the database
  // brands.forEach((brand) => {
  //   brand._id = brand._id.$oid;
  //   // insert the brand object into the database using save method to handle the validation
  //   const brandDoc = new Brands(brand);
  //   brandDoc.save()
  //     .then((brand_new) => {
  //       console.log("Brand inserted successfully");
  //       console.log(brand_new);
  //     })
  //     .catch((error) => {
  //       // if the insertion failed, try to transform the brand object to be valid based on the schema
  //       const transformedBrand = validateAndTransformBrandDoc(brand);
  //       const brandDoc = new Brands(transformedBrand);
  //       brandDoc.save()
  //         .then((brand_new) => {
  //           console.log("Brand inserted successfully");
  //           console.log(brand_new);
  //         })
  //         .catch((error) => {
  //           console.log("Brand insertion failed");
  //           console.log(error);
  //         });
  //     });
  // });

  /* 2. Data Seeding */
  /***************** */

  //Extend the database by generating 10 new brand documents with correct schema adherence
  // Use any data library (e.g., Faker.js) to create test data for the new entries with different cases
  const faker = require("faker");
  for (let i = 0; i < 10; i++) {
    const brand = {
      brandName: faker.company.companyName(),
      yearFounded: faker.date.past().getFullYear({ min: 1600, max: new Date().getFullYear() }),
      headquarters: faker.address.city(),
      numberOfLocations: faker.datatype.number({ min: 1, max: 100 }),
    };
    console.log(brand);
    // const brandDoc = new Brands(brand);
    // brandDoc.save()
    //   .then((brand_new) => {
    //     console.log("Brand inserted successfully");
    //     console.log(brand_new);
    //   })
    //   .catch((error) => {
    //     console.log("Brand insertion failed");
    //     console.log(error);
    //   });
  }


}).catch((error) => {
  console.log("Connection failed");
  console.log(error);
});
