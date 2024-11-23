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

const adminStorage = StableBTreeMap(0, text, Types.Admin);
const itemsStorage = StableBTreeMap(1, text, Types.Item);
const vehiclesStorage = StableBTreeMap(2, text, Types.Vehicle);
const driversStorage = StableBTreeMap(3, text, Types.Driver);
const distributorsCompanyStorage = StableBTreeMap(
  4,
  text,
  Types.DistributorsCompany
);
const warehouseManagerStorage = StableBTreeMap(5, text, Types.WarehouseManager);
const fieldWorkerStorage = StableBTreeMap(6, text, Types.FieldWorker);
const deliveryDetailsStorage = StableBTreeMap(7, text, Types.DeliveryDetails);
const deliveryTenderStorage = StableBTreeMap(8, text, Types.DeliveryTender);
const adminProcessingAdvertStorage = StableBTreeMap(
  9,
  text,
  Types.AdminProcessingAdvert
);
const pendingDriverReserves = StableBTreeMap(
  10,
  nat64,
  Types.ReserveDriverPayment
);
const persistedDriverReserves = StableBTreeMap(
  11,
  Principal,
  Types.ReserveDriverPayment
);
const pendingAdminReserves = StableBTreeMap(
  12,
  nat64,
  Types.ReserveAdminPayment
);
const persistedFarmerReserves = StableBTreeMap(
  13,
  Principal,
  Types.ReserveAdminPayment
);
const pendingDistributorReserves = StableBTreeMap(
  14,
  nat64,
  Types.ReserveDistributorsPayment
);
const persistedDistributorReserves = StableBTreeMap(
  15,
  Principal,
  Types.ReserveDistributorsPayment
);
const pendingWarehouseReserves = StableBTreeMap(
  16,
  nat64,
  Types.ReserveWarehousePayment
);
const persistedWarehouseReserves = StableBTreeMap(
  17,
  Principal,
  Types.ReserveWarehousePayment
);

const PAYMENT_RESERVATION_PERIOD = 12000n; // reservation period in seconds

