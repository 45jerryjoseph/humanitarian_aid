import React, { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { TabPanel, TabList, Tab, Tabs } from "react-tabs";

import {
  Text,
  Img,
  Button,
  NotificationSuccess,
  NotificationError,
  Loader,
  SelectBox,
} from "../../../components/utils";
import * as Images from "../../../assets/images";
import Wallet from "../../../components/Wallet";
import { toast } from "react-toastify";


import { addDriverIdToDeliveryDetails, assignDriver, getAcceptedDeliveryDetailsInDistributorsCompany, getCompletedDeliveryDetailsForDistributorCompany, getDeliveryDetailsPickedUpForDistributorCompany, getNewDeliveryDetailsInDistributorsCompany } from "../../../utils/deliveries";
import AssignDrivers from "../components/AssignDriver";
import DeliveryTender from "../DeliveryTender/DeliveryTender";
import AssignVehicle from "../components/AssignVehicle";
import { assignVehicle } from "../../../utils/driver";
import AddVehicle from "../AddVehicle/AddVehicle";
import { createVehicle } from "../../../utils/vehicle";
import ViewTender from "../components/ViewTender";

const stauses = [
  { label: "Completed", value: "completed" },
  { label: "Picked up", value: "picked-up" },
  { label: "On transit", value: "on-transit" },
  { label: "At delivery", value: "at-delivery" },
];

export default function CompanyOverviewPage({ distributor }) {
  const [sliderState, setSliderState] = React.useState(0);
  const sliderRef = React.useRef(null);
  const [searchBarValue32, setSearchBarValue32] = React.useState("");
  const [loading, setLoading] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState([]);
  const [pickedDeliveryDetails, setPickedDeliveryDetails] = useState([]);
  const [acceptedDeliveryDetails, setAcceptedDeliveryDetails] = useState([]);
  const [completeDeliveries, setCompleteDeliveries] = useState([]);
  const [tab, setTab] = useState("new");
  const [balanceInfo, setBalanceInfo] = useState("0");
  const symbol = "ICP";



  const { id } = distributor;



  // addVehicleFunc
  const addVehicleFunc = async (data) => {
    try {
      setLoading(true);
      await createVehicle(data,id);
      fetchNewDeliveryDetails();
      fetchActiveDeliveryDetails();
      toast(<NotificationSuccess text="Vehicle added successfully." />);
    } catch (error) {
      console.log(error);
      toast(<NotificationError text="Failed to add vehicle." />);
    } finally {
      setLoading(false);
    }
  };

  // assigndriver
  const saveDriver = async (id, driverId) => {
    try {
      setLoading(true);
      await addDriverIdToDeliveryDetails(id, driverId);
      fetchNewDeliveryDetails();
      fetchActiveDeliveryDetails();
      toast(<NotificationSuccess text="Driver assigned successfully." />);
    } catch (error) {
      console.log(error);
      toast(<NotificationError text="Failed to assign driver." />);
    } finally {
      setLoading(false);
    }
  };

  // saveVehicle
  const saveVehicle = async (driverId, vehicleId) => {
    try {
      setLoading(true);
      await assignVehicle(driverId, vehicleId);
      fetchNewDeliveryDetails();
      fetchActiveDeliveryDetails();
      toast(<NotificationSuccess text="Vehicle assigned successfully." />);
    } catch (error) {
      console.log(error);
      toast(<NotificationError text="Failed to assign vehicle." />);
    } finally {
      setLoading(false);
    }
  };

 










  // getCompletedDeliveryDetailsForDistributorCompany
  const fetchCompleteDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const deliveryDetailsP = await getCompletedDeliveryDetailsForDistributorCompany(id);
      setCompleteDeliveries(deliveryDetailsP);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  });
  


  const fetchNewDeliveryDetails = useCallback(async () => {
    try {
      setLoading(true);
      const deliveryDetailsP = await getNewDeliveryDetailsInDistributorsCompany(id);
      setDeliveryDetails(deliveryDetailsP);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  });

  // getDeliveryDetailsPickedUpForDistributorCompany
  const fetchPickedDeliveryDetails = useCallback(async () => {
    try {
      setLoading(true);
      const deliveryDetailsP = await getDeliveryDetailsPickedUpForDistributorCompany(id);
      setPickedDeliveryDetails(deliveryDetailsP);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  });

  const fetchActiveDeliveryDetails = useCallback(async () => {
    try {
      setLoading(true);
      const deliveryDetailsP = await getAcceptedDeliveryDetailsInDistributorsCompany(id);
      setAcceptedDeliveryDetails(deliveryDetailsP);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  });

  

  useEffect(() => {
    fetchActiveDeliveryDetails();
    fetchNewDeliveryDetails();
    fetchPickedDeliveryDetails();
    fetchCompleteDeliveries();
  }, []);



  console.log("deliveryDetails", deliveryDetails);
  console.log("acceptedDeliveryDetails", acceptedDeliveryDetails);
  console.log("pickedDeliveryDetails", pickedDeliveryDetails);
  console.log("completeDeliveries", completeDeliveries);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Helmet>
            <title>AgriChain♾️</title>
            <meta
              name="description"
              content="Web site created using create-react-app"
            />
          </Helmet>
          <div className="flex flex-row justify-start items-start w-full h-full bg-gray-200 shadow-sm">
            <div className="mx-auto flex flex-col items-center justify-start w-[85%]">
              <div className="flex flex-col items-start justify-start w-full mt-[2rem]">
                <div className="flex flex-row justify-between items-center w-full">
                  <div className="flex flex-row justify-end items-center w-full gap-[21px]">
                    <AddVehicle save={addVehicleFunc} />
                    <Wallet setBalanceInfo={setBalanceInfo} />
                  </div>
                </div>
            
                <div className="flex flex-row justify-start items-start w-full mt-[45px] gap-[29px]">
                  <div className="flex flex-col items-center justify-start w-[66%] gap-7">
                    <div className="flex flex-row justify-start w-full p-[29px] bg-blue_gray-900_0c shadow-xs rounded-[19px]">
                      <div className="flex flex-col items-start justify-start w-[50%] mt-2.5 mb-[22px]">
                        <Text size="4xl" as="p">
                          Overview
                        </Text>
                        <div className="max-w-lg mx-auto p-3 bg-gray-200 shadow-md rounded-lg w-full">
                          <div className="grid grid-cols-2 gap-1">
                            <div className="mb-1">
                              <p className="text-gray-700 font-bold">Company Name</p>
                              <p className="text-gray-600">{distributor.name}</p>
                            </div>
                            <div className="mb-1">
                              <p className="text-gray-700 font-bold">Contact Email</p>
                              <p className="text-gray-600">{distributor.email}</p>
                            </div>
                            <div className="">
                              <p className="text-gray-700 font-bold">Business Type</p>
                              <p className="text-gray-600">{distributor.bussinessType}</p>
                            </div>
                            <div className="">
                              <p className="text-gray-700 font-bold">Years in Operation</p>
                              <p className="text-gray-600">{distributor.YearsInOperation}</p>
                            </div>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                    <div className="flex flex-row justify-end w-full p-[13px] bg-blue_gray-900_0c shadow-xs rounded-[19px]">
                      <div className="flex flex-col items-center justify-start w-[97%] mt-4 mr-1 gap-8">
                        <div className="flex flex-row justify-between items-center w-full">
                          <Text size="3xl" as="p">
                            Completed Delivery
                          </Text>
                          <SelectBox
                            size="xs"
                            indicator={
                              <Img
                                src={Images.img_arrow_drop_down_1}
                                alt="Arrow drop down 1"
                              />
                            }
                            name="search"
                            placeholder="Search by SKU"
                            className="w-[23%] gap-px !text-gray-400_02 shadow-xl rounded-[15px]"
                          />
                        </div>
                        <div className="flex flex-row justify-center w-[97%]">
                          <div className="flex flex-row justify-center items-start w-full">
                            <div className="flex flex-col items-start justify-start w-[4%] gap-[47px] z-[1]">
                              <Text size="2xl" as="p">
                                30
                              </Text>
                              <Text size="2xl" as="p">
                                24
                              </Text>
                              <Text size="2xl" as="p">
                                16
                              </Text>
                              <Text size="2xl" as="p">
                                8
                              </Text>
                              <Text size="2xl" as="p">
                                0
                              </Text>
                            </div>
                            <div className="flex flex-col items-center justify-start w-[97%] mt-[11px] gap-[23px]">
                              <Img
                                src={Images.img_graph}
                                alt="graph_one"
                                className="h-[241px]"
                              />
                              <div className="flex flex-row justify-between items-center w-[98%]">
                               
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Tabs
                      className="flex flex-col items-start justify-end w-full p-[21px] bg-blue_gray-900_0c shadow-xs rounded-[19px]"
                      selectedTabClassName="!text-gray-900_01 bg-blue_gray-900_0c shadow-xs rounded-[20px]"
                      selectedTabPanelClassName="mt-[20px] mb-[7px] ml-[7px] relative tab-panel--selected"
                    >
                      <Text size="6xl" as="p" className="mt-4 ml-[9px]">
                        Deliveries
                      </Text>
                      <div className="flex flex-col items-start justify-start w-full  mt-4 gap-[19px]">
                        <TabList className="flex flex-row justify-between w-[98%] mt-2 p-3 items-center bg-white-A700_01 gap-[30px] shadow-xs rounded-[25px]">
                          <Tab className="mt-0.5 text-gray-900_01 text-[11px] font-normal">
                            <Button
                              color="blue_gray_900_0c"
                              size="6xl"
                              className="ml-px rounded-[20px]"
                              onClick={() => setTab("new")}
                            >
                              New Delivery Details
                            </Button>
                          </Tab>
                          <Tab className="mt-0.5 text-gray-900_01 text-[11px] font-normal">
                            <Button
                              color="blue_gray_900_0c"
                              size="6xl"
                              className="ml-px rounded-[20px]"
                              onClick={() => setTab("Accepted")}
                            >
                              Accepted Delivery Details
                            </Button>
                          </Tab>
                          <Tab className="mt-0.5 text-gray-900_01 text-[11px] font-normal">
                            <Button
                              color="blue_gray_900_0c"
                              size="6xl"
                              className="ml-px rounded-[20px]"
                              onClick={() => setTab("Picked")}
                            >
                              Picked Delivery 
                            </Button>
                          </Tab>
                          <Tab className="mt-0.5 text-gray-900_01 text-[11px] font-normal">
                            <Button
                              color="blue_gray_900_0c"
                              size="6xl"
                              className="ml-px rounded-[20px]"
                              onClick={() => setTab("completed")}
                            >
                              Completed Delivery
                            </Button>
                          </Tab>
                        </TabList>
                      </div>
                      {[...Array(5)].map((_, index) => (
                        <TabPanel
                          key={`tab-panel${index}`}
                          className="w-[99%] absolute"
                        >
                          <div className="flex flex-col items-center justify-start w-[99%] mb-[7px] ml-[7px]">
                            <div className="flex flex-col items-center justify-start w-full gap-[17px]">
                              <div className="flex flex-col w-full pb-[18px] gap-[17px]">
                                <div className="h-[3px] w-[98%] bg-gray-400_02" />
                                {tab === "new" ? (
                                  <>
                                    <div className="overflow-x-auto w-full">
                                      <table className="table-auto w-full bg-white-A700_01 shadow-xs rounded-[12px]">
                                        <thead>
                                          <tr>
                                            <th className="px-4 py-2">Pickup Date</th>
                                            <th className="px-4 py-2">Pickup Region</th>
                                            <th className="px-4 py-2">Delivered Region</th>
                                            <th className="px-4 py-2">Priority</th>
                                            <th className="px-4 py-2">Description</th>
                                            <th className="px-4 py-2">Actions</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {deliveryDetails.map((deliveryDetail, index) => (
                                            <tr key={index} className="bg-white border-t">
                                              <td className="px-4 py-2">{deliveryDetail.pickupDate}</td>
                                              <td className="px-4 py-2">{deliveryDetail.pickupRegion}</td>
                                              <td className="px-4 py-2">{deliveryDetail.deliveredRegion}</td>
                                              <td className="px-4 py-2">{deliveryDetail.deliveryPriority}</td>
                                              <td className="px-4 py-2">{deliveryDetail.deliveryDescription}</td>
                                              <td className="px-4 py-2">
                                                <DeliveryTender deliveryDetail={deliveryDetail} />
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>

                                  </>
                                ) : tab === "Accepted" ? (
                                  <>
                                     <div className="overflow-x-auto w-full">
                                        <table className="table-auto w-full bg-white-A700_01 shadow-xs rounded-[12px]">
                                          <thead>
                                            <tr>
                                              <th className="px-4 py-2">Pickup Date</th>
                                              <th className="px-4 py-2">Pickup Region</th>
                                              <th className="px-4 py-2">Delivered Region</th>
                                              <th className="px-4 py-2">Priority</th>
                                              <th className="px-4 py-2">Description</th>
                                              <th className="px-4 py-2">Actions</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {acceptedDeliveryDetails.map((deliveryDetail, index) => (
                                              <tr key={index} className="bg-white border-t">
                                                <td className="px-4 py-2">{deliveryDetail.pickupDate}</td>
                                                <td className="px-4 py-2">{deliveryDetail.pickupRegion}</td>
                                                <td className="px-4 py-2">{deliveryDetail.deliveredRegion}</td>
                                                <td className="px-4 py-2">Priority: {deliveryDetail.deliveryPriority}</td>
                                                <td className="px-4 py-2">{deliveryDetail.deliveryDescription}</td>
                                                <td className="px-4 py-2 flex justify-between items-center">
                                                  <AssignDrivers deliveryDetail={deliveryDetail} save={saveDriver} />
                                                  <AssignVehicle deliveryDetail={deliveryDetail} save={saveVehicle} />
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>

                                  </>
                                ) : tab === "Picked" ? (
                                  <>
                                  <div className="overflow-x-auto w-full">
                                    <table className="table-auto w-full bg-white-A700_01 shadow-xs rounded-[12px]">
                                      <thead>
                                        <tr>
                                          <th className="px-4 py-2">Pickup Date</th>
                                          <th className="px-4 py-2">Pickup Region</th>
                                          <th className="px-4 py-2">Delivered Region</th>
                                          <th className="px-4 py-2">Priority</th>
                                          <th className="px-4 py-2">Description</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {pickedDeliveryDetails.map((deliveryDetail, index) => (
                                          <tr key={index} className="bg-white border-t">
                                            <td className="px-4 py-2">{deliveryDetail.pickupDate}</td>
                                            <td className="px-4 py-2">{deliveryDetail.pickupRegion}</td>
                                            <td className="px-4 py-2">{deliveryDetail.deliveredRegion}</td>
                                            <td className="px-4 py-2">Priority: {deliveryDetail.deliveryPriority}</td>
                                            <td className="px-4 py-2">{deliveryDetail.deliveryDescription}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>

                               </>
                                ): tab === "completed" ? (
                                  <>
                                  <div className="overflow-x-auto w-full">
                                    <table className="table-auto w-full bg-white-A700_01 shadow-xs rounded-[12px]">
                                      <thead>
                                        <tr>
                                          <th className="px-4 py-2">Pickup Date</th>
                                          <th className="px-4 py-2">Pickup Region</th>
                                          <th className="px-4 py-2">Delivered Region</th>
                                          <th className="px-4 py-2">Priority</th>
                                          <th className="px-4 py-2">Description</th>
                                          <th className="px-4 py-2">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {completeDeliveries.map((deliveryDetail, index) => (
                                          <tr key={index} className="bg-white border-t">
                                            <td className="px-4 py-2">{deliveryDetail.pickupDate}</td>
                                            <td className="px-4 py-2">{deliveryDetail.pickupRegion}</td>
                                            <td className="px-4 py-2">{deliveryDetail.deliveredRegion}</td>
                                            <td className="px-4 py-2">Priority: {deliveryDetail.deliveryPriority}</td>
                                            <td className="px-4 py-2">{deliveryDetail.deliveryDescription}</td>
                                            <td className="px-4 py-2">
                                              <ViewTender deliveryDetailId={deliveryDetail.id} companyId={id} />
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>

                                </>
                                ):(
                                  <>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </TabPanel>
                      ))}
                    </Tabs>
                    

                    <div className="flex flex-row justify-start w-full p-7 bg-blue_gray-900_0c shadow-xs rounded-[19px]">
                      <div className="flex flex-col items-start justify-start w-[95%] mt-[9px] ml-[3px]">
                        <Text size="3xl" as="p" className="ml-px">
                          Expand Your Customer Base
                        </Text>
                        <Text as="p" className="mt-[31px] ml-px">
                        Optimize your delivery routes and consider regional hubs to ensure faster product delivery to farmers,
                        <br />
                         improving their efficiency and your customer satisfaction.
                        </Text>
                      
                        <div className="flex flex-row justify-start mt-[30px]">
                          <Button
                            size="6xl"
                            leftIcon={
                              <Img
                                src={Images.img_logo_facebook_1}
                                alt="Logo facebook 1"
                              />
                            }
                            className="gap-3 !text-blue_gray-900_02 border-gray-600_01 border border-solid min-w-[171px] rounded-[19px]"
                          >
                            Facebook
                          </Button>
                          <Button
                            size="6xl"
                            leftIcon={
                              <Img
                                src={Images.img_logo_twitter_1}
                                alt="Logo twitter 1"
                              />
                            }
                            className="ml-[50px] gap-3 !text-blue_gray-900_02 border-gray-600_01 border border-solid min-w-[180px] rounded-[19px]"
                          >
                            Twitter
                          </Button>
                          <Button
                            size="6xl"
                            leftIcon={
                              <Img
                                src={Images.img_logo_linkedin_1}
                                alt="Logo linkedin 1"
                              />
                            }
                            className="ml-[39px] gap-[13px] !text-blue_gray-900_02 border-gray-600_01 border border-solid min-w-[174px] rounded-[19px]"
                          >
                            Linkedin
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-start w-[32%] gap-[30px]">
                    <div className="justify-center w-full gap-[15px] grid-cols-2 grid">
                      <div className="flex flex-col items-center justify-start w-full p-[11px] bg-blue_gray-900_0c shadow-xs rounded-[19px]">
                        <Img
                          src={Images.img_transactions}
                          alt="total"
                          className="h-[35px] w-[35px]"
                        />
                        <Text size="lg" as="p" className="mt-[3px] text-center">
                          Total Transactions
                        </Text>
                        <Text
                          size="4xl"
                          as="p"
                          className="mt-[9px] mb-2.5 text-center"
                        >
                          20,850 {symbol}
                        </Text>
                      </div>
                      <div className="flex flex-col items-center justify-start w-full gap-1.5 p-2.5 bg-blue_gray-900_0c shadow-xs rounded-[19px]">
                        <Img
                          src={Images.img_expenses}
                          alt="expenses_one"
                          className="h-[35px] w-[35px]"
                        />
                        <div className="flex flex-col items-center justify-start w-[67%] mb-2.5 gap-2">
                        <Text size="lg" as="p" className="text-center">
                          Wallet Balance
                          </Text>
                          <Text size="4xl" as="p" className="text-center">
                             {balanceInfo} {symbol}
                          </Text>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-start w-full p-2.5 bg-blue_gray-900_0c shadow-xs rounded-[19px]">
                        <Img
                          src={Images.img_group_11}
                          alt="image"
                          className="h-[35px] w-[35px]"
                        />
                        <Text size="lg" as="p" className="mt-[5px] text-center">
                          Total Income
                        </Text>
                        <Text
                          size="4xl"
                          as="p"
                          className="mt-[9px] mb-2.5 text-center"
                        >
                          20,850 {symbol}
                        </Text>
                      </div>
                      <div className="flex flex-col items-center justify-start w-full gap-[5px] p-2.5 bg-blue_gray-900_0c shadow-xs rounded-[19px]">
                        <Img
                          src={Images.img_group_11}
                          alt="image"
                          className="h-[35px] w-[35px]"
                        />
                        <div className="flex flex-col items-center justify-start w-[67%] mb-2.5 gap-[9px]">
                          <Text size="lg" as="p" className="text-center">
                            Total Revenue
                          </Text>
                          <Text size="4xl" as="p" className="text-center">
                            20,850 {symbol}
                          </Text>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-end w-full p-6 bg-blue_gray-900_0c shadow-xs rounded-[19px]">
                      <div className="flex flex-col items-start justify-start w-full mt-[13px] mb-[3px] gap-[26px]">
                        <Text size="3xl" as="p" className="ml-1.5">
                          Reviews
                        </Text>
                        <div className="flex flex-col w-[99%] ml-1 gap-[30px]">
                          <div className="flex flex-row justify-center w-full">
                            <div className="flex flex-col items-center justify-start w-full gap-[13px]">
                              <div className="flex flex-row justify-between items-start w-full">
                                <div className="flex flex-row justify-center w-[75%]">
                                  <div className="flex flex-row justify-start items-center w-full gap-[11px]">
                                    <Img
                                      src={Images.img_image_194}
                                      alt="john_doe_one"
                                      className="h-[52px] w-[52px] rounded-[50%]"
                                    />
                                    <div className="flex flex-col items-start justify-start w-[70%] gap-[7px]">
                                      <Text size="2xl" as="p">
                                        John Doe
                                      </Text>
                                      <Text as="p">on Product - SKU123</Text>
                                    </div>
                                  </div>
                                </div>
                                <Img
                                  src={Images.img_image_198}
                                  alt="john_doe_three"
                                  className="w-[8%] object-cover rounded-[10px]"
                                />
                              </div>
                              <Text as="p">Great product, highly</Text>
                              <div className="flex flex-row justify-between w-[53%]">
                                <Img
                                  src={Images.img_chat_circle_dots}
                                  alt="on_product"
                                  className="h-[24px] w-[24px] opacity-0.78"
                                />
                                <Img
                                  src={Images.img_thumbs_up_1}
                                  alt="image"
                                  className="h-[24px] w-[24px] opacity-0.78"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row justify-center w-full">
                            <div className="flex flex-row justify-start items-start w-full gap-1.5">
                              <Img
                                src={Images.img_image_194}
                                alt="image200_one"
                                className="h-[52px] w-[52px] rounded-[50%]"
                              />
                              <div className="flex flex-col items-start justify-start w-[80%] gap-[15px]">
                                <div className="flex flex-col items-start justify-start w-[98%] ml-[5px]">
                                  <div className="flex flex-row justify-between items-center w-full">
                                    <Text size="2xl" as="p">
                                      Jane Smith
                                    </Text>
                                    <Img
                                      src={Images.img_image_211}
                                      alt="image211_one"
                                      className="w-[10%] object-cover rounded-[10px]"
                                    />
                                  </div>
                                  <Text as="p" className="mt-1">
                                    on Product - SKU456
                                  </Text>
                                  <Text as="p" className="mt-5">
                                    Very useful, exceeded my
                                  </Text>
                                </div>
                                <div className="flex flex-row justify-between w-[66%]">
                                  <Img
                                    src={Images.img_chat_circle_dots}
                                    alt="image"
                                    className="h-[24px] w-[24px] opacity-0.78"
                                  />
                                  <Img
                                    src={Images.img_thumbs_up_1}
                                    alt="thumbsupone_one"
                                    className="h-[24px] w-[24px] opacity-0.78"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                        </div>
                        <a
                          href="View All"
                          className="flex justify-center items-center w-[289px] h-[47px] px-[35px] py-4 bg-white-A700_01 text-shadow-ts1 rounded-[18px]"
                        >
                          <Text size="2xl" as="p" 
                          color="blue_gray_900_02"
                          className="min-w-[115px] rounded-[28px] !text-gray-500_02"
                          >
                            View All
                          </Text>
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-row justify-center w-full p-[22px] bg-blue_gray-900_0c shadow-xs rounded-[19px]">
                      
                    </div>
                    <div className="flex flex-col items-start justify-start w-full gap-[25px] p-[23px] bg-blue_gray-900_0c shadow-xs rounded-[19px]">
                      <Text size="3xl" as="p" className="mt-[15px] ml-[9px]">
                         Ads
                      </Text>
                      <div className="flex flex-col items-center justify-start w-full mb-[97px] gap-3">
                        <Text as="p">
                          Need some ideas for your next product?
                        </Text>
                        <div className="flex flex-col w-full gap-[5px]">
                          <div className="flex flex-row justify-start w-full p-2 bg-gray-400_30 shadow-xs rounded-[12px]">
                            <div className="flex flex-row justify-start items-center w-[95%] gap-3 my-[7px]">
                              <Img
                                src={Images.img_image_194}
                                alt="product_name"
                                className="h-[52px] w-[52px] rounded-[50%]"
                              />
                              <div className="flex flex-col items-start justify-start w-[76%] gap-[9px]">
                                <Text size="2xl" as="p">
                                  Bulk Seed Delivery Solutions
                                </Text>
                                <Text as="p">Streamline your seed distribution with our efficient bulk delivery options. Reduce handling costs,
                                 ensure timely arrivals for farmers, and boost your profitability.</Text>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row justify-start w-full p-2 bg-gray-400_30 shadow-xs rounded-[12px]">
                            <div className="flex flex-row justify-start items-center w-[95%] gap-3 my-[7px]">
                              <Img
                                src={Images.img_image_194}
                                alt="image194_one"
                                className="h-[52px] w-[52px] rounded-[50%]"
                              />
                              <div className="flex flex-col items-start justify-start w-[76%] gap-[9px]">
                                <Text size="2xl" as="p">
                                  Farm-to-Table Traceability Platform:
                                </Text>
                                <Text as="p">Empower your distributors with our innovative traceability platform.
                                 Track produce from farm to fork, enhance transparency, and build trust with retailers and consumers.</Text>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row justify-start w-full p-2 bg-gray-400_30 shadow-xs rounded-[12px]">
                            <div className="flex flex-row justify-start items-center w-[95%] gap-3 my-[7px]">
                              <Img
                                src={Images.img_image_194}
                                alt="image194_one"
                                className="h-[52px] w-[52px] rounded-[50%]"
                              />
                              <div className="flex flex-col items-start justify-start w-[76%] gap-[9px]">
                                <Text size="2xl" as="p">
                                  Mobile Farmer Education App:
                                </Text>
                                <Text as="p">Revolutionize farmer outreach with our mobile education app.
                                      Equip distributors with targeted content and resources to educate farmers on best practices,
                                      driving sales of essential products.</Text>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
