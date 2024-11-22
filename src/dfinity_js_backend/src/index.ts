import {
  query,
  update,
  text,
  StableBTreeMap,
  Variant,
  Vec,
  None,
  Some,
  Ok,
  Err,
  ic,
  Principal,
  nat64,
  Duration,
  Result,
  bool,
  Canister,
} from "azle";
import {
  Ledger,
  binaryAddressFromAddress,
  binaryAddressFromPrincipal,
  hexAddressFromPrincipal,
} from "azle/canisters/ledger";
//@ts-ignore
import { hashCode } from "hashcode";
import { v4 as uuidv4 } from "uuid";
import * as Types from "./types";
import { Type } from "@dfinity/candid/lib/cjs/idl";

/**
 * `productsStorage` - it's a key-value datastructure that is used to store products by sellers.
 * {@link StableBTreeMap} is a self-balancing tree that acts as a durable data storage that keeps data across canister upgrades.
 * For the sake of this contract we've chosen {@link StableBTreeMap} as a storage for the next reasons:
 * - `insert`, `get` and `remove` operations have a constant time complexity - O(1)
 * - data stored in the map survives canister upgrades unlike using HashMap where data is stored in the heap and it's lost after the canister is upgraded
 *
 * Brakedown of the `StableBTreeMap(text, Product)` datastructure:
 * - the key of map is a `productId`
 * - the value in this map is a product itself `Product` that is related to a given key (`productId`)
 *
 * Constructor values:
 * 1) 0 - memory id where to initialize a map
 * 2) 16 - it's a max size of the key in bytes.
 * 3) 1024 - it's a max size of the value in bytes.
 * 2 and 3 are not being used directly in the constructor but the Azle compiler utilizes these values during compile time
 */

const productsStorage = StableBTreeMap(0, text, Types.Product);
const farmersStorage = StableBTreeMap(1, text, Types.Farmer);
const vehiclesStorage = StableBTreeMap(2, text, Types.Vehicle);
const driversStorage = StableBTreeMap(3, text, Types.Driver);
const distributorsCompanyStorage = StableBTreeMap(4, text, Types.DistributorsCompany);
const processingCompanyStorage = StableBTreeMap(5, text, Types.ProcessingCompany);
// const WholesalersStorage = StableBTreeMap(6, text, Types.Wholesalers);
const deliveryTenderStorage = StableBTreeMap(6, text, Types.DeliveryTender);
const deliveryDetailsStorage = StableBTreeMap(7, text, Types.DeliveryDetails);
const FarmerSaleAdvertStorage = StableBTreeMap(8, text, Types.FarmerSaleAdvert);
const pendingDriverReserves = StableBTreeMap(9, nat64, Types.ReserveDriverPayment);
const persistedDriverReserves = StableBTreeMap(10, Principal, Types.ReserveDriverPayment);
const pendingFarmerReserves = StableBTreeMap(11, nat64, Types.ReserveFarmerPayment);
const persistedFarmerReserves = StableBTreeMap(12, Principal, Types.ReserveFarmerPayment);
const pendingDistributorReserves = StableBTreeMap(13, nat64, Types.ReserveDistributorsPayment);
const persistedDistributorReserves = StableBTreeMap(14, Principal, Types.ReserveDistributorsPayment);
const pendingProcessingReserves = StableBTreeMap(15, nat64, Types.ReserveProcessingPayment);
const persistedProcessingReserves = StableBTreeMap(16, Principal, Types.ReserveProcessingPayment);




const PAYMENT_RESERVATION_PERIOD = 12000n; // reservation period in seconds