/* 
    initialization of the Ledger canister. The principal text value is hardcoded because 
    we set it in the `dfx.json`
*/
const icpCanister = Ledger(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"));

export default Canister({
  // ** Start of Admin Functions **
  // Function to create admin using AdminPayload
  createAdmin: update(
    [Types.AdminPayload],
    Result(Types.Admin, Types.Message),
    (payload) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }
      // Create an admin with a unique id generated using UUID v4
      const admin = {
        id: uuidv4(),
        owner: ic.caller(),
        organisationItems: [],
        pickedUpItems: [],
        ...payload,
        role: "Admin",
        status: "Active",
      };
      // Insert the admin into the adminStorage
      adminStorage.insert(admin.id, admin);

      // Return success with both the admin data and a success message
      return {
        Ok: admin,
        Message: {
          Success: `Admin '${admin.fullName}' successfully created with ID: ${admin.id}. Owner: ${admin.owner}`,
        },
      };
    }
  ),

  // Function to get all admins with error handling
  getAllAdmins: query([], Result(Vec(Types.Admin), Types.Message), () => {
    const admins = adminStorage.values();
    if (admins.length === 0) {
      return Err({ NotFound: "No admins found" });
    }
    return Ok(admins);
  }),

  // Function to get admin by id
  getAdmin: query([text], Result(Types.Admin, Types.Message), (id) => {
    const adminOpt = adminStorage.get(id);
    if ("None" in adminOpt) {
      return Err({ NotFound: `admin with id=${id} not found` });
    }
    return Ok(adminOpt.Some);
  }),

  // function to get admin by owner using filter
  getAdminByOwner: query([], Result(Types.Admin, Types.Message), () => {
    const adminOpt = adminStorage
      .values()
      .filter((admin) => admin.owner.toText() === ic.caller().toText());
    if (adminOpt.length === 0) {
      return Err({ NotFound: `No admin found for owner: ${ic.caller()}` });
    }

    return Ok(adminOpt[0]);
  }),

  // Function to update admin
  updateAdmin: update(
    [text, Types.AdminPayload],
    Result(Types.Admin, Types.Message),
    (id, payload) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }
      const adminOpt = adminStorage.get(id);
      if ("None" in adminOpt) {
        return Err({ NotFound: `admin with id=${id} not found` });
      }
      const admin = adminOpt.Some;
      const updatedAdmin = {
        ...admin,
        ...payload,
      };
      adminStorage.insert(admin.id, updatedAdmin);
      return Ok(updatedAdmin);
    }
  ),

  // Function to add item to Admin
  addAdminItem: update(
    [text, text],
    Result(Types.Admin, Types.Message),
    (adminId, itemId) => {
      const adminOpt = adminStorage.get(adminId);
      if ("None" in adminOpt) {
        return Err({ NotFound: `Admin with id=${adminId} not found` });
      }
      const itemOpt = itemsStorage.get(itemId);
      if ("None" in itemOpt) {
        return Err({ NotFound: `Item with id=${itemId} not found` });
      }

      const admin = adminOpt.Some;
      const item = itemOpt.Some;
      admin.organisationItems.push(item);
      adminStorage.insert(admin.id, admin);
      return Ok(admin);
    }
  ),
  // Function to add picked up Item to Admin check if the Item pickedUp is true
  addPickedUpItem: update(
    [text, text],
    Result(Types.Admin, Types.Message),
    (adminId, itemId) => {
      const adminOpt = adminStorage.get(adminId);
      if ("None" in adminOpt) {
        return Err({ NotFound: `Admin with id=${adminId} not found` });
      }
      const itemOpt = itemsStorage.get(itemId);
      if ("None" in itemOpt) {
        return Err({ NotFound: `Item with id=${itemId} not found` });
      }

      const admin = adminOpt.Some;
      const item = itemOpt.Some;
      admin.pickedUpItems.push(item);
      adminStorage.insert(admin.id, admin);
      return Ok(admin);
    }
  ),

  // Mark Item as warehouse paid by the admin
  markItemAsWarehousePaid: update(
    [text],
    Result(Types.Item, Types.Message),
    (itemId) => {
      const itemOpt = itemsStorage.get(itemId);
      if ("None" in itemOpt) {
        return Err({ NotFound: `item with id=${itemId} not found` });
      }
      const item = itemOpt.Some;
      item.warehousePaid = true;
      itemsStorage.insert(item.id, item);
      return Ok(item);
    }
  ),

  // get all warehouse paid items of the admin
  getWarehousePaidItems: query([text], Vec(Types.Item), (adminId) => {
    const items = itemsStorage.values();
    return items.filter((item) => item.warehousePaid && item.owner === adminId);
  }),

  // ** End of Admin Functions **

  // ** Start of Item Functions **
  // function to create item using ItemPayload
  createItem: update(
    [Types.ItemPayload, text],
    Result(Types.Item, Types.Message),
    (payload, adminId) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }

      // Check if the admin exists
      const adminOpt = adminStorage.get(adminId);

      if ("None" in adminOpt) {
        return Err({ NotFound: `admin with id=${adminId} not found` });
      }

      // Create an event with a unique id generated using UUID v4
      const item = {
        id: uuidv4(),
        owner: adminId,
        quantity: 0n,
        grade: "",
        status: "New",
        pickedUp: false,
        packaged: false,
        packagedDetails: None,
        expiration_date: None,
        warehousePaid: false,
        distributionSuccesful: false,
        warehousedSuccesful: false,
        ...payload,
      };
      // Insert the event into the eventsStorage
      itemsStorage.insert(item.id, item);

      // Return success with both the item data and a success message
      return {
        Ok: item,
        Message: {
          Success: `Item '${item.name}' successfully created with ID: ${item.id}. Owner: ${item.owner}`,
        },
      };
    }
  ),

  // gradeItem
  gradeItem: update(
    [Types.GradePayload],
    Result(Types.Item, Types.Message),
    (gradePayload) => {
      const itemOpt = itemsStorage.get(gradePayload.itemId);
      if ("None" in itemOpt) {
        return Err({
          NotFound: `item with id=${gradePayload.itemId} not found`,
        });
      }
      const item = itemOpt.Some;
      item.grade = gradePayload.grade;
      item.quantity = gradePayload.quantity;
      item.status = "Graded";
      itemsStorage.insert(item.id, item);
      return Ok(item);
    }
  ),

  // Function to add packaged Details to an item
  addPackagedDetailsToItem: update(
    [text, Types.Packaging],
    Result(Types.Item, Types.Message),
    (itemId, payload) => {
      const itemOpt = itemsStorage.get(itemId);
      if ("None" in itemOpt) {
        return Err({ NotFound: `item with id=${itemId} not found` });
      }
      const item = itemOpt.Some;

      item.packagedDetails = Some(payload);
      item.status = "Packaged";
      item.packaged = true;

      // Update the item in the itemsStorage
      itemsStorage.insert(item.id, item);
      return Ok(item);
    }
  ),

  // Mark item as picked up by the distributor
  markItemAsPickedUp: update(
    [text],
    Result(Types.Item, Types.Message),
    (itemId) => {
      const itemOpt = itemsStorage.get(itemId);
      if ("None" in itemOpt) {
        return Err({ NotFound: `item with id=${itemId} not found` });
      }
      const item = itemOpt.Some;
      item.pickedUp = true;
      itemsStorage.insert(item.id, item);
      return Ok(item);
    }
  ),

  // Function to get all items with error handling
  getAllItems: query([], Result(Vec(Types.Item), Types.Message), () => {
    const items = itemsStorage.values();
    if (items.length === 0) {
      return Err({ NotFound: "No items found" });
    }
    return Ok(items);
  }),

  // function to get item by id
  getItemById: query([text], Result(Types.Item, Types.Message), (id) => {
    const itemOpt = itemsStorage.get(id);
    if ("None" in itemOpt) {
      return Err({ NotFound: `item with id=${id} not found` });
    }
    return Ok(itemOpt.Some);
  }),

  // function to update item
  updateItem: update(
    [text, Types.ItemPayload],
    Result(Types.Item, Types.Message),
    (id, payload) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }
      const itemOpt = itemsStorage.get(id);
      if ("None" in itemOpt) {
        return Err({ NotFound: `item with id=${id} not found` });
      }
      const item = itemOpt.Some;
      const updatedItem = {
        ...item,
        ...payload,
      };
      itemsStorage.insert(item.id, updatedItem);
      return Ok(updatedItem);
    }
  ),

  // Function to get new items for the item owner
  getNewItemsForOwner: query(
    [text],
    Result(Vec(Types.Item), Types.Message),
    (ownerId) => {
      try {
        // Validate the ownerId input
        if (!ownerId || typeof ownerId !== "string") {
          return Err({
            InvalidPayload: "Owner ID must be a non-empty string.",
          });
        }

        // Fetch all items
        const items = itemsStorage.values();

        // Filter items based on status and owner
        const filteredItems = items.filter(
          (item) => item.status === "New" && item.owner === ownerId
        );

        // Check if any items are found
        if (filteredItems.length === 0) {
          return Err({
            NotFound: `No new items found for owner ID: ${ownerId}.`,
          });
        }

        // Return the filtered items
        return Ok(filteredItems);
      } catch (error) {
        // Catch unexpected errors and return an appropriate error message
        return Err({
          NotFound: `An unexpected error occurred.`,
        });
      }
    }
  ),

  // Function to get graded items for the item owner
  getGradedItemsForOwner: query(
    [text],
    Result(Vec(Types.Item), Types.Message),
    (ownerId) => {
      try {
        // Validate the ownerId input
        if (!ownerId || typeof ownerId !== "string") {
          return Err({
            InvalidPayload: "Owner ID must be a non-empty string.",
          });
        }

        // Fetch all items
        const items = itemsStorage.values();

        // Filter items based on status and owner
        const filteredItems = items.filter(
          (item) => item.status === "Graded" && item.owner === ownerId
        );

        // Check if any items are found
        if (filteredItems.length === 0) {
          return Err({
            NotFound: `No graded items found for owner ID: ${ownerId}.`,
          });
        }

        // Return the filtered items
        return Ok(filteredItems);
      } catch (error) {
        // Catch unexpected errors and return an appropriate error message
        return Err({
          NotFound: `An unexpected error occurred.`,
        });
      }
    }
  ),

  // Function to get packaged items for the item owner
  getPackagedItemsForOwner: query(
    [text],
    Result(Vec(Types.Item), Types.Message),
    (ownerId) => {
      try {
        // Validate the ownerId input
        if (!ownerId || typeof ownerId !== "string") {
          return Err({
            InvalidPayload: "Owner ID must be a non-empty string.",
          });
        }

        // Fetch all items
        const items = itemsStorage.values();

        // Filter items based on status and owner
        const filteredItems = items.filter(
          (item) =>
            item.packaged &&
            item.owner === ownerId &&
            item.status === "Packaged"
        );

        // Check if any items are found
        if (filteredItems.length === 0) {
          return Err({
            NotFound: `No packaged items found for owner ID: ${ownerId}.`,
          });
        }

        // Return the filtered items
        return Ok(filteredItems);
      } catch (error) {
        // Catch unexpected errors and return an appropriate error message
        return Err({
          NotFound: `An unexpected error occurred.`,
        });
      }
    }
  ),

  // ** End of Item Functions **

  // ** Start of Vehicle Functions **
  // function to create vehicle using VehiclePayload
  createVehicle: update(
    [Types.VehiclePayload, text],
    Result(Types.Vehicle, Types.Message),
    (payload, distributorId) => {
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

  // function to get all vehicles with error handling
  getAllVehicles: query([], Result(Vec(Types.Vehicle), Types.Message), () => {
    const vehicles = vehiclesStorage.values();
    if (vehicles.length === 0) {
      return Err({ NotFound: "No vehicles found" });
    }
    return Ok(vehicles);
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
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }
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
    Result(Vec(Types.Vehicle), Types.Message),
    (companyId) => {
      const vehicles = vehiclesStorage.values();
      const filteredVehicles = vehicles.filter(
        (vehicle) => vehicle.owner === companyId
      );
      if (filteredVehicles.length === 0) {
        return Err({
          NotFound: `No vehicles found for distributor company with ID: ${companyId}.`,
        });
      }
      return Ok(filteredVehicles);
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
        qualifications: [],
        assignedVehicle: None,
        assignedCompany: false,
        driverRating: 0n,
        driverStatus: "Active",
        ...payload,
      };
      // Insert the event into the eventsStorage
      driversStorage.insert(driver.id, driver);
      return Ok(driver);
    }
  ),

  // functions to get all drivers with error handling
  getAllDrivers: query([], Result(Vec(Types.Driver), Types.Message), () => {
    const drivers = driversStorage.values();
    if (drivers.length === 0) {
      return Err({ NotFound: "No drivers found" });
    }
    return Ok(drivers);
  }),

  // function to get driver by id
  getDriver: query([text], Result(Types.Driver, Types.Message), (id) => {
    const driverOpt = driversStorage.get(id);
    if ("None" in driverOpt) {
      return Err({ NotFound: `driver with id=${id} not found` });
    }
    return Ok(driverOpt.Some);
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
  }),

  // function to get driver by owner using filter
  getDriverByOwnerFilter: query([], Result(Types.Driver, Types.Message), () => {
    const driverOpt = driversStorage
      .values()
      .filter((driver) => driver.owner.toText() === ic.caller().toText());
    if (driverOpt.length === 0) {
      return Err({ NotFound: `No driver found for owner: ${ic.caller()}` });
    }

    return Ok(driverOpt[0]);
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
        completeItemsDistribution: [],
        ...payload,
      };
      // Insert the event into the eventsStorage
      distributorsCompanyStorage.insert(
        distributorCompany.id,
        distributorCompany
      );
      return Ok(distributorCompany);
    }
  ),

  // function to get all distributor companies with error handling
  getAllDistributorsCompany: query(
    [],
    Result(Vec(Types.DistributorsCompany), Types.Message),
    () => {
      const distributorCompanies = distributorsCompanyStorage.values();
      if (distributorCompanies.length === 0) {
        return Err({ NotFound: "No distributor companies found" });
      }
      return Ok(distributorCompanies);
    }
  ),

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

  // function to get distributor company by owner using filter
  getDistributorsCompanyByOwner: query(
    [],
    Result(Types.DistributorsCompany, Types.Message),
    () => {
      const distributorCompanyOpt = distributorsCompanyStorage
        .values()
        .filter(
          (distributorCompany) =>
            distributorCompany.owner.toText() === ic.caller().toText()
        );
      if (distributorCompanyOpt.length === 0) {
        return Err({
          NotFound: `No distributor company found for owner: ${ic.caller()}`,
        });
      }

      return Ok(distributorCompanyOpt[0]);
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
      distributorsCompanyStorage.insert(
        distributorCompany.id,
        updatedDistributorCompany
      );
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
      distributorsCompanyStorage.insert(
        distributorCompany.id,
        distributorCompany
      );
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
      distributorsCompanyStorage.insert(
        distributorCompany.id,
        distributorCompany
      );
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
  // function to add addCompleteItemsDistributionToDistributorCompany
  addCompleteItemsDistributionToDistributorCompany: update(
    [text, text],
    Result(Types.DistributorsCompany, Types.Message),
    (companyId, itemId) => {
      const distributorCompanyOpt = distributorsCompanyStorage.get(companyId);
      if ("None" in distributorCompanyOpt) {
        return Err({
          NotFound: `distributor company with id=${companyId} not found`,
        });
      }
      const distributorCompany = distributorCompanyOpt.Some;
      const itemOpt = itemsStorage.get(itemId);
      if ("None" in itemOpt) {
        return Err({ NotFound: `item with id=${itemId} not found` });
      }
      const item = itemOpt.Some;
      item.distributionSuccesful = true;
      distributorCompany.completeItemsDistribution.push(item);
      distributorsCompanyStorage.insert(
        distributorCompany.id,
        distributorCompany
      );
      return Ok(distributorCompany);
    }
  ),

  // getCompleteItemsDistributionInDistributorCompany
  getCompleteItemsDistributionInDistributorCompany: query(
    [text],
    Vec(Types.Item),
    (companyId) => {
      const distributorCompanyOpt = distributorsCompanyStorage.get(companyId);
      if ("None" in distributorCompanyOpt) {
        return [];
      }
      const distributorCompany = distributorCompanyOpt.Some;
      return distributorCompany.completeItemsDistribution;
    }
  ),

  // **End of Distributors Company Functions**

  // **Start of Warehouse Manager Functions**

  // function to create warehouse manager using WarehouseManagerPayload
  createWarehouseManager: update(
    [Types.WarehouseManagerPayload],
    Result(Types.WarehouseManager, Types.Message),
    (payload) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }
      // Create an event with a unique id generated using UUID v4
      const warehouseManager = {
        id: uuidv4(),
        owner: ic.caller(),
        role: "Warehouse Manager",
        status: "Active",
        itemSuccesfullWarehoused: [],
        ...payload,
      };
      // Insert the event into the eventsStorage
      warehouseManagerStorage.insert(warehouseManager.id, warehouseManager);
      return Ok(warehouseManager);
    }
  ),

  // function to get all warehouse managers with error handling
  getAllWarehouseManagers: query(
    [],
    Result(Vec(Types.WarehouseManager), Types.Message),
    () => {
      const warehouseManagers = warehouseManagerStorage.values();
      if (warehouseManagers.length === 0) {
        return Err({ NotFound: "No warehouse managers found" });
      }
      return Ok(warehouseManagers);
    }
  ),

  // function to get warehouse manager by id
  getWarehouseManager: query(
    [text],
    Result(Types.WarehouseManager, Types.Message),
    (id) => {
      const warehouseManagerOpt = warehouseManagerStorage.get(id);
      if ("None" in warehouseManagerOpt) {
        return Err({ NotFound: `warehouse manager with id=${id} not found` });
      }
      return Ok(warehouseManagerOpt.Some);
    }
  ),

  // function to get warehouse manager by owner using filter
  getWarehouseManagerByOwner: query(
    [],
    Result(Types.WarehouseManager, Types.Message),
    () => {
      const warehouseManagerOpt = warehouseManagerStorage
        .values()
        .filter(
          (warehouseManager) =>
            warehouseManager.owner.toText() === ic.caller().toText()
        );
      if (warehouseManagerOpt.length === 0) {
        return Err({
          NotFound: `No warehouse manager found for owner: ${ic.caller()}`,
        });
      }

      return Ok(warehouseManagerOpt[0]);
    }
  ),

  // function to update warehouse manager
  updateWarehouseManager: update(
    [text, Types.WarehouseManagerPayload],
    Result(Types.WarehouseManager, Types.Message),
    (id, payload) => {
      const warehouseManagerOpt = warehouseManagerStorage.get(id);
      if ("None" in warehouseManagerOpt) {
        return Err({ NotFound: `warehouse manager with id=${id} not found` });
      }
      const warehouseManager = warehouseManagerOpt.Some;
      const updatedWarehouseManager = {
        ...warehouseManager,
        ...payload,
      };
      warehouseManagerStorage.insert(
        warehouseManager.id,
        updatedWarehouseManager
      );
      return Ok(updatedWarehouseManager);
    }
  ),

  // function to add itemsuccessfully warehoused to warehouse manager
  addItemsSuccesfulWarehousing: update(
    [text, text],
    Result(Types.WarehouseManager, Types.Message),
    (managerId, itemId) => {
      const warehouseManagerOpt = warehouseManagerStorage.get(managerId);
      if ("None" in warehouseManagerOpt) {
        return Err({
          NotFound: `warehouse manager with id=${managerId} not found`,
        });
      }
      const warehouseManager = warehouseManagerOpt.Some;
      const itemOpt = itemsStorage.get(itemId);
      if ("None" in itemOpt) {
        return Err({ NotFound: `item with id=${itemId} not found` });
      }
      const item = itemOpt.Some;
      item.warehousedSuccesful = true;
      warehouseManager.itemSuccesfullWarehoused.push(item);
      warehouseManagerStorage.insert(warehouseManager.id, warehouseManager);
      return Ok(warehouseManager);
    }
  ),

  // function to get items successfully warehoused by warehouse manager
  getItemsSuccesfulWarehousing: query([text], Vec(Types.Item), (managerId) => {
    const warehouseManagerOpt = warehouseManagerStorage.get(managerId);
    if ("None" in warehouseManagerOpt) {
      return [];
    }
    const warehouseManager = warehouseManagerOpt.Some;
    return warehouseManager.itemSuccesfullWarehoused;
  }),

  // **End of Warehouse Manager Functions**

  // **Start of Field Worker Functions**

  // function to create field worker using FieldWorkerPayload
  createFieldWorker: update(
    [Types.FieldWorkerPayload],
    Result(Types.FieldWorker, Types.Message),
    (payload) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }

      // Create an event with a unique id generated using UUID v4
      const fieldWorker = {
        id: uuidv4(),
        owner: ic.caller(),
        ...payload,
      };
      // Insert the event into the eventsStorage
      fieldWorkerStorage.insert(fieldWorker.id, fieldWorker);
      return Ok(fieldWorker);
    }
  ),

  // function to get all field workers with error handling
  getAllFieldWorkers: query(
    [],
    Result(Vec(Types.FieldWorker), Types.Message),
    () => {
      const fieldWorkers = fieldWorkerStorage.values();
      if (fieldWorkers.length === 0) {
        return Err({ NotFound: "No field workers found" });
      }
      return Ok(fieldWorkers);
    }
  ),

  // function to get field worker by id
  getFieldWorker: query(
    [text],
    Result(Types.FieldWorker, Types.Message),
    (id) => {
      const fieldWorkerOpt = fieldWorkerStorage.get(id);
      if ("None" in fieldWorkerOpt) {
        return Err({ NotFound: `field worker with id=${id} not found` });
      }
      return Ok(fieldWorkerOpt.Some);
    }
  ),

  // function to get field worker by owner using filter
  getFieldWorkerByOwner: query(
    [],
    Result(Types.FieldWorker, Types.Message),
    () => {
      const fieldWorkerOpt = fieldWorkerStorage
        .values()
        .filter(
          (fieldWorker) => fieldWorker.owner.toText() === ic.caller().toText()
        );
      if (fieldWorkerOpt.length === 0) {
        return Err({
          NotFound: `No field worker found for owner: ${ic.caller()}`,
        });
      }

      return Ok(fieldWorkerOpt[0]);
    }
  ),

  // function to update field worker
  updateFieldWorker: update(
    [text, Types.FieldWorkerPayload],
    Result(Types.FieldWorker, Types.Message),
    (id, payload) => {
      const fieldWorkerOpt = fieldWorkerStorage.get(id);
      if ("None" in fieldWorkerOpt) {
        return Err({ NotFound: `field worker with id=${id} not found` });
      }
      const fieldWorker = fieldWorkerOpt.Some;
      const updatedFieldWorker = {
        ...fieldWorker,
        ...payload,
      };
      fieldWorkerStorage.insert(fieldWorker.id, updatedFieldWorker);
      return Ok(updatedFieldWorker);
    }
  ),

  // **End of Field Worker Functions**

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

      // Ensure that the Warehouse Manager exists
      const warehouseManagerOpt = warehouseManagerStorage.get(
        payload.warehouseManagerId
      );

      if ("None" in warehouseManagerOpt) {
        return Err({
          NotFound: `Warehouse Manager with id=${payload.warehouseManagerId} not found`,
        });
      }

      // Ensure that the Distributors Company exists
      const distributorCompanyOpt = distributorsCompanyStorage.get(
        payload.distributorsId
      );

      if ("None" in distributorCompanyOpt) {
        return Err({
          NotFound: `Distributors Company with id=${payload.distributorsId} not found`,
        });
      }

      // Ensure that the Item exists
      const itemOpt = itemsStorage.get(payload.itemId);

      if ("None" in itemOpt) {
        return Err({
          NotFound: `Item with id=${payload.itemId} not found`,
        });
      }

      // Ensure that the admin exists
      const adminOpt = adminStorage.get(payload.adminId);

      if ("None" in adminOpt) {
        return Err({
          NotFound: `Admin with id=${payload.adminId} not found`,
        });
      }

      // Create an event with a unique id generated using UUID v4
      const deliveryDetails = {
        id: uuidv4(),
        driverId: None,
        deliveredDate: None,
        deliveryStatus: "Pending",
        ...payload,
      };
      // Insert the event into the eventsStorage
      deliveryDetailsStorage.insert(deliveryDetails.id, deliveryDetails);
      return Ok(deliveryDetails);
    }
  ),

  // function to get all delivery details with error handling
  getAllDeliveryDetails: query(
    [],
    Result(Vec(Types.DeliveryDetails), Types.Message),
    () => {
      const deliveryDetails = deliveryDetailsStorage.values();
      if (deliveryDetails.length === 0) {
        return Err({ NotFound: "No delivery details found" });
      }
      return Ok(deliveryDetails);
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
    [text, text],
    Result(Types.DeliveryTender, Types.Message),
    (companyId, deliveryDetailsId) => {
      // get all tenders
      const deliveryTender = deliveryTenderStorage.values();
      console.log("deliveryTender", deliveryTender);
      // for loop to check if the tender is accepted and the distributorId is the same as the companyId && deliveryDetailsId is the same as the deliveryDetailsId
      for (let i = 0; i < deliveryTender.length; i++) {
        if (
          deliveryTender[i].accepted &&
          deliveryTender[i].distributorsId === companyId &&
          deliveryTender[i].DeliveryDetailsId === deliveryDetailsId
        ) {
          console.log("found", deliveryTender[i]);
          return Ok(deliveryTender[i]);
        }
      }
      return Err({
        NotFound: `delivery tender with id=${deliveryDetailsId} not found`,
      });
    }
  ),

  // get Delivery Tender using deliveryDetailsId for a distributor company
  // getTenderForDeliveryDetailsForWarehouseManager
  getTenderForDeliveryDetailsForWarehouseManager: query(
    [text, text],
    Result(Types.DeliveryTender, Types.Message),
    (managerId, deliveryDetailsId) => {
      // get all tenders
      const deliveryTender = deliveryTenderStorage.values();
      console.log("deliveryTender", deliveryTender);
      // for loop to check if the tender is accepted and the distributorId is the same as the companyId && delivery
      // DetailsId is the same as the deliveryDetailsId
      for (let i = 0; i < deliveryTender.length; i++) {
        if (
          deliveryTender[i].accepted &&
          deliveryTender[i].warehouseManagerId === managerId &&
          deliveryTender[i].DeliveryDetailsId === deliveryDetailsId
        ) {
          console.log("found", deliveryTender[i]);
          return Ok(deliveryTender[i]);
        }
      }
      return Err({
        NotFound: `delivery tender with id=${deliveryDetailsId} not found`,
      });
    }
  ),

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

  // function to mark delivery as Completed
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

  // get Delivery that are completed for a warehouse manager
  getCompletedDeliveryDetailsForWarehouseManager: query(
    [text],
    Vec(Types.DeliveryDetails),
    (managerId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "Completed" &&
          deliveryDetail.warehouseManagerId === managerId
      );
    }
  ),

  //  get delivery details that are picked up for delivery details assigned to a driver
  getDeliveryDetailsPickedUp: query(
    [text],
    Vec(Types.DeliveryDetails),
    (driverId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "Picked" &&
          deliveryDetail.driverId.Some === driverId
      );
    }
  ),

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

  // get delivery details with status new in a warehouse manager
  getNewDeliveryDetailsForWarehouseManager: query(
    [text],
    Vec(Types.DeliveryDetails),
    (managerId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "New" &&
          deliveryDetail.warehouseManagerId === managerId
      );
    }
  ),

  // get delivery details with status Tendered in a warehouse manager
  getTenderedDeliveryDetailsForWarehouseManager: query(
    [text],
    Vec(Types.DeliveryDetails),
    (managerId) => {
      const deliveryDetails = deliveryDetailsStorage.values();
      return deliveryDetails.filter(
        (deliveryDetail) =>
          deliveryDetail.deliveryStatus === "Tendered" &&
          deliveryDetail.warehouseManagerId === managerId
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
        (deliveryDetail) => deliveryDetail.driverId.Some === driverId
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
        (deliveryDetail) => deliveryDetail.driverId.Some === driverId
      );
      if (driverDeliveryDetails.length === 0) {
        return Err({
          NotFound: `No delivery details assigned to driver with id=${driverId}`,
        });
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

  // **End of Delivery Details Functions**

  // **Start of Delivery Tender Functions**

  // function to create delivery tender using DeliveryTenderPayload, initiated by the distributor Company
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
        accepted: false,
        ...payload,
      };

      const deliveryDetailsOpt = deliveryDetailsStorage.get(
        payload.DeliveryDetailsId
      );
      if ("None" in deliveryDetailsOpt) {
        return Err({
          NotFound: `delivery details with id=${payload.DeliveryDetailsId} not found`,
        });
      }
      const deliveryDetails = deliveryDetailsOpt.Some;
      deliveryDetails.deliveryStatus = "Tendered";
      deliveryDetailsStorage.insert(deliveryDetails.id, deliveryDetails);
      // Insert the event into the eventsStorage
      deliveryTenderStorage.insert(deliveryTender.id, deliveryTender);
      return Ok(deliveryTender);
    }
  ),

  // function to get all delivery tenders with error handling
  getAllDeliveryTenders: query(
    [],
    Result(Vec(Types.DeliveryTender), Types.Message),
    () => {
      const deliveryTenders = deliveryTenderStorage.values();
      if (deliveryTenders.length === 0) {
        return Err({ NotFound: "No delivery tenders found" });
      }
      return Ok(deliveryTenders);
    }
  ),

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

  // Function for the Warehouse Manager to accept a delivery tender
  acceptDeliveryTender: update(
    [text],
    Result(Types.DeliveryTender, Types.Message),
    (tenderId) => {
      const deliveryTenderOpt = deliveryTenderStorage.get(tenderId);
      if ("None" in deliveryTenderOpt) {
        return Err({
          NotFound: `delivery tender with id=${tenderId} not found`,
        });
      }
      const deliveryTender = deliveryTenderOpt.Some;
      const deliveryDetailsOpt = deliveryDetailsStorage.get(
        deliveryTender.DeliveryDetailsId
      );
      if ("None" in deliveryDetailsOpt) {
        return Err({
          NotFound: `delivery details with id=${deliveryTender.DeliveryDetailsId} not found`,
        });
      }
      const deliveryDetails = deliveryDetailsOpt.Some;
      deliveryDetails.deliveryStatus = "Accepted";
      deliveryDetailsStorage.insert(deliveryDetails.id, deliveryDetails);

      deliveryTender.accepted = true;
      deliveryTenderStorage.insert(deliveryTender.id, deliveryTender);
      return Ok(deliveryTender);
    }
  ),

  // function to get delivery details of a delivery tender that has been accepted with error handling
  getAcceptedDeliveryTender: query(
    [],
    Result(Vec(Types.DeliveryTender), Types.Message),
    () => {
      const deliveryTenders = deliveryTenderStorage.values();
      const filteredDeliveryTenders = deliveryTenders.filter(
        (deliveryTender) => deliveryTender.accepted
      );
      if (filteredDeliveryTenders.length === 0) {
        return Err({ NotFound: "No accepted delivery tenders found" });
      }
      return Ok(filteredDeliveryTenders);
    }
  ),
  // function to get all delivery tenders of a warehouseManagerId
  getDeliveryTendersOfWarehouseManager: query(
    [text],
    Vec(Types.DeliveryTender),
    (warehouseManagerId) => {
      const deliveryTenders = deliveryTenderStorage.values();
      return deliveryTenders.filter(
        (deliveryTender) =>
          deliveryTender.warehouseManagerId === warehouseManagerId
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

  // Function to get all Accepted Delivery Tenders for Distributor Company
  getAcceptedDeliveryTendersForDistributorCompany: query(
    [text],
    Vec(Types.DeliveryTender),
    (companyId) => {
      const deliveryTenders = deliveryTenderStorage.values();
      const filteredDeliveryTenders = deliveryTenders.filter(
        (deliveryTender) =>
          deliveryTender.accepted && deliveryTender.owner === companyId
      );
      if (filteredDeliveryTenders.length === 0) {
        return [];
      }
      return filteredDeliveryTenders;
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

  // **End of Delivery Tender Functions**

  // ** Start of Admin Processing Advert Functions **

  // function to create admin processing advert using AdminProcessingAdvertPayload
  createAdminProcessingAdvert: update(
    [Types.AdminProcessingAdvertPayload],
    Result(Types.AdminProcessingAdvert, Types.Message),
    (payload) => {
      // Check if the payload is a valid object
      if (typeof payload !== "object" || Object.keys(payload).length === 0) {
        return Err({ NotFound: "invalid payload" });
      }
      // Create an event with a unique id generated using UUID v4
      const adminProcessingAdvert = {
        id: uuidv4(),
        status: "Active",
        adminPaid: false,
        ...payload,
      };
      // Insert the event into the eventsStorage
      adminProcessingAdvertStorage.insert(
        adminProcessingAdvert.id,
        adminProcessingAdvert
      );
      return Ok(adminProcessingAdvert);
    }
  ),

  // function to get all admin processing adverts with error handling
  getAllAdminProcessingAdverts: query(
    [],
    Result(Vec(Types.AdminProcessingAdvert), Types.Message),
    () => {
      const adminProcessingAdverts = adminProcessingAdvertStorage.values();
      if (adminProcessingAdverts.length === 0) {
        return Err({ NotFound: "No admin processing adverts found" });
      }
      return Ok(adminProcessingAdverts);
    }
  ),

  // function to get admin processing advert by id
  getAdminProcessingAdvert: query(
    [text],
    Result(Types.AdminProcessingAdvert, Types.Message),
    (id) => {
      const adminProcessingAdvertOpt = adminProcessingAdvertStorage.get(id);
      if ("None" in adminProcessingAdvertOpt) {
        return Err({
          NotFound: `admin processing advert with id=${id} not found`,
        });
      }
      return Ok(adminProcessingAdvertOpt.Some);
    }
  ),

  // function to update admin processing advert
  updateAdminProcessingAdvert: update(
    [text, Types.AdminProcessingAdvertPayload],
    Result(Types.AdminProcessingAdvert, Types.Message),
    (id, payload) => {
      const adminProcessingAdvertOpt = adminProcessingAdvertStorage.get(id);
      if ("None" in adminProcessingAdvertOpt) {
        return Err({
          NotFound: `admin processing advert with id=${id} not found`,
        });
      }
      const adminProcessingAdvert = adminProcessingAdvertOpt.Some;
      const updatedAdminProcessingAdvert = {
        ...adminProcessingAdvert,
        ...payload,
      };
      adminProcessingAdvertStorage.insert(
        adminProcessingAdvert.id,
        updatedAdminProcessingAdvert
      );
      return Ok(updatedAdminProcessingAdvert);
    }
  ),

  // function to get all admin processing adverts of a admin
  getAdminProcessingAdvertsOfAdmin: query(
    [text],
    Vec(Types.AdminProcessingAdvert),
    (adminId) => {
      const adminProcessingAdverts = adminProcessingAdvertStorage.values();
      return adminProcessingAdverts.filter(
        (adminProcessingAdvert) => adminProcessingAdvert.adminId === adminId
      );
    }
  ),

  // Function to get all admin processing adverts of an item
  getAdminProcessingAdvertsOfItem: query(
    [text],
    Vec(Types.AdminProcessingAdvert),
    (itemId) => {
      const adminProcessingAdverts = adminProcessingAdvertStorage.values();
      return adminProcessingAdverts.filter(
        (adminProcessingAdvert) => adminProcessingAdvert.itemId === itemId
      );
    }
  ),

  // function to get all admin processing adverts of a warehouseManagerId
  getAdminProcessingAdvertsOfWarehouseManager: query(
    [text],
    Vec(Types.AdminProcessingAdvert),
    (warehouseManagerId) => {
      const adminProcessingAdverts = adminProcessingAdvertStorage.values();
      return adminProcessingAdverts.filter(
        (adminProcessingAdvert) =>
          adminProcessingAdvert.warehouseManagerId === warehouseManagerId &&
          adminProcessingAdvert.status === "Active"
      );
    }
  ),

  // function to mark admin processing advert as approved
  markAdminProcessingAdvertAsApproved: update(
    [text],
    Result(Types.AdminProcessingAdvert, Types.Message),
    (id) => {
      const adminProcessingAdvertOpt = adminProcessingAdvertStorage.get(id);
      if ("None" in adminProcessingAdvertOpt) {
        return Err({
          NotFound: `admin processing advert with id=${id} not found`,
        });
      }
      const adminProcessingAdvert = adminProcessingAdvertOpt.Some;
      adminProcessingAdvert.status = "Approved";
      adminProcessingAdvertStorage.insert(
        adminProcessingAdvert.id,
        adminProcessingAdvert
      );
      return Ok(adminProcessingAdvert);
    }
  ),

  // function to get all admin processing adverts that are approved by warehouseManagerId
  getAdminProcessingAdvertsApprovedByWarehouseManager: query(
    [text],
    Vec(Types.AdminProcessingAdvert),
    (warehouseManagerId) => {
      const adminProcessingAdverts = adminProcessingAdvertStorage.values();
      return adminProcessingAdverts.filter(
        (adminProcessingAdvert) =>
          adminProcessingAdvert.warehouseManagerId === warehouseManagerId &&
          adminProcessingAdvert.status === "Approved"
      );
    }
  ),

  // function to get all Admin proccessing advert that are approved for an admin
  getAdminProcessingAdvertsApprovedForAdmin: query(
    [text],
    Vec(Types.AdminProcessingAdvert),
    (adminId) => {
      const adminProcessingAdverts = adminProcessingAdvertStorage.values();
      return adminProcessingAdverts.filter(
        (adminProcessingAdvert) =>
          adminProcessingAdvert.adminId === adminId &&
          adminProcessingAdvert.status === "Approved"
      );
    }
  ),

  // function to get all admin processing adverts that are Completed
  getCompletedAdminProcessingAdverts: query(
    [],
    Vec(Types.AdminProcessingAdvert),
    () => {
      const adminProcessingAdverts = adminProcessingAdvertStorage.values();
      return adminProcessingAdverts.filter(
        (adminProcessingAdvert) => adminProcessingAdvert.status === "Completed"
      );
    }
  ),

  // getAdminProcessingAdvertCompletedForAdmin
  getAdminProcessingAdvertCompletedForAdmin: query(
    [text],
    Vec(Types.AdminProcessingAdvert),
    (adminId) => {
      const adminProcessingAdverts = adminProcessingAdvertStorage.values();
      return adminProcessingAdverts.filter(
        (adminProcessingAdvert) =>
          adminProcessingAdvert.adminId === adminId &&
          adminProcessingAdvert.status === "Completed"
      );
    }
  ),

  // function to get paid admin processing adverts
  getPaidAdminProcessingAdverts: query(
    [],
    Vec(Types.AdminProcessingAdvert),
    () => {
      const adminProcessingAdverts = adminProcessingAdvertStorage.values();
      return adminProcessingAdverts.filter(
        (adminProcessingAdvert) => adminProcessingAdvert.adminPaid === true
      );
    }
  ),

  // function to mark admin processing advert as adminPaid
  markAdminProcessingAdvertAsAdminPaid: update(
    [text],
    Result(Types.AdminProcessingAdvert, Types.Message),
    (id) => {
      const adminProcessingAdvertOpt = adminProcessingAdvertStorage.get(id);
      if ("None" in adminProcessingAdvertOpt) {
        return Err({
          NotFound: `admin processing advert with id=${id} not found`,
        });
      }
      const adminProcessingAdvert = adminProcessingAdvertOpt.Some;
      adminProcessingAdvert.adminPaid = true;
      adminProcessingAdvert.status = "Completed";
      adminProcessingAdvertStorage.insert(
        adminProcessingAdvert.id,
        adminProcessingAdvert
      );
      return Ok(adminProcessingAdvert);
    }
  ),

  // Check if item.pickedUp is true using itemId in AdminProcessingAdvert
  checkIfItemPickedUp: query(
    [text],
    Result(bool, Types.Message),
    (adminProcessingAdvertId) => {
      const adminProcessingAdvertOpt = adminProcessingAdvertStorage.get(
        adminProcessingAdvertId
      );
      if ("None" in adminProcessingAdvertOpt) {
        return Err({
          NotFound: `admin processing advert with id=${adminProcessingAdvertId} not found`,
        });
      }
      const adminProcessingAdvert = adminProcessingAdvertOpt.Some;
      const itemOpt = itemsStorage.get(adminProcessingAdvert.itemId);
      if ("None" in itemOpt) {
        return Err({
          NotFound: `item with id=${adminProcessingAdvert.itemId} not found`,
        });
      }
      const item = itemOpt.Some;
      return Ok(item.pickedUp);
    }
  ),

  // ** End of Admin Processing Advert Functions **

  // ** Start of Admin Processing Payment Functions **

  getAddressFromPrincipal: query([Principal], text, (principal) => {
    return hexAddressFromPrincipal(principal, 0);
  }),

  // // create a Farmer Reserve Payment
  // createReserveFarmerPay: update(
  //   [text],
  //   Result(Types.ReserveFarmerPayment, Types.Message),
  //   (farmerSalesAdvertId) => {
  //     const farmerSalesAdvertOpt = FarmerSaleAdvertStorage.get(farmerSalesAdvertId);
  //     if ("None" in farmerSalesAdvertOpt) {
  //       return Err({
  //         NotFound: `cannot reserve Payment: Farmer Sales Advert with id=${farmerSalesAdvertId} not available`,
  //       });
  //     }
  //     const farmerSalesAdvert = farmerSalesAdvertOpt.Some;
  //     const farmerId = farmerSalesAdvert.farmerId;
  //     console.log("farmerId", farmerId);
  //     const farmerOpt = farmersStorage.get(farmerId);
  //     if ("None" in farmerOpt) {
  //       return Err({
  //         NotFound: `farmer with id=${farmerId} not found`,
  //       });
  //     }
  //     const farmer = farmerOpt.Some;
  //     const farmerOwner = farmer.owner;

  //     const cost = BigInt(farmerSalesAdvert.price * farmerSalesAdvert.quantity);

  //     const processingCompanyId = farmerSalesAdvert.processorCompanyId;
  //     console.log("processingCompanyId", processingCompanyId);
  //     const processingCompanyOpt = processingCompanyStorage.get(processingCompanyId);
  //     if ("None" in processingCompanyOpt) {
  //       return Err({
  //         NotFound: `processing company with id=${processingCompanyId} not found`,
  //       });
  //     }
  //     const processingCompany = processingCompanyOpt.Some;
  //     const processingCompanyOwner = processingCompany.owner;

  //     const reserveFarmerPayment = {
  //       ProcessorId: processingCompanyId,
  //       price: cost,
  //       status: "pending",
  //       processorPayer: processingCompanyOwner,
  //       farmerReciever: farmerOwner,
  //       paid_at_block: None,
  //       memo: generateCorrelationId(farmerSalesAdvertId),
  //     };

  //     console.log("reserveFarmerPayment", reserveFarmerPayment);
  //     pendingFarmerReserves.insert(reserveFarmerPayment.memo, reserveFarmerPayment);
  //     discardByTimeout(reserveFarmerPayment.memo, PAYMENT_RESERVATION_PERIOD);
  //     return Ok(reserveFarmerPayment);

  //   }
  // ),

  // // Create createReserveAdminPay function .. Admin to pay the Warehouseis the processor
  // createReserveAdminPay: update(
  //   [text],
  //   Result(Types.ReserveAdminPayment, Types.Message),
  //   (adminSalesAdvertId) => {
  //     const adminSalesAdvertOpt = adminProcessingAdvertStorage.get(adminSalesAdvertId);
  //     if ("None" in adminSalesAdvertOpt) {
  //       return Err({
  //         NotFound: `cannot reserve Payment: Admin Sales Advert with id=${adminSalesAdvertId} not available`,
  //       });
  //     }
  //     const adminSalesAdvert = adminSalesAdvertOpt.Some;
  //     const adminId = adminSalesAdvert.adminId;
  //     console.log("adminId", adminId);
  //     const adminOpt = adminStorage.get(adminId);
  //     if ("None" in adminOpt) {
  //       return Err({
  //         NotFound: `admin with id=${adminId} not found`,
  //       });
  //     }
  //     const admin = adminOpt.Some;
  //     const adminOwner = admin.owner;

  //     const cost = BigInt(adminSalesAdvert.price * adminSalesAdvert.quantity);

  //     const processingCompanyId = adminSalesAdvert.processorCompanyId;
  //     console.log("processingCompanyId", processingCompanyId);
  //     const processingCompanyOpt = processingCompanyStorage.get(processingCompanyId);
  //     if ("None" in processingCompanyOpt) {
  //       return Err({
  //         NotFound: `processing company with id=${processingCompanyId} not found`,
  //       });
  //     }

  //     const processingCompany = processingCompanyOpt.Some;
  //     const processingCompanyOwner = processingCompany.owner;

  //     const reserveAdminPayment = {
  //       ProcessorId: processingCompanyId,
  //       price: cost,
  //       status: "pending",
  //       processorPayer: processingCompanyOwner,
  //       adminReciever: adminOwner,
  //       paid_at_block: None,
  //       memo: generateCorrelationId(adminSalesAdvertId),
  //     };

  //     console.log("reserveAdminPayment", reserveAdminPayment);
  //     pendingAdminReserves.insert(reserveAdminPayment.memo, reserveAdminPayment);
  //     discardByTimeout(reserveAdminPayment.memo, PAYMENT_RESERVATION_PERIOD);

  //     return Ok(reserveAdminPayment);
  //   }

  // ),

  completeAdminPayment: update(
    [Principal, text, nat64, nat64, nat64],
    Result(Types.ReserveAdminPayment, Types.Message),
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
      const pendingReservePayOpt = pendingAdminReserves.remove(memo);
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
      const farmerSalesAdvertOpt =
        adminProcessingAdvertStorage.get(farmerSalesAdvertId);
      if ("None" in farmerSalesAdvertOpt) {
        throw Error(
          `FarmerSalesAdvert with id=${farmerSalesAdvertId} not found`
        );
      }
      const farmerSalesAdvert = farmerSalesAdvertOpt.Some;
      adminProcessingAdvertStorage.insert(
        farmerSalesAdvert.id,
        farmerSalesAdvert
      );
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

      const warehouseManagerId = deliveryTender.warehouseManagerId;
      console.log("warehouseManagerId", warehouseManagerId);
      const warehouseManagerOpt =
        warehouseManagerStorage.get(warehouseManagerId);
      if ("None" in warehouseManagerOpt) {
        return Err({
          NotFound: `Warehouse manager with id=${warehouseManagerId} not found`,
        });
      }
      const warehouseManager = warehouseManagerOpt.Some;
      const warehouseManagerOwner = warehouseManager.owner;

      const reserveDistributorPayment = {
        warehouseManagerId: warehouseManagerId,
        price: cost,
        status: "pending",
        warehouseManagerPayer: warehouseManagerOwner,
        distributorReciever: distributorOwner,
        paid_at_block: None,
        memo: generateCorrelationId(deliveryTenderId),
      };

      console.log("reserveDistributorPayment", reserveDistributorPayment);
      pendingDistributorReserves.insert(
        reserveDistributorPayment.memo,
        reserveDistributorPayment
      );
      discardByTimeout(
        reserveDistributorPayment.memo,
        PAYMENT_RESERVATION_PERIOD
      );
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
      console.log("details", deliveryTenderId, amount);
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
      console.log("cost", cost);
      const distributorCompanyId = deliveryDetails.distributorsId;
      console.log("distributorCompanyId", distributorCompanyId);
      const distributorCompanyOpt =
        distributorsCompanyStorage.get(distributorCompanyId);
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
      pendingDriverReserves.insert(
        reserveDriverPayment.memo,
        reserveDriverPayment
      );
      discardByTimeout(reserveDriverPayment.memo, PAYMENT_RESERVATION_PERIOD);
      return Ok(reserveDriverPayment);
    }
  ),

  // complete a Driver Reserve Payment
  completeDriverPayment: update(
    [Principal, text, nat64, nat64, nat64],
    Result(Types.ReserveDriverPayment, Types.Message),
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

  // create a Warehouse Manager Reserve Payment
  createReserveWarehousePay: update(
    [text],
    Result(Types.ReserveWarehousePayment, Types.Message),
    (adminProcessingAdvertId) => {
      const adminProcessingAdvertOpt = adminProcessingAdvertStorage.get(
        adminProcessingAdvertId
      );
      if ("None" in adminProcessingAdvertOpt) {
        return Err({
          NotFound: `cannot reserve Payment: Admin advert with id=${adminProcessingAdvertId} not available`,
        });
      }
      const adminAdvert = adminProcessingAdvertOpt.Some;
      const warehouseManagerId = adminAdvert.warehouseManagerId;
      console.log("warehouseManagerId", warehouseManagerId);
      const warehouseManagerOpt =
        distributorsCompanyStorage.get(warehouseManagerId);
      if ("None" in warehouseManagerOpt) {
        return Err({
          NotFound: `warehouse Manager with id=${warehouseManagerId} not found`,
        });
      }
      const warehouseManager = warehouseManagerOpt.Some;
      const warehouseManagerOwner = warehouseManager.owner;

      const cost = adminAdvert.totalCost;

      const adminId = adminAdvert.adminId;
      console.log("adminId", adminId);
      const adminOpt = adminStorage.get(adminId);
      if ("None" in adminOpt) {
        return Err({
          NotFound: `Admin with id=${adminId} not found`,
        });
      }
      const admin = adminOpt.Some;
      const adminOwner = admin.owner;

      const reserveWarehouseManagerPayment = {
        adminId: adminId,
        price: cost,
        status: "pending",
        adminPayer: adminOwner,
        warehouseReciever: warehouseManagerOwner,
        paid_at_block: None,
        memo: generateCorrelationId(adminProcessingAdvertId),
      };

      console.log(
        "reserveWarehouseManagerPayment",
        reserveWarehouseManagerPayment
      );
      pendingWarehouseReserves.insert(
        reserveWarehouseManagerPayment.memo,
        reserveWarehouseManagerPayment
      );
      discardByTimeout(
        reserveWarehouseManagerPayment.memo,
        PAYMENT_RESERVATION_PERIOD
      );
      return Ok(reserveWarehouseManagerPayment);
    }
  ),

  // complete a Warehouse Manager Reserve Payment
  completeWarehousePayment: update(
    [Principal, text, nat64, nat64, nat64],
    Result(Types.ReserveWarehousePayment, Types.Message),
    async (reservor, adminProcessingAdvertId, reservePrice, block, memo) => {
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
      const pendingReservePayOpt = pendingWarehouseReserves.remove(memo);
      if ("None" in pendingReservePayOpt) {
        return Err({
          NotFound: `cannot complete the reserve: there is no pending reserve with id=${adminProcessingAdvertId}`,
        });
      }
      const reservedPay = pendingReservePayOpt.Some;
      const updatedReservePayment = {
        ...reservedPay,
        status: "completed",
        paid_at_block: Some(block),
      };
      const adminAdvertOpt = adminProcessingAdvertStorage.get(
        adminProcessingAdvertId
      );
      if ("None" in adminAdvertOpt) {
        throw Error(
          `Admin processing advert with id=${adminProcessingAdvertId} not found`
        );
      }
      const adminAdvert = adminAdvertOpt.Some;
      adminProcessingAdvertStorage.insert(adminAdvert.id, adminAdvert);
      persistedWarehouseReserves.insert(ic.caller(), updatedReservePayment);
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
    const advert = pendingAdminReserves.remove(memo);
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