/* 
    initialization of the Ledger canister. The principal text value is hardcoded because 
    we set it in the `dfx.json`
*/
const icpCanister = Ledger(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"));

export default Canister({

  // ** Start of Product Functions **

  // function to create product using ProductPayload
  createProduct: update(
    [Types.ProductPayload, text],
    Result(Types.Product, Types.Message),
    (payload,farmerId) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }

      const farmerOpt = farmersStorage.get(farmerId);
      if ("None" in farmerOpt) {
        return Err({ NotFound: `farmer with id=${farmerId} not found` });
      }

      const farmer = farmerOpt.Some;
      if (farmer.farmProducts.length > 10) {
        return Err({ NotFound: `farmer with id=${farmerId} has reached the maximum number of products` });
      }


      // Create an event with a unique id generated using UUID v4
      const product = {
        id: uuidv4(),
        price: 0n,
        quantity: 0n,
        owner: farmerId,
        grade: "",
        status: "New",
        packagedDetails: None,
        pickedUp: false,
        packaged: false,
        farmerSold: false,
        distributionSuccesful: false,
        processingSuccesful: false,
        ...payload,
      };
      // Insert the product into the productsStorage and the farmer farmProducts

      farmer.farmProducts.push(product);
      productsStorage.insert(product.id, product);
      return Ok(product);
    }
  ),

  // grade and Sort(add quantity and Price ) products & change status to graded
  gradeProduct: update(
    [Types.GradePayload],
    Result(Types.Product, Types.Message),
    (gradePayload) => {
      const productOpt = productsStorage.get(gradePayload.productId);
      if ("None" in productOpt) {
        return Err({ NotFound: `product with id=${gradePayload.productId} not found` });
      }
      const product = productOpt.Some;
      product.grade = gradePayload.grade; // Give the different grade to the product eg (2kg of Grade A Tomatoes, 5kg of Grade B Tomatoes, etc)
      product.quantity = gradePayload.quantity;
      product.price = gradePayload.price;
      product.status = "Graded";
      console.log("product",product);
      productsStorage.insert(product.id, product);
      return Ok(product);
    }
  ),

  // 

  // function to get all products
  getAllProducts: query([], Vec(Types.Product), () => {
    console.log("productsStorage",productsStorage.values());
    return productsStorage.values();
  }),

  // function to get product by id
  getProduct: query([text], Result(Types.Product, Types.Message), (id) => {
    const productOpt = productsStorage.get(id);
    if ("None" in productOpt) {
      return Err({ NotFound: `product with id=${id} not found` });
    }
    return Ok(productOpt.Some);
  }),

  // function to update product
  updateProduct: update(
    [text, Types.ProductPayload],
    Result(Types.Product, Types.Message),
    (id, payload) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }      
      const productOpt = productsStorage.get(id);
      if ("None" in productOpt) {
        return Err({ NotFound: `product with id=${id} not found` });
      }
      const product = productOpt.Some;
      const updatedProduct = {
        ...product,
        ...payload,
      };
      productsStorage.insert(product.id, updatedProduct);
      return Ok(updatedProduct);
    }
  ),

  // Function to add packaged Details to a product
  addPackagedDetails: update(
    [text, Types.Packaging],
    Result(Types.Product, Types.Message),
    (productId, payload) => {
      const productOpt = productsStorage.get(productId);
      if ("None" in productOpt) {
        return Err({ NotFound: `product with id=${productId} not found` });
      }
      const product = productOpt.Some;
      product.packagedDetails = Some(payload);
      product.status = "Packaged";
      product.packaged = true;
      productsStorage.insert(product.id, product);
      return Ok(product);
    }
  ),

  // Mark product as picked up by the distributor
  markProductAsPickedUp: update(
    [text],
    Result(Types.Product, Types.Message),
    (productId) => {
      const productOpt = productsStorage.get(productId);
      if ("None" in productOpt) {
        return Err({ NotFound: `product with id=${productId} not found` });
      }
      const product = productOpt.Some;
      product.pickedUp = true;
      productsStorage.insert(product.id, product);
      return Ok(product);
    }
  ),

  // get New Products for farmer
  getNewProductsForFarmer: query([text], Vec(Types.Product), (farmerId) => {
    const products = productsStorage.values();
    return products.filter(
      (product) => product.status === "New" && product.owner === farmerId
    );
  }),

  // get Graded Products for farmer
  getGradedProductsForFarmer: query([text], Vec(Types.Product), (farmerId) => {
    const products = productsStorage.values();
    return products.filter(
      (product) => product.status === "Graded" && product.owner === farmerId
    );
  }),

  // getPackagedProductsForFarmer
  getPackagedProductsForFarmer: query([text], Vec(Types.Product), (farmerId) => {
    const products = productsStorage.values();
    return products.filter(
      (product) => product.packaged && product.owner === farmerId && product.status === "Packaged"
    );
  }),

  // ** End of Product Functions **

  // ** Start of Farmer Functions **

  // function to create farmer using FarmerPayload
  createFarmer: update(
    [Types.FarmerPayload],
    Result(Types.Farmer, Types.Message),
    (payload) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }
      // Create an event with a unique id generated using UUID v4
      const farmer = {
        id: uuidv4(),
        owner: ic.caller(),
        farmerRating: 0n,
        farmProducts: [],
        pickedUpProducts: [],
        certification: [],
        ...payload,
      };
      // Insert the event into the eventsStorage
      farmersStorage.insert(farmer.id, farmer);
      return Ok(farmer);
    }
  ),

  // function to get all farmers
  getAllFarmers: query([], Vec(Types.Farmer), () => {
    return farmersStorage.values();
  }),

  // function to get farmer by id
  getFarmer: query([text], Result(Types.Farmer, Types.Message), (id) => {
    const farmerOpt = farmersStorage.get(id);
    if ("None" in farmerOpt) {
      return Err({ NotFound: `farmer with id=${id} not found` });
    }
    return Ok(farmerOpt.Some);
  }),

  // function to update farmer
  updateFarmer: update(
    [text, Types.FarmerPayload],
    Result(Types.Farmer, Types.Message),
    (id, payload) => {
      const farmerOpt = farmersStorage.get(id);
      if ("None" in farmerOpt) {
        return Err({ NotFound: `farmer with id=${id} not found` });
      }
      const farmer = farmerOpt.Some;
      const updatedFarmer = {
        ...farmer,
        ...payload,
      };
      farmersStorage.insert(farmer.id, updatedFarmer);
      return Ok(updatedFarmer);
    }
  ),

  // function to add farm product to farmer 
  addFarmProduct: update(
    [text, text],
    Result(Types.Farmer, Types.Message),
    (farmerId, productId) => {
      const farmerOpt = farmersStorage.get(farmerId);
      if ("None" in farmerOpt) {
        return Err({ NotFound: `farmer with id=${farmerId} not found` });
      }
      const productOpt = productsStorage.get(productId);
      if ("None" in productOpt) {
        return Err({ NotFound: `product with id=${productId} not found` });
      }

      const farmer = farmerOpt.Some;
      const product = productOpt.Some;
      farmer.farmProducts.push(product);
      farmersStorage.insert(farmer.id, farmer);
      return Ok(farmer);
    }
  ),

  // function to add picked up product to farmer check if the product pickedUp is true
  addPickedUpProduct: update(
    [text, text],
    Result(Types.Farmer, Types.Message),
    (farmerId, productId) => {
      const farmerOpt = farmersStorage.get(farmerId);
      if ("None" in farmerOpt) {
        return Err({ NotFound: `farmer with id=${farmerId} not found` });
      }
      const productOpt = productsStorage.get(productId);
      if ("None" in productOpt) {
        return Err({ NotFound: `product with id=${productId} not found` });
      }



      const farmer = farmerOpt.Some;
      const product = productOpt.Some;
      // Mark product as picked up by the distributor
      product.pickedUp = true;
      farmer.pickedUpProducts.push(product);
      farmersStorage.insert(farmer.id, farmer);
      return Ok(farmer);
    }
  ),

  // Mark product as farmerSold by the farmer
  markProductAsFarmerSold: update(
    [text],
    Result(Types.Product, Types.Message),
    (productId) => {
      const productOpt = productsStorage.get(productId);
      if ("None" in productOpt) {
        return Err({ NotFound: `product with id=${productId} not found` });
      }
      const product = productOpt.Some;
      product.farmerSold = true;
      productsStorage.insert(product.id, product);
      return Ok(product);
    }
  ),


  // get all Farmer Sold Products of a farmer
  getFarmerSoldProducts: query([text], Vec(Types.Product), (farmerId) => {
    const products = productsStorage.values();
    return products.filter(
      (product) => product.farmerSold && product.owner === farmerId
    );
  }),

  // function to Update Farmer Rating based on the product sold have a Condition of rating eg 1-5
  updateFarmerRating: update(
    [text],
    Result(Types.Farmer, Types.Message),
    (farmerId) => {
      const farmerOpt = farmersStorage.get(farmerId);
      if ("None" in farmerOpt) {
        return Err({ NotFound: `farmer with id=${farmerId} not found` });
      }
      const farmer = farmerOpt.Some;
      const products = productsStorage.values();
      const farmerSoldProducts = products.filter(
        (product) => product.farmerSold && product.owner === farmerId
      );
      const count = BigInt(farmerSoldProducts.length);
      if (count > 10n) {
        farmer.farmerRating = 5n;
      } else if (count > 5n) {
        farmer.farmerRating = 4n;
      } else if (count > 3n) {
        farmer.farmerRating = 3n;
      } else if (count > 1n) {
        farmer.farmerRating = 2n;
      } else if (count > 0n) {
        farmer.farmerRating = 1n;
      }
      farmersStorage.insert(farmer.id, farmer);
      return Ok(farmer);
    }
  ),

  // function to add Certifications to a farmer
  addCertification: update(
    [text, text],
    Result(Types.Farmer, Types.Message),
    (farmerId, certification) => {
      const farmerOpt = farmersStorage.get(farmerId);
      if ("None" in farmerOpt) {
        return Err({ NotFound: `farmer with id=${farmerId} not found` });
      }
      const farmer = farmerOpt.Some;
      farmer.certification.push(certification);
      farmersStorage.insert(farmer.id, farmer);
      return Ok(farmer);
    }
  ),

  // ** End of Farmer Functions **

  // ** Start of Vehicle Functions **

  // function to create vehicle using VehiclePayload
  createVehicle: update(
    [Types.VehiclePayload, text],
    Result(Types.Vehicle, Types.Message),
    (payload,distributorId) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }
      // Create an event with a unique id generated using UUID v4
      const vehicle = {
        id: uuidv4(),
        owner: distributorId,
        ...payload,
      };
      // Insert the event into the eventsStorage
      vehiclesStorage.insert(vehicle.id, vehicle);
      return Ok(vehicle);
    }
  ),

  // function to get all vehicles
  getAllVehicles: query([], Vec(Types.Vehicle), () => {
    return vehiclesStorage.values();
  }),

  // function to get vehicle by id
  getVehicle: query([text], Result(Types.Vehicle, Types.Message), (id) => {
    const vehicleOpt = vehiclesStorage.get(id);
    if ("None" in vehicleOpt) {
      return Err({ NotFound: `vehicle with id=${id} not found` });
    }
    return Ok(vehicleOpt.Some);
  }),

  // function to update vehicle
  updateVehicle: update(
    [text, Types.VehiclePayload],
    Result(Types.Vehicle, Types.Message),
    (id, payload) => {
      const vehicleOpt = vehiclesStorage.get(id);
      if ("None" in vehicleOpt) {
        return Err({ NotFound: `vehicle with id=${id} not found` });
      }
      const vehicle = vehicleOpt.Some;
      const updatedVehicle = {
        ...vehicle,
        ...payload,
      };
      vehiclesStorage.insert(vehicle.id, updatedVehicle);
      return Ok(updatedVehicle);
    }
  ),

  // function to get all vehicles created by a distributor company
  getVehiclesByDistributorCompany: query(
    [text],
    Vec(Types.Vehicle),
    (companyId) => {
      const vehicles = vehiclesStorage.values();
      return vehicles.filter(
        (vehicle) => vehicle.owner === companyId
      );
    }
  ),

  // ** End of Vehicle Functions **

  // **Start of Driver Functions**
  
  // function to create driver using DriverPayload
  createDriver: update(
    [Types.DriverPayload],
    Result(Types.Driver, Types.Message),
    (payload) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }
      // Create an event with a unique id generated using UUID v4
      const driver = {
        id: uuidv4(),
        owner: ic.caller(),
        driverRating: 0n,
        assignedCompany: false,
        driverStatus: "Active",
        qualifications: [],
        assignedVehicle: None,
        ...payload,
      };
      // Insert the event into the eventsStorage
      driversStorage.insert(driver.id, driver);
      return Ok(driver);
    }
  ),

  // function to get all drivers
  getAllDrivers: query([], Vec(Types.Driver), () => {
    return driversStorage.values();
  }),

  // function to get driver by id
  getDriver: query([text], Result(Types.Driver, Types.Message), (id) => {
    const driverOpt = driversStorage.get(id);
    if ("None" in driverOpt) {
      return Err({ NotFound: `driver with id=${id} not found` });
    }
    return Ok(driverOpt.Some);
  }),

  // function to update driver
  updateDriver: update(
    [text, Types.DriverPayload],
    Result(Types.Driver, Types.Message),
    (id, payload) => {
      const driverOpt = driversStorage.get(id);
      if ("None" in driverOpt) {
        return Err({ NotFound: `driver with id=${id} not found` });
      }
      const driver = driverOpt.Some;
      const updatedDriver = {
        ...driver,
        ...payload,
      };
      driversStorage.insert(driver.id, updatedDriver);
      return Ok(updatedDriver);
    }
  ),

  // function to add qualification to driver
  addQualification: update(
    [text, text],
    Result(Types.Driver, Types.Message),
    (driverId, qualification) => {
      const driverOpt = driversStorage.get(driverId);
      if ("None" in driverOpt) {
        return Err({ NotFound: `driver with id=${driverId} not found` });
      }
      const driver = driverOpt.Some;
      driver.qualifications.push(qualification);
      driversStorage.insert(driver.id, driver);
      return Ok(driver);
    }
  ),

  // function to assign vehicle to driver
  assignVehicle: update(
    [text, text],
    Result(Types.Driver, Types.Message),
    (driverId, vehicleId) => {
      const driverOpt = driversStorage.get(driverId);
      if ("None" in driverOpt) {
        return Err({ NotFound: `driver with id=${driverId} not found` });
      }
      const vehicleOpt = vehiclesStorage.get(vehicleId);
      if ("None" in vehicleOpt) {
        return Err({ NotFound: `vehicle with id=${vehicleId} not found` });
      }
      const driver = driverOpt.Some;
      const vehicle = vehicleOpt.Some;
      driver.assignedVehicle = Some(vehicle);
      driversStorage.insert(driver.id, driver);
      return Ok(driver);
    }
  ),

  // **End of Driver Functions**

  // **Start of Distributors Company Functions**

  // function to create distributor company using DistributorsCompanyPayload
  createDistributorsCompany: update(
    [Types.DistributorsCompanyPayload],
    Result(Types.DistributorsCompany, Types.Message),
    (payload) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }
      // Create an event with a unique id generated using UUID v4
      const distributorCompany = {
        id: uuidv4(),
        owner: ic.caller(),
        drivers: [],
        transportationFleet: [],
        completeproductsDistribution: [],
        ...payload,
      };
      // Insert the event into the eventsStorage
      distributorsCompanyStorage.insert(distributorCompany.id, distributorCompany);
      return Ok(distributorCompany);
    }
  ),

  // function to get all distributor companies
  getAllDistributorsCompanies: query([], Vec(Types.DistributorsCompany), () => {
    return distributorsCompanyStorage.values();
  }),

  // function to get distributor company by id
  getDistributorsCompany: query(
    [text],
    Result(Types.DistributorsCompany, Types.Message),
    (id) => {
      const distributorCompanyOpt = distributorsCompanyStorage.get(id);
      if ("None" in distributorCompanyOpt) {
        return Err({ NotFound: `distributor company with id=${id} not found` });
      }
      return Ok(distributorCompanyOpt.Some);
    }
  ),

  // function to update distributor company
  updateDistributorsCompany: update(
    [text, Types.DistributorsCompanyPayload],
    Result(Types.DistributorsCompany, Types.Message),
    (id, payload) => {
      const distributorCompanyOpt = distributorsCompanyStorage.get(id);
      if ("None" in distributorCompanyOpt) {
        return Err({ NotFound: `distributor company with id=${id} not found` });
      }
      const distributorCompany = distributorCompanyOpt.Some;
      const updatedDistributorCompany = {
        ...distributorCompany,
        ...payload,
      };
      distributorsCompanyStorage.insert(distributorCompany.id, updatedDistributorCompany);
      return Ok(updatedDistributorCompany);
    }
  ),

  // function to add driver to distributor company
  addDriverToDistributorCompany: update(
    [text, text],
    Result(Types.DistributorsCompany, Types.Message),
    (companyId, driverId) => {
      const distributorCompanyOpt = distributorsCompanyStorage.get(companyId);
      if ("None" in distributorCompanyOpt) {
        return Err({
          NotFound: `distributor company with id=${companyId} not found`,
        });
      }
      const distributorCompany = distributorCompanyOpt.Some;
      const driverOpt = driversStorage.get(driverId);
      if ("None" in driverOpt) {
        return Err({ NotFound: `driver with id=${driverId} not found` });
      }
      // Change assigned company of the driver
      const driver = driverOpt.Some;
      driver.assignedCompany = true;

      // Add driver to distributor company
      distributorCompany.drivers.push(driver);
      distributorsCompanyStorage.insert(distributorCompany.id, distributorCompany);
      driversStorage.insert(driver.id, driver);
      return Ok(distributorCompany);
    }
  ),

  // function to get drivers in a distributor company
  getDriversInDistributorCompany: query(
    [text],
    Vec(Types.Driver),
    (companyId) => {
      const distributorCompanyOpt = distributorsCompanyStorage.get(companyId);
      if ("None" in distributorCompanyOpt) {
        return [];
      }
      const distributorCompany = distributorCompanyOpt.Some;
      return distributorCompany.drivers;
    }
  ),
  // function to add vehicle to distributor company
  addVehicleToDistributorCompany: update(
    [text, text],
    Result(Types.DistributorsCompany, Types.Message),
    (companyId, vehicleId) => {
      const distributorCompanyOpt = distributorsCompanyStorage.get(companyId);
      if ("None" in distributorCompanyOpt) {
        return Err({
          NotFound: `distributor company with id=${companyId} not found`,
        });
      }
      const distributorCompany = distributorCompanyOpt.Some;
      const vehicleOpt = vehiclesStorage.get(vehicleId);
      if ("None" in vehicleOpt) {
        return Err({ NotFound: `vehicle with id=${vehicleId} not found` });
      }
      const vehicle = vehicleOpt.Some;
      distributorCompany.transportationFleet.push(vehicle);
      distributorsCompanyStorage.insert(distributorCompany.id, distributorCompany);
      return Ok(distributorCompany);
    }
  ),

  // function to get vehicles in a distributor company
  getVehiclesInDistributorCompany: query(
    [text],
    Vec(Types.Vehicle),
    (companyId) => {
      const distributorCompanyOpt = distributorsCompanyStorage.get(companyId);
      if ("None" in distributorCompanyOpt) {
        return [];
      }
      const distributorCompany = distributorCompanyOpt.Some;
      return distributorCompany.transportationFleet;
    }
  ),

  // function to add product category to distributor company with product.distributionSuccesful
  // Marks the product as distributed
  addCompleteproductsDistributionToDistributorCompany: update(
    [text, text],
    Result(Types.DistributorsCompany, Types.Message),
    (companyId, productId) => {
      const distributorCompanyOpt = distributorsCompanyStorage.get(companyId);
      if ("None" in distributorCompanyOpt) {
        return Err({
          NotFound: `distributor company with id=${companyId} not found`,
        });
      }
      const distributorCompany = distributorCompanyOpt.Some;
      const productOpt = productsStorage.get(productId);
      if ("None" in productOpt) {
        return Err({ NotFound: `product with id=${productId} not found` });
      }
      const product = productOpt.Some;
      product.distributionSuccesful = true;
      distributorCompany.completeproductsDistribution.push(product);
      distributorsCompanyStorage.insert(distributorCompany.id, distributorCompany);
      return Ok(distributorCompany);
    }
  ),

  // function to get CompleteproductsDistribution in a distributor company
  getCompleteproductsDistributionInDistributorCompany: query(
    [text],
    Vec(Types.Product),
    (companyId) => {
      const distributorCompanyOpt = distributorsCompanyStorage.get(companyId);
      if ("None" in distributorCompanyOpt) {
        return [];
      }
      const distributorCompany = distributorCompanyOpt.Some;
      return distributorCompany.completeproductsDistribution;
    }
  ),

  // **End of Distributors Company Functions**

  // **Start of Processing Company Functions**

  // function to create processing company using ProcessingCompanyPayload
  createProcessingCompany: update(
    [Types.ProcessingCompanyPayload],
    Result(Types.ProcessingCompany, Types.Message),
    (payload) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }
      // Create an event with a unique id generated using UUID v4
      const processingCompany = {
        id: uuidv4(),
        owner: ic.caller(),
        productsSuccesfulProcessing: [],
        ...payload,
      };
      // Insert the event into the eventsStorage
      processingCompanyStorage.insert(processingCompany.id, processingCompany);
      return Ok(processingCompany);
    }
  ),

  // function to get all processing companies
  getAllProcessingCompanies: query([], Vec(Types.ProcessingCompany), () => {
    return processingCompanyStorage.values();
  }),

  // function to get processing company by id
  getProcessingCompany: query(
    [text],
    Result(Types.ProcessingCompany, Types.Message),
    (id) => {
      const processingCompanyOpt = processingCompanyStorage.get(id);
      if ("None" in processingCompanyOpt) {
        return Err({ NotFound: `processing company with id=${id} not found` });
      }
      return Ok(processingCompanyOpt.Some);
    }
  ),

  // function to update processing company
  updateProcessingCompany: update(
    [text, Types.ProcessingCompanyPayload],
    Result(Types.ProcessingCompany, Types.Message),
    (id, payload) => {
      const processingCompanyOpt = processingCompanyStorage.get(id);
      if ("None" in processingCompanyOpt) {
        return Err({ NotFound: `processing company with id=${id} not found` });
      }
      const processingCompany = processingCompanyOpt.Some;
      const updatedProcessingCompany = {
        ...processingCompany,
        ...payload,
      };
      processingCompanyStorage.insert(processingCompany.id, updatedProcessingCompany);
      return Ok(updatedProcessingCompany);
    }
  ),

  // function to add productsSuccesfulProcessing to processing company
  // Marks the product as processed
  addProductsSuccesfulProcessing: update(
    [text, text],
    Result(Types.ProcessingCompany, Types.Message),
    (companyId, productId) => {
      const processingCompanyOpt = processingCompanyStorage.get(companyId);
      if ("None" in processingCompanyOpt) {
        return Err({
          NotFound: `processing company with id=${companyId} not found`,
        });
      }
      const processingCompany = processingCompanyOpt.Some;
      const productOpt = productsStorage.get(productId);
      if ("None" in productOpt) {
        return Err({ NotFound: `product with id=${productId} not found` });
      }
      const product = productOpt.Some;
      product.processingSuccesful = true;
      processingCompany.productsCategories.push(product);
      processingCompanyStorage.insert(processingCompany.id, processingCompany);
      return Ok(processingCompany);
    }
  ),

  // function to get productsSuccesfulProcessing in a processing company
  getProductsSuccesfulProcessingInProcessingCompany: query(
    [text],
    Vec(Types.Product),
    (companyId) => {
      const processingCompanyOpt = processingCompanyStorage.get(companyId);
      if ("None" in processingCompanyOpt) {
        return [];
      }
      const processingCompany = processingCompanyOpt.Some;
      return processingCompany.productsSuccesfulProcessing;
    }
  ),

  // **End of Processing Company Functions**

  // **Start of Delivery Details Functions**

  // function to create delivery details using DeliveryDetailsPayload
  createDeliveryDetails: update(
    [Types.DeliveryDetailsPayload],
    Result(Types.DeliveryDetails, Types.Message),
    (payload) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }
      // Create an event with a unique id generated using UUID v4
      const deliveryDetails = {
        id: uuidv4(),
        deliveryStatus: "New",
        driverId: None,
        deliveredDate: None,
        ...payload,
      };
      // Insert the event into the eventsStorage
      deliveryDetailsStorage.insert(deliveryDetails.id, deliveryDetails);
      return Ok(deliveryDetails);
    }
  ),

  // Add a product to delivery details
  // addProductToDeliveryDetails: update(
  //   [text, text],
  //   Result(Types.DeliveryDetails, Types.Message),
  //   (deliveryId, productId) => {
  //     const deliveryDetailsOpt = deliveryDetailsStorage.get(deliveryId);
  //     if ("None" in deliveryDetailsOpt) {
  //       return Err({
  //         NotFound: `delivery details with id=${deliveryId} not found`,
  //       });
  //     }
  //     const deliveryDetails = deliveryDetailsOpt.Some;
  //     const productOpt = productsStorage.get(productId);
  //     if ("None" in productOpt) {
  //       return Err({ NotFound: `product with id=${productId} not found` });
  //     }
  //     const product = productOpt.Some;
  //     deliveryDetails.product = Some(product);
  //     deliveryDetailsStorage.insert(deliveryDetails.id, deliveryDetails);
  //     return Ok(deliveryDetails);
  //   }
  // ),

  // Add a driverId to delivery details
  addDriverIdToDeliveryDetails: update(
    [text, text],
    Result(Types.DeliveryDetails, Types.Message),
    (deliveryId, driverId) => {
      const deliveryDetailsOpt = deliveryDetailsStorage.get(deliveryId);
      if ("None" in deliveryDetailsOpt) {
        return Err({
          NotFound: `delivery details with id=${deliveryId} not found`,
        });
      }
      const deliveryDetails = deliveryDetailsOpt.Some;
      const driverOpt = driversStorage.get(driverId);
      if ("None" in driverOpt) {
        return Err({ NotFound: `driver with id=${driverId} not found` });
      }
     
      deliveryDetails.driverId = Some(driverId);
      deliveryDetailsStorage.insert(deliveryDetails.id, deliveryDetails);
      return Ok(deliveryDetails);
    }
  ),

  // Update on delivery date of delivery details
  updateDeliveryDate: update(
    [text, text],
    Result(Types.DeliveryDetails, Types.Message),
    (deliveryId, date) => {
      const deliveryDetailsOpt = deliveryDetailsStorage.get(deliveryId);
      if ("None" in deliveryDetailsOpt) {
        return Err({
          NotFound: `delivery details with id=${deliveryId} not found`,
        });
      }
      const deliveryDetails = deliveryDetailsOpt.Some;
      deliveryDetails.deliveredDate = Some(date);
      deliveryDetailsStorage.insert(deliveryDetails.id, deliveryDetails);
      return Ok(deliveryDetails);
    }
  ),

  // function to get all delivery details
  getAllDeliveryDetails: query([], Vec(Types.DeliveryDetails), () => {
    return deliveryDetailsStorage.values();
  }),

  // deliveryStatus mark as picked
  markDeliveryDetailsAsPicked: update(
    [text],
    Result(Types.DeliveryDetails, Types.Message),
    (deliveryId) => {
      const deliveryDetailsOpt = deliveryDetailsStorage.get(deliveryId);
      if ("None" in deliveryDetailsOpt) {
        return Err({
          NotFound: `delivery details with id=${deliveryId} not found`,
        });
      }
      const deliveryDetails = deliveryDetailsOpt.Some;
      deliveryDetails.deliveryStatus = "Picked";
      deliveryDetailsStorage.insert(deliveryDetails.id, deliveryDetails);
      return Ok(deliveryDetails);
    }
  ),

  // mark as Completed
  markDeliveryDetailsAsCompleted: update(
    [text],
    Result(Types.DeliveryDetails, Types.Message),
    (deliveryId) => {
      const deliveryDetailsOpt = deliveryDetailsStorage.get(deliveryId);
      if ("None" in deliveryDetailsOpt) {
        return Err({
          NotFound: `delivery details with id=${deliveryId} not found`,
        });
      }
      const deliveryDetails = deliveryDetailsOpt.Some;
      deliveryDetails.deliveryStatus = "Completed";
      deliveryDetailsStorage.insert(deliveryDetails.id, deliveryDetails);
      return Ok(deliveryDetails);
    }
  ),

  // get Delivery that are completed for a distributor company
  getCompletedDeliveryDetailsForDistributorCompany: query(
    [text],
    Vec(Types.DeliveryDetails),
    (companyId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "Completed" &&
          deliveryDetail.distributorsId === companyId
      );
    }
  ),

  // get Delivery Tender using deliveryDetailsId for a distributor company having check tender ACcepted == true
  getTenderForDeliveryDetailsForDistributorCompany: query(
    [text,text],
    Result(Types.DeliveryTender, Types.Message),
    (companyId,deliveryDetailsId) => {
      // get all tenders
      const deliveryTender = deliveryTenderStorage.values();
      console.log("deliveryTender",deliveryTender)
      // for loop to check if the tender is accepted and the distributorId is the same as the companyId && deliveryDetailsId is the same as the deliveryDetailsId
      for(let i = 0; i < deliveryTender.length; i++){
        if(deliveryTender[i].accepted && deliveryTender[i].distributorsId === companyId && deliveryTender[i].DeliveryDetailsId === deliveryDetailsId){
          console.log("found",deliveryTender[i])
          return Ok(deliveryTender[i]);
        }
      }
      return Err({ NotFound: `delivery tender with id=${deliveryDetailsId} not found` });
    }
  ),

  // get Tender for Processing Company
  getTenderForDeliveryDetailsForProcessingCompany: query(
    [text,text],
    Result(Types.DeliveryTender, Types.Message),
    (companyId,deliveryDetailsId) => {
      // get all tenders
      const deliveryTender = deliveryTenderStorage.values();
      console.log("deliveryTender",deliveryTender)
      // for loop to check if the tender is accepted and the distributorId is the same as the companyId && delivery
      for(let i = 0; i < deliveryTender.length; i++){
        if(deliveryTender[i].accepted && deliveryTender[i].processorsId === companyId && deliveryTender[i].DeliveryDetailsId === deliveryDetailsId){
          console.log("found",deliveryTender[i])
          return Ok(deliveryTender[i]);
        }
      }
      return Err({ NotFound: `delivery tender with id=${deliveryDetailsId} not found` });
    }
  ),

  // get Delivery that are completed for a processing company
  getCompletedDeliveryDetailsForProcessingCompany: query(
    [text],
    Vec(Types.DeliveryDetails),
    (companyId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "Completed" &&
          deliveryDetail.processorsId === companyId
      );
    }
  ),

  // get Delivery that are completed for a driver
  getCompletedDeliveryDetailsForDriver: query(
    [text],
    Vec(Types.DeliveryDetails),
    (driverId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "Completed" &&
          deliveryDetail.driverId.Some === driverId
      );
    }
  ),

  //  get delivery details that are picked up for delivery details assigned to a driver
  getDeliveryDetailsPickedUp: query([text], Vec(Types.DeliveryDetails), (driverId) => {
    const deliveryDetails = deliveryDetailsStorage.values();
    return deliveryDetails.filter(
      (deliveryDetail) =>
        deliveryDetail.deliveryStatus === "Picked" &&
        deliveryDetail.driverId.Some === driverId
    );
  }),

  // getDeliveryDetailsPickedUp for a distributor company
  getDeliveryDetailsPickedUpForDistributorCompany: query(
    [text],
    Vec(Types.DeliveryDetails),
    (companyId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "Picked" &&
          deliveryDetail.distributorsId === companyId
      );
    } 
  ),

  // function to get delivery details by id
  getDeliveryDetails: query(
    [text],
    Result(Types.DeliveryDetails, Types.Message),
    (id) => {
      const deliveryDetailsOpt = deliveryDetailsStorage.get(id);
      if ("None" in deliveryDetailsOpt) {
        return Err({ NotFound: `delivery details with id=${id} not found` });
      }
      return Ok(deliveryDetailsOpt.Some);
    }
  ),

  // function to update delivery details
  updateDeliveryDetails: update(
    [text, Types.DeliveryDetailsPayload],
    Result(Types.DeliveryDetails, Types.Message),
    (id, payload) => {
      const deliveryDetailsOpt = deliveryDetailsStorage.get(id);
      if ("None" in deliveryDetailsOpt) {
        return Err({ NotFound: `delivery details with id=${id} not found` });
      }
      const deliveryDetails = deliveryDetailsOpt.Some;
      const updatedDeliveryDetails = {
        ...deliveryDetails,
        ...payload,
      };
      deliveryDetailsStorage.insert(deliveryDetails.id, updatedDeliveryDetails);
      return Ok(updatedDeliveryDetails);
    }
  ),

  // get active delivery with status Accepted and driver assigned == Null
  getActiveDeliveryDetails: query([], Vec(Types.DeliveryDetails), () => {
    const deliveryDetails = deliveryDetailsStorage.values();
    return deliveryDetails.filter(
      (deliveryDetail) =>
        deliveryDetail.deliveryStatus === "Accepted" &&
        deliveryDetail.driverId.None === null
    );
  }),

  // get delivery details with status New in a distributors company
  getNewDeliveryDetailsInDistributorsCompany: query(
    [text],
    Vec(Types.DeliveryDetails),
    (companyId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "New" &&
          deliveryDetail.distributorsId === companyId
      );
    }
  ),

  // get delivery details with status New in a processing company
  getNewDeliveryDetailsInProcessingCompany: query(
    [text],
    Vec(Types.DeliveryDetails),
    (companyId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "New" &&
          deliveryDetail.processorsId === companyId
      );
    }
  ),

  // get delivery details with status Tendered in a processing company
  getTenderedDeliveryDetailsInProcessingCompany: query(
    [text],
    Vec(Types.DeliveryDetails),
    (companyId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "Tendered" &&
          deliveryDetail.processorsId === companyId
      );
    }
  ),

  // get delivery details with status Tendered in a distributors company
  getTenderedDeliveryDetailsInDistributorsCompany: query(
    [text],
    Vec(Types.DeliveryDetails),
    (companyId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "Tendered" &&
          deliveryDetail.distributorsId === companyId
      );
    }
  ),

  // get delivery details with status Completed in a processing company
  getCompletedDeliveryDetailsInProcessingCompany: query(
    [text],
    Vec(Types.DeliveryDetails),
    (companyId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "Completed" &&
          deliveryDetail.processorsId === companyId
      );
    }
  ),

  // get Delivery details assigned to a driver
  getDeliveryDetailsAssignedToDriver: query(
    [text],
    Vec(Types.DeliveryDetails),
    (driverId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.driverId.Some === driverId
      );
    }
  ),

  // get Delivery details assigned to a driver the recent one
  getRecentDeliveryDetailsAssignedToDriver: query(
    [text],
    Result(Types.DeliveryDetails, Types.Message),
    (driverId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      const driverDeliveryDetails = deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.driverId.Some === driverId
      );
      if (driverDeliveryDetails.length === 0) {
        return Err({ NotFound: `No delivery details assigned to driver with id=${driverId}` });
      }
      return Ok(driverDeliveryDetails[driverDeliveryDetails.length - 1]);
    }
  ),

  // get delivery details with status Completed in a distributors company
  getCompletedDeliveryDetailsInDistributorsCompany: query(
    [text],
    Vec(Types.DeliveryDetails),
    (companyId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "Completed" &&
          deliveryDetail.distributorsId === companyId
      );
    }
  ),

  // get delivery details with status Accepted in a distributors company
  getAcceptedDeliveryDetailsInDistributorsCompany: query(
    [text],
    Vec(Types.DeliveryDetails),
    (companyId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "Accepted" &&
          deliveryDetail.distributorsId === companyId
      );
    }
  ),


  // ** End of Delivery Details Functions **

  // ** Start of Delivery Tender Functions **

  // Function to create deliveryTender
  createDeliveryTender: update(
    [Types.DeliveryTenderPayload],
    Result(Types.DeliveryTender, Types.Message),
    (payload) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }

      // Calculate the total cost of the delivery
      const deliveryCost = payload.deliveryWeight * payload.costPerWeight;
      const totalCost = deliveryCost + payload.additionalCost;
      // Create an event with a unique id generated using UUID v4
      const deliveryTender = {
        id: uuidv4(),
        totalCost: totalCost,
        accepted: false,
        ...payload,
      };

      const deliveryDetailsOpt = deliveryDetailsStorage.get(payload.DeliveryDetailsId);
      if ("None" in deliveryDetailsOpt) {
        return Err({ NotFound: `delivery details with id=${payload.DeliveryDetailsId} not found` });
      }
      const deliveryDetails = deliveryDetailsOpt.Some;
      deliveryDetails.deliveryStatus = "Tendered";
      deliveryDetailsStorage.insert(deliveryDetails.id, deliveryDetails);
      // Insert the event into the eventsStorage
      deliveryTenderStorage.insert(deliveryTender.id, deliveryTender);
      return Ok(deliveryTender);
    }
  ),

  // Function to accept a Tender
  acceptDeliveryTender: update(
    [text],
    Result(Types.DeliveryTender, Types.Message),
    (tenderId) => {
      const deliveryTenderOpt = deliveryTenderStorage.get(tenderId);
      if ("None" in deliveryTenderOpt) {
        return Err({ NotFound: `delivery tender with id=${tenderId} not found` });
      }
      const deliveryTender = deliveryTenderOpt.Some;
      const deliveryDetailsOpt = deliveryDetailsStorage.get(deliveryTender.DeliveryDetailsId);
      if ("None" in deliveryDetailsOpt) {
        return Err({ NotFound: `delivery details with id=${deliveryTender.DeliveryDetailsId} not found` });
      }
      const deliveryDetails = deliveryDetailsOpt.Some;
      deliveryDetails.deliveryStatus = "Accepted";
      deliveryDetailsStorage.insert(deliveryDetails.id, deliveryDetails);

      deliveryTender.accepted = true;
      deliveryTenderStorage.insert(deliveryTender.id, deliveryTender);
      return Ok(deliveryTender);
    }
  ),

  // function to get delivery details of a delivery tender that has been accepted
  getAcceptedDeliveryTenders: query([], Vec(Types.DeliveryTender), () => {
    const deliveryTenders = deliveryTenderStorage.values();
    return deliveryTenders.filter((deliveryTender) => deliveryTender.accepted);
  }),

  // function to get all delivery tenders
  getAllDeliveryTenders: query([], Vec(Types.DeliveryTender), () => {
    return deliveryTenderStorage.values();
  }),

  // function to get delivery tender by id
  getDeliveryTender: query(
    [text],
    Result(Types.DeliveryTender, Types.Message),
    (id) => {
      const deliveryTenderOpt = deliveryTenderStorage.get(id);
      if ("None" in deliveryTenderOpt) {
        return Err({ NotFound: `delivery tender with id=${id} not found` });
      }
      return Ok(deliveryTenderOpt.Some);
    }
  ),

  // function to update delivery tender
  updateDeliveryTender: update(
    [text, Types.DeliveryTenderPayload],
    Result(Types.DeliveryTender, Types.Message),
    (id, payload) => {
      const deliveryTenderOpt = deliveryTenderStorage.get(id);
      if ("None" in deliveryTenderOpt) {
        return Err({ NotFound: `delivery tender with id=${id} not found` });
      }
      const deliveryTender = deliveryTenderOpt.Some;
      const updatedDeliveryTender = {
        ...deliveryTender,
        ...payload,
      };
      deliveryTenderStorage.insert(deliveryTender.id, updatedDeliveryTender);
      return Ok(updatedDeliveryTender);
    }
  ),

  // function to get all delivery tenders of a processing company
  getDeliveryTendersOfProcessingCompany: query(
    [text],
    Vec(Types.DeliveryTender),
    (companyId) => {
      const deliveryTenders = deliveryTenderStorage.values();
      return deliveryTenders.filter(
        (deliveryTender) => deliveryTender.processorsId === companyId
      );
    }
  ),

  // function to get all delivery tenders of a distributor company
  getDeliveryTendersOfDistributorCompany: query(
    [text],
    Vec(Types.DeliveryTender),
    (companyId) => {
      const deliveryTenders = deliveryTenderStorage.values();
      return deliveryTenders.filter(
        (deliveryTender) => deliveryTender.distributorsId === companyId
      );
    }
  ),

  // ** End of Delivery Tender Functions **

  // ** Start of Farmer Sales Advert Functions **

  // function to create farmerSalesAdvert using FarmerSalesAdvertPayload
  createFarmerSalesAdvert: update(
    [Types.FarmerSaleAdvertPayload],
    Result(Types.FarmerSaleAdvert, Types.Message),
    (payload) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }
      // Create an event with a unique id generated using UUID v4
      const farmerSalesAdvert = {
        id: uuidv4(),
        status: "Active",
        farmerPaid: false,
        ...payload,
      };
      // Insert the event into the eventsStorage
      FarmerSaleAdvertStorage.insert(farmerSalesAdvert.id, farmerSalesAdvert);
      return Ok(farmerSalesAdvert);
    }
  ),

  // function to get all farmer sales adverts
  getAllFarmerSalesAdverts: query([], Vec(Types.FarmerSaleAdvert), () => {
    return FarmerSaleAdvertStorage.values();
  }),

  // function to get farmer sales advert by id
  getFarmerSalesAdvert: query(
    [text],
    Result(Types.FarmerSaleAdvert, Types.Message),
    (id) => {
      const farmerSalesAdvertOpt = FarmerSaleAdvertStorage.get(id);
      if ("None" in farmerSalesAdvertOpt) {
        return Err({ NotFound: `farmer sales advert with id=${id} not found` });
      }
      return Ok(farmerSalesAdvertOpt.Some);
    }
  ),

  // function to update farmer sales advert
  updateFarmerSalesAdvert: update(
    [text, Types.FarmerSaleAdvertPayload],
    Result(Types.FarmerSaleAdvert, Types.Message),
    (id, payload) => {
      const farmerSalesAdvertOpt = FarmerSaleAdvertStorage.get(id);
      if ("None" in farmerSalesAdvertOpt) {
        return Err({ NotFound: `farmer sales advert with id=${id} not found` });
      }
      const farmerSalesAdvert = farmerSalesAdvertOpt.Some;
      const updatedFarmerSalesAdvert = {
        ...farmerSalesAdvert,
        ...payload,
      };
      FarmerSaleAdvertStorage.insert(farmerSalesAdvert.id, updatedFarmerSalesAdvert);
      return Ok(updatedFarmerSalesAdvert);
    }
  ),

  // function to get all farmer sales adverts of a farmer
  getFarmerSalesAdvertsOfFarmer: query(
    [text],
    Vec(Types.FarmerSaleAdvert),
    (farmerId) => {
      const farmerSalesAdverts = FarmerSaleAdvertStorage.values();
      return farmerSalesAdverts.filter(
        (farmerSalesAdvert) => farmerSalesAdvert.farmerId === farmerId
      );
    }
  ),

  // function to get all farmer sales adverts of a product
  getFarmerSalesAdvertsOfProduct: query(
    [text],
    Vec(Types.FarmerSaleAdvert),
    (productId) => {
      const farmerSalesAdverts = FarmerSaleAdvertStorage.values();
      return farmerSalesAdverts.filter(
        (farmerSalesAdvert) => farmerSalesAdvert.productId === productId
      );
    }
  ),


  // function to get all farmer sales adverts of a processorCompanyId
  getFarmerSalesAdvertsOfProcessorCompany: query(
    [text],
    Vec(Types.FarmerSaleAdvert),
    (processorCompanyId) => {
      const farmerSalesAdverts = FarmerSaleAdvertStorage.values();
      return farmerSalesAdverts.filter(
        (farmerSalesAdvert) => farmerSalesAdvert.processorCompanyId === processorCompanyId && farmerSalesAdvert.status === "Active"
      );
    }
  ),



  // function to mark farmer sales status as Approved
  markFarmerSalesAdvertAsApproved: update(
    [text],
    Result(Types.FarmerSaleAdvert, Types.Message),
    (id) => {
      const farmerSalesAdvertOpt = FarmerSaleAdvertStorage.get(id);
      if ("None" in farmerSalesAdvertOpt) {
        return Err({ NotFound: `farmer sales advert with id=${id} not found` });
      }
      const farmerSalesAdvert = farmerSalesAdvertOpt.Some;
      farmerSalesAdvert.status = "Approved";
      FarmerSaleAdvertStorage.insert(farmerSalesAdvert.id, farmerSalesAdvert);
      return Ok(farmerSalesAdvert);
    }
  ),

  // 

  // function to get all farmer sales adverts that are approved by processorCompanyId
  getFarmerSalesAdvertsApprovedByProcessorCompany: query(
    [text],
    Vec(Types.FarmerSaleAdvert),
    (processorCompanyId) => {
      const farmerSalesAdverts = FarmerSaleAdvertStorage.values();
      return farmerSalesAdverts.filter(
        (farmerSalesAdvert) =>
          farmerSalesAdvert.processorCompanyId === processorCompanyId &&
          farmerSalesAdvert.status === "Approved" && farmerSalesAdvert.farmerPaid === false
      );
    }
  ),

  // / function to get all farmer sales adverts that are approved for a Farmer
  getFarmerSalesAdvertsApprovedForFarmer: query(
    [text],
    Vec(Types.FarmerSaleAdvert),
    (farmerId) => {
      const farmerSalesAdverts = FarmerSaleAdvertStorage.values();
      return farmerSalesAdverts.filter(
        (farmerSalesAdvert) =>
          farmerSalesAdvert.farmerId === farmerId &&
          farmerSalesAdvert.status === "Approved"
      );
    }
  ),

  // getFarmerSalesAdvertsCompletedForFarmer //paid
  getFarmerSalesAdvertsCompletedForFarmer: query(
    [text],
    Vec(Types.FarmerSaleAdvert),
    (farmerId) => {
      const farmerSalesAdverts = FarmerSaleAdvertStorage.values();
      return farmerSalesAdverts.filter(
        (farmerSalesAdvert) =>
          farmerSalesAdvert.farmerId === farmerId &&
          farmerSalesAdvert.farmerPaid === true && farmerSalesAdvert.status === "Completed"
      );
    }
  ),
  

  // fetchPaidAdverts
  getPaidAdverts: query(
    [text],
    Vec(Types.FarmerSaleAdvert),
    (processorCompanyId) => {
      const farmerSalesAdverts = FarmerSaleAdvertStorage.values();
      return farmerSalesAdverts.filter(
        (farmerSalesAdvert) =>
          farmerSalesAdvert.processorCompanyId === processorCompanyId &&
          farmerSalesAdvert.farmerPaid === true && farmerSalesAdvert.status === "Completed"
      );
    }
  ),



  // function to mark farmer sales advert as farmerPaid
  markFarmerSalesAdvertAsFarmerPaid: update(
    [text],
    Result(Types.FarmerSaleAdvert, Types.Message),
    (id) => {
      const farmerSalesAdvertOpt = FarmerSaleAdvertStorage.get(id);
      if ("None" in farmerSalesAdvertOpt) {
        return Err({ NotFound: `farmer sales advert with id=${id} not found` });
      }
      const farmerSalesAdvert = farmerSalesAdvertOpt.Some;
      farmerSalesAdvert.farmerPaid = true;
      farmerSalesAdvert.status = "Completed";
      FarmerSaleAdvertStorage.insert(farmerSalesAdvert.id, farmerSalesAdvert);
      return Ok(farmerSalesAdvert);
    }
  ),

  // Check if product.pickedUp is true using productId in FarmerSaleAdvert
  checkIfProductPickedUp: query(
    [text],
    Result(bool, Types.Message),
    (farmerSalesAdvertId) => {
      const farmerSalesAdvertOpt = FarmerSaleAdvertStorage.get(farmerSalesAdvertId);
      if ("None" in farmerSalesAdvertOpt) {
        return Err({ NotFound: `farmer sales advert with id=${farmerSalesAdvertId} not found` });
      }
      const farmerSalesAdvert = farmerSalesAdvertOpt.Some;
      const productOpt = productsStorage.get(farmerSalesAdvert.productId);
      if ("None" in productOpt) {
        return Err({ NotFound: `product with id=${farmerSalesAdvert.productId} not found` });
      }

      const product = productOpt.Some;
      return Ok(product.pickedUp);
    }
  ),

  // ** End of Farmer Sales Advert Functions **

  

  // get farmer by owner using filter
  getFarmerByOwner: query([], Result(Types.Farmer, Types.Message), () => {
    const farmerOpt = farmersStorage
      .values()
      .filter((farmer) => farmer.owner.toText() === ic.caller().toText());
    if (farmerOpt.length === 0) {
      return Err({ NotFound: `farmer with owner=${ic.caller()} not found` });
    }
    return Ok(farmerOpt[0]);
  }),

  // get processing company by owner using filter
  getProcessingCompanyByOwner: query([], Result(Types.ProcessingCompany, Types.Message), () => {
    const processingCompanyOpt = processingCompanyStorage
      .values()
      .filter((processingCompany) => processingCompany.owner.toText() === ic.caller().toText());
    if (processingCompanyOpt.length === 0) {
      return Err({ NotFound: `processing company with owner=${ic.caller()} not found` });
    }
    return Ok(processingCompanyOpt[0]);
  }),

  // get distributor company by owner using filter
  getDistributorCompanyByOwner : query([], Result(Types.DistributorsCompany, Types.Message), () => {
    const distributorCompanyOpt = distributorsCompanyStorage
      .values()
      .filter((distributorCompany) => distributorCompany.owner.toText() === ic.caller().toText());
    if (distributorCompanyOpt.length === 0) {
      return Err({ NotFound: `distributor company with owner=${ic.caller()} not found` });
    }
    return Ok(distributorCompanyOpt[0]);
  }),
    // function to get driver with the same owner as ic.caller()
  getDriverByOwner: query([], Result(Types.Driver, Types.Message), () => {
    const driverOpt = driversStorage
      .values()
      .find((driver) => driver.owner.toText() === ic.caller().toText());
    if (!driverOpt) {
      return Err({ NotFound: `driver with owner=${ic.caller()} not found` });
    }
    return Ok(driverOpt);
  }
  ),

  // get driver by owner using filter
  getDriverByOwnerFilter: query([], Result(Types.Driver, Types.Message), () => {
    const driverOpt = driversStorage
      .values()
      .filter((driver) => driver.owner.toText() === ic.caller().toText());
    if (driverOpt.length === 0) {
      return Err({ NotFound: `driver with owner=${ic.caller()} not found` });
    }
    return Ok(driverOpt[0]);
  }),

  // get driver active delivery 
  getDriverActiveDelivery: query(
    [text],
    Result(Types.DeliveryDetails, Types.Message),
    (driverId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      const deliveryDetailsList = deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.driverId.Some === driverId &&
          deliveryDetail.deliveryStatus === "Accepted"
      );

      if (deliveryDetailsList.length === 0) {
        return Err({
          NotFound: `driver with id=${driverId} has no active delivery`,
        });
      }

      return Ok(deliveryDetailsList[0]);
    }
  ), 

  // function to get driver Complete Delivery
  getDriverCompleteDelivery: query(
    [text],
    Result(Types.DeliveryDetails, Types.Message),
    (driverId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      const deliveryDetailsList = deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.driverId.Some === driverId &&
          deliveryDetail.deliveryStatus === "Completed"
      );

      if (deliveryDetailsList.length === 0) {
        return Err({
          NotFound: `driver with id=${driverId} has no complete delivery`,
        });
      }

      return Ok(deliveryDetailsList[0]);
    }
  ),
  



  getAddressFromPrincipal: query([Principal], text, (principal) => {
    return hexAddressFromPrincipal(principal, 0);
  }),


  // create a Farmer Reserve Payment
  createReserveFarmerPay: update(
    [text],
    Result(Types.ReserveFarmerPayment, Types.Message),
    (farmerSalesAdvertId) => {
      const farmerSalesAdvertOpt = FarmerSaleAdvertStorage.get(farmerSalesAdvertId);
      if ("None" in farmerSalesAdvertOpt) {
        return Err({
          NotFound: `cannot reserve Payment: Farmer Sales Advert with id=${farmerSalesAdvertId} not available`,
        });
      }
      const farmerSalesAdvert = farmerSalesAdvertOpt.Some;
      const farmerId = farmerSalesAdvert.farmerId;
      console.log("farmerId", farmerId);
      const farmerOpt = farmersStorage.get(farmerId);
      if ("None" in farmerOpt) {
        return Err({
          NotFound: `farmer with id=${farmerId} not found`,
        });
      }
      const farmer = farmerOpt.Some;
      const farmerOwner = farmer.owner;

      const cost = BigInt(farmerSalesAdvert.price * farmerSalesAdvert.quantity);

      const processingCompanyId = farmerSalesAdvert.processorCompanyId;
      console.log("processingCompanyId", processingCompanyId);
      const processingCompanyOpt = processingCompanyStorage.get(processingCompanyId);
      if ("None" in processingCompanyOpt) {
        return Err({
          NotFound: `processing company with id=${processingCompanyId} not found`,
        });
      }
      const processingCompany = processingCompanyOpt.Some;
      const processingCompanyOwner = processingCompany.owner;

      const reserveFarmerPayment = {
        ProcessorId: processingCompanyId,
        price: cost,
        status: "pending",
        processorPayer: processingCompanyOwner,
        farmerReciever: farmerOwner,
        paid_at_block: None,
        memo: generateCorrelationId(farmerSalesAdvertId),
      };

      console.log("reserveFarmerPayment", reserveFarmerPayment);
      pendingFarmerReserves.insert(reserveFarmerPayment.memo, reserveFarmerPayment);
      discardByTimeout(reserveFarmerPayment.memo, PAYMENT_RESERVATION_PERIOD);
      return Ok(reserveFarmerPayment);

    }
  ),

  completeFarmerPayment: update(
    [Principal, text, nat64, nat64, nat64],
    Result(Types.ReserveFarmerPayment, Types.Message),
    async (reservor, farmerSalesAdvertId, reservePrice, block, memo) => {
      const paymentVerified = await verifyPaymentInternal(
        reservor,
        reservePrice,
        block,
        memo
      );
      if (!paymentVerified) {
        return Err({
          NotFound: `cannot complete the reserve: cannot verify the payment, memo=${memo}`,
        });
      }
      const pendingReservePayOpt = pendingFarmerReserves.remove(memo);
      if ("None" in pendingReservePayOpt) {
        return Err({
          NotFound: `cannot complete the reserve: there is no pending reserve with id=${farmerSalesAdvertId}`,
        });
      }
      const reservedPay = pendingReservePayOpt.Some;
      const updatedReservePayment = {
        ...reservedPay,
        status: "completed",
        paid_at_block: Some(block),
      };
      const farmerSalesAdvertOpt = FarmerSaleAdvertStorage.get(farmerSalesAdvertId);
      if ("None" in farmerSalesAdvertOpt) {
        throw Error(`FarmerSalesAdvert with id=${farmerSalesAdvertId} not found`);
      }
      const farmerSalesAdvert = farmerSalesAdvertOpt.Some;
      FarmerSaleAdvertStorage.insert(farmerSalesAdvert.id, farmerSalesAdvert);
      persistedFarmerReserves.insert(ic.caller(), updatedReservePayment);
      return Ok(updatedReservePayment);
    }
  ),

  // create a Distributor Reserve Payment
  createReserveDistributorPay: update(
    [text],
    Result(Types.ReserveDistributorsPayment, Types.Message),
    (deliveryTenderId) => {
      const deliveryTenderOpt = deliveryTenderStorage.get(deliveryTenderId);
      if ("None" in deliveryTenderOpt) {
        return Err({
          NotFound: `cannot reserve Payment: Delivery Tender with id=${deliveryTenderId} not available`,
        });
      }
      const deliveryTender = deliveryTenderOpt.Some;
      const distributorId = deliveryTender.distributorsId;
      console.log("distributorId", distributorId);
      const distributorOpt = distributorsCompanyStorage.get(distributorId);
      if ("None" in distributorOpt) {
        return Err({
          NotFound: `distributor with id=${distributorId} not found`,
        });
      }
      const distributor = distributorOpt.Some;
      const distributorOwner = distributor.owner;

      const cost = deliveryTender.totalCost;

      const processingCompanyId = deliveryTender.processorsId;
      console.log("processingCompanyId", processingCompanyId);
      const processingCompanyOpt = processingCompanyStorage.get(processingCompanyId);
      if ("None" in processingCompanyOpt) {
        return Err({
          NotFound: `processing company with id=${processingCompanyId} not found`,
        });
      }
      const processingCompany = processingCompanyOpt.Some;
      const processingCompanyOwner = processingCompany.owner;

      const reserveDistributorPayment = {
        ProcessorId: processingCompanyId,
        price: cost,
        status: "pending",
        processorPayer: processingCompanyOwner,
        distributorReciever: distributorOwner,
        paid_at_block: None,
        memo: generateCorrelationId(deliveryTenderId),
      };

      console.log("reserveDistributorPayment", reserveDistributorPayment);
      pendingDistributorReserves.insert(reserveDistributorPayment.memo, reserveDistributorPayment);
      discardByTimeout(reserveDistributorPayment.memo, PAYMENT_RESERVATION_PERIOD);
      return Ok(reserveDistributorPayment);
    }
  ),

  completeDistributorPayment: update(
    [Principal, text, nat64, nat64, nat64],
    Result(Types.ReserveDistributorsPayment, Types.Message),
    async (reservor, deliveryTenderId, reservePrice, block, memo) => {
      const paymentVerified = await verifyPaymentInternal(
        reservor,
        reservePrice,
        block,
        memo
      );
      if (!paymentVerified) {
        return Err({
          NotFound: `cannot complete the reserve: cannot verify the payment, memo=${memo}`,
        });
      }
      const pendingReservePayOpt = pendingDistributorReserves.remove(memo);
      if ("None" in pendingReservePayOpt) {
        return Err({
          NotFound: `cannot complete the reserve: there is no pending reserve with id=${deliveryTenderId}`,
        });
      }
      const reservedPay = pendingReservePayOpt.Some;
      const updatedReservePayment = {
        ...reservedPay,
        status: "completed",
        paid_at_block: Some(block),
      };
      const deliveryTenderOpt = deliveryTenderStorage.get(deliveryTenderId);
      if ("None" in deliveryTenderOpt) {
        throw Error(`DeliveryTender with id=${deliveryTenderId} not found`);
      }
      const deliveryTender = deliveryTenderOpt.Some;
      deliveryTenderStorage.insert(deliveryTender.id, deliveryTender);
      persistedDistributorReserves.insert(ic.caller(), updatedReservePayment);
      return Ok(updatedReservePayment);
    }
  ),



  // create a Driver Reserve Payment
  createReserveDriverPay: update(
    [text, nat64],
    Result(Types.ReserveDriverPayment, Types.Message),
    (deliveryTenderId, amount) => {
      console.log("details", deliveryTenderId, amount)
      const deliveryTenderOpt = deliveryTenderStorage.get(deliveryTenderId);
      if ("None" in deliveryTenderOpt) {
        return Err({
          NotFound: `cannot reserve Payment: Delivery Tender with id=${deliveryTenderId} not available`,
        });
      }
      const deliveryTender = deliveryTenderOpt.Some;
      const deliveryDetailsId = deliveryTender.DeliveryDetailsId;
      const deliveryDetailsOpt = deliveryDetailsStorage.get(deliveryDetailsId);
      if ("None" in deliveryDetailsOpt) {
        return Err({
          NotFound: `cannot reserve Payment: Delivery Details with id=${deliveryDetailsId} not available`,
        });
      }
      const deliveryDetails = deliveryDetailsOpt.Some;
      const driverId = deliveryDetails.driverId.Some;
      console.log("driverId", driverId);
      const driverOpt = driversStorage.get(driverId);
      if ("None" in driverOpt) {
        return Err({
          NotFound: `driver with id=${driverId} not found`,
        });
      }
      const driver = driverOpt.Some;
      const driverOwner = driver.owner;

      const cost = amount;
      console.log("cost",cost)
      const distributorCompanyId = deliveryDetails.distributorsId;
      console.log("distributorCompanyId", distributorCompanyId);
      const distributorCompanyOpt = distributorsCompanyStorage.get(distributorCompanyId);
      if ("None" in distributorCompanyOpt) {
        return Err({
          NotFound: `distributor company with id=${distributorCompanyId} not found`,
        });
      }
      const distributorCompany = distributorCompanyOpt.Some;
      const distributorCompanyOwner = distributorCompany.owner;

      const reserveDriverPayment = {
        DistributorId: distributorCompanyId,
        price: cost,
        status: "pending",
        distributorPayer: distributorCompanyOwner,
        driverReciever: driverOwner,
        paid_at_block: None,
        memo: generateCorrelationId(deliveryDetailsId),
      };

      console.log("reserveDriverPayment", reserveDriverPayment);
      pendingDriverReserves.insert(reserveDriverPayment.memo, reserveDriverPayment);
      discardByTimeout(reserveDriverPayment.memo, PAYMENT_RESERVATION_PERIOD);
      return Ok(reserveDriverPayment);
    }

  ),

  // complete a Driver Reserve Payment
  completeDriverPayment: update(
    [Principal, text, nat64, nat64, nat64],
    Result(Types.ReserveDriverPayment, Types.Message),
    async (reservor,  deliveryTenderId, reservePrice, block, memo) => {
      const paymentVerified = await verifyPaymentInternal(
        reservor,
        reservePrice,
        block,
        memo
      );
      if (!paymentVerified) {
        return Err({
          NotFound: `cannot complete the reserve: cannot verify the payment, memo=${memo}`,
        });
      }
      const pendingReservePayOpt = pendingDriverReserves.remove(memo);
      if ("None" in pendingReservePayOpt) {
        return Err({
          NotFound: `cannot complete the reserve: there is no pending reserve with id=${deliveryTenderId}`,
        });
      }
      const reservedPay = pendingReservePayOpt.Some;
      const updatedReservePayment = {
        ...reservedPay,
        status: "completed",
        paid_at_block: Some(block),
      };
      const deliveryTenderOpt = deliveryTenderStorage.get(deliveryTenderId);
      if ("None" in deliveryTenderOpt) {
        throw Error(`DeliveryTender with id=${deliveryTenderId} not found`);
      }
      const deliveryTender = deliveryTenderOpt.Some;
      deliveryTenderStorage.insert(deliveryTender.id, deliveryTender);

      persistedDriverReserves.insert(ic.caller(), updatedReservePayment);
      return Ok(updatedReservePayment);
    }
  ),

  verifyPayment: query(
    [Principal, nat64, nat64, nat64],
    bool,
    async (receiver, amount, block, memo) => {
      return await verifyPaymentInternal(receiver, amount, block, memo);
    }
  ),
});


/*
    a hash function that is used to generate correlation ids for orders.
    also, we use that in the verifyPayment function where we check if the used has actually paid the order
*/
function hash(input: any): nat64 {
  return BigInt(Math.abs(hashCode().value(input)));
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
  // @ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }

    return array;
  },
};

// HELPER FUNCTIONS
function generateCorrelationId(orderId: text): nat64 {
  const correlationId = `${orderId}_${ic.caller().toText()}_${ic.time()}`;
  return hash(correlationId);
}

function discardByTimeout(memo: nat64, delay: Duration) {
  ic.setTimer(delay, () => {
    const advert = pendingFarmerReserves.remove(memo);
    console.log(`Reserve discarded ${advert}`);
  });
}
async function verifyPaymentInternal(
  receiver: Principal,
  amount: nat64,
  block: nat64,
  memo: nat64
): Promise<bool> {
  const blockData = await ic.call(icpCanister.query_blocks, {
    args: [{ start: block, length: 1n }],
  });
  const tx = blockData.blocks.find((block) => {
    if ("None" in block.transaction.operation) {
      return false;
    }
    const operation = block.transaction.operation.Some;
    const senderAddress = binaryAddressFromPrincipal(ic.caller(), 0);
    const receiverAddress = binaryAddressFromPrincipal(receiver, 0);
    return (
      block.transaction.memo === memo &&
      hash(senderAddress) === hash(operation.Transfer?.from) &&
      hash(receiverAddress) === hash(operation.Transfer?.to) &&
      amount === operation.Transfer?.amount.e8s
    );
  });
  return tx ? true : false;
}
