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
import {
  getCompletedDeliveryDetailsForProcessingCompany,
} from "../../../utils/deliveries";
import { getFarmerSalesAdvertsApprovedByProcessorCompany, getFarmerSalesAdvertsOfProcessorCompany, getPaidAdverts, markFarmerSalesAdvertAsApproved } from "../../../utils/advert";
import { getProduct } from "../../../utils/product";
import PayFarmer from "../components/PayFarmer";
import AddDeliveryDetails from "../DeliveryDetails/AddDeliveryDetails";
import { acceptDeliveryTender, getDeliveryTendersOfProcessingCompany } from "../../../utils/tender";
import ViewTenderProcessor from "../ViewTenderProcessor/ViewTenderProcessor";


const dropDownOptions = [
  { label: "Option1", value: "option1" },
  { label: "Option2", value: "option2" },
  { label: "Option3", value: "option3" },
];

export default function CompanyOverviewPage({ processorCompany }) {
  const [sliderState, setSliderState] = useState(0);
  const sliderRef = React.useRef(null);
  const [searchBarValue32, setSearchBarValue32] = useState("");
  const [loading, setLoading] = useState(false);
  const [newSalesAdverts, setNewSalesAdverts] = useState([]);
  const [approvedAdverts, setApprovedAdverts] = useState([]);
  const [paidAdverts, setPaidAdverts] = useState([]);
  const [pickedProducts, setPickedProducts] = useState([]);
  const [deliveryTenders, setDeliveryTenders] = useState([]);
  const [completeDeliveries, setCompleteDeliveries] = useState([]);
  const [balanceInfo, setBalanceInfo] = useState("0");

  const [tab, setTab] = useState("new");

  const symbol = "ICP"


  const { id } = processorCompany;

   const fetchCompleteDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const deliveryDetailsP = await getCompletedDeliveryDetailsForProcessingCompany(id);
      setCompleteDeliveries(deliveryDetailsP);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  });

  // getFarmerSalesAdvertsOfProcessorCompany
  const fetchNewSalesAdverts = useCallback(async () => {
    try {
      setLoading(true);
      setNewSalesAdverts(await getFarmerSalesAdvertsOfProcessorCompany(id));
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  });

  // getFarmerSalesAdvertsApprovedByProcessorCompany
  const fetchApprovedSalesAdverts = useCallback(async () => {
    try {
      setLoading(true);
      setApprovedAdverts(await getFarmerSalesAdvertsApprovedByProcessorCompany(id));
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  });

  // fetchPaidAdverts

  const fetchPaidAdverts = useCallback(async () => {
    try {
      setLoading(true);
      setPaidAdverts(await getPaidAdverts(id));
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  });

  // getDeliveryTendersOfProcessingCompany

  const fetchDeliveryTenders = useCallback(async () => {
    try {
      setLoading(true);
      setDeliveryTenders(await getDeliveryTendersOfProcessingCompany(id));
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  });


  const fetchPickedProducts = useCallback(async () => {
    try {
      setLoading(true);
      let res = await getFarmerSalesAdvertsApprovedByProcessorCompany(id);
      console.log("res", res);
      for (let i = 0; i < res.length; i++) {
        let product = await getProduct(res[i].productId);
        console.log("product dis", product)
        let exists = pickedProducts.some((item) => item.id === res[i].id);

        if (product.Ok.pickedUp === true) {
          // Check if record already exists
          if (!exists) {
            setPickedProducts((prev) => [...prev, res[i]]);
          }
          
        }
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  });

  const handleAccept = async (advertId) => {
    try {
      setLoading(true);
      await markFarmerSalesAdvertAsApproved(advertId);
      fetchNewSalesAdverts();
      fetchApprovedSalesAdverts();
      toast(<NotificationSuccess text="Advert accepted successfully." />);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast(<NotificationError text="Failed to accept advert." />);
    }
  };

  const handleAcceptTender = async (tenderId) => {
    try {
      setLoading(true);
      await acceptDeliveryTender(tenderId);
      fetchDeliveryTenders();
      toast(<NotificationSuccess text="Tender accepted successfully." />);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast(<NotificationError text="Failed to accept tender." />);
    }
  };


  useEffect(() => {
    // fetchPickedProducts();
    fetchDeliveryTenders();
    fetchPaidAdverts();
    fetchApprovedSalesAdverts();
    fetchNewSalesAdverts();
    fetchCompleteDeliveries();
  }, []);

  console.log("Approved", approvedAdverts);
  console.log("paidAdverts", paidAdverts);
  console.log("Picked Products", pickedProducts);
  console.log("salesAdverts", newSalesAdverts);
  console.log("deliveryTenders", deliveryTenders);
  console.log("completeDeliveries", completeDeliveries);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Helmet>
            <title>AgriChain</title>
            <meta
              name="description"
              content="Web site created using create-react-app"
            />
          </Helmet>
          <div className="flex flex-row justify-start items-start w-full h-full bg-gray-200 shadow-sm">
            <div className="mx-auto flex flex-col items-center justify-start w-[85%]">
              <div className="flex flex-col items-start justify-start w-full mt-[2rem]">
                <div className="flex flex-row justify-between items-center w-full">
                    <Img
                      src={processorCompany.logo}
                      alt="Logo"
                      className="h-[60px] w-[60px] rounded-[50%]"
                    />
                  <div className="flex flex-row justify-end items-center w-full gap-[21px]">
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
                              <p className="text-gray-700 font-bold">Company Namee</p>
                              <p className="text-gray-600">{processorCompany.name}</p>
                            </div>
                            <div className="mb-1">
                              <p className="text-gray-700 font-bold">Contact Email</p>
                              <p className="text-gray-600">{processorCompany.email}</p>
                            </div>
                            <div className="">
                              <p className="text-gray-700 font-bold">Business Type</p>
                              <p className="text-gray-600">{processorCompany.bussinessType}</p>
                            </div>
                            <div className="">
                              <p className="text-gray-700 font-bold">Years in Operation</p>
                              <p className="text-gray-600">{processorCompany.YearsInOperation}</p>
                            </div>
                          </div>
                        </div>
                         
                       
                      </div>
                    </div>
                    <div className="flex flex-row justify-end w-full p-[13px] bg-blue_gray-900_0c shadow-xs rounded-[19px]">
                      <div className="flex flex-col items-center justify-start w-[97%] mt-4 mr-1 gap-8">
                        <div className="flex flex-row justify-between items-center w-full">
                          <Text size="3xl" as="p">
                            Completed Deliveries
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
                            options={dropDownOptions}
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
                      {/* <Text size="6xl" as="p" className="mt-4 ml-[9px]">
                        Products
                      </Text> */}
                      <div className="flex flex-col items-start justify-between w-full mt-4 gap-[29px] ">
                        <TabList className="flex flex-row justify-between mt-2 w-[98%] items-center p-3 bg-white-A700_01 shadow-xs rounded-[25px]">
                          <Tab className="mt-0.5 ml-[13px] text-gray-900_01 text-[11px] font-normal">
                            <Button
                              color="blue_gray_900_0c"
                              size="6xl"
                              className="ml-px rounded-[20px]"
                              onClick={() => setTab("new")}
                            >
                              New Outreach
                            </Button>
                          </Tab>
                          <Tab className="mt-0.5 ml-[13px] text-gray-900_01 text-[11px] font-normal">
                            <Button
                              color="blue_gray_900_0c"
                              size="6xl"
                              className="ml-px rounded-[20px]"
                              onClick={() => setTab("Approved")}
                            >
                              Approved Adverts
                            </Button>
                          </Tab>
                          <Tab className="mt-0.5 ml-[13px] text-gray-900_01 text-[11px] font-normal">
                            <Button
                              color="blue_gray_900_0c"
                              size="6xl"
                              className="ml-px rounded-[20px]"
                              onClick={() => setTab("Tenders")}
                            >
                              Delivery Tenders
                            </Button>
                          </Tab>
                          <Tab className="mt-0.5 ml-[13px] text-gray-900_01 text-[11px] font-normal">
                            <Button
                              color="blue_gray_900_0c"
                              size="6xl"
                              className="ml-px rounded-[20px]"
                              onClick={() =>{
                                fetchPickedProducts();
                                setTab("Picked")
                              }}
                            >
                              Picked Products
                            </Button>
                          </Tab>
                          <Tab className="mt-0.5 ml-[13px] text-gray-900_01 text-[11px] font-normal">
                            <Button
                              color="blue_gray_900_0c"
                              size="6xl"
                              className="ml-px rounded-[20px]"
                              onClick={() =>{
                                setTab("Completed")
                              }}
                            >
                              Completed Farmer Pay
                            </Button>
                          </Tab>

                          <Tab className="mt-0.5 ml-[13px] text-gray-900_01 text-[11px] font-normal">
                            <Button
                              color="blue_gray_900_0c"
                              size="6xl"
                              className="ml-px rounded-[20px]"
                              onClick={() =>{
                                setTab("completedDel")
                              }}
                            >
                              Completed Delivery
                            </Button>
                          </Tab>
                        </TabList>
                      </div>
                      {[...Array(7)].map((_, index) => (
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
                                              <th className="px-4 py-2">Product ID</th>
                                              <th className="px-4 py-2">Quantity</th>
                                              <th className="px-4 py-2">Price (ICP)</th>
                                              <th className="px-4 py-2">Status</th>
                                              <th className="px-4 py-2">Farmer Paid</th>
                                              <th className="px-4 py-2">Action</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {newSalesAdverts.map((saleAdvert, index) => (
                                              <tr key={index} className="bg-white border-t">
                                                <td className="px-4 py-2">{saleAdvert.productId}</td>
                                                <td className="px-4 py-2">{saleAdvert.quantity.toString()} Kg</td>
                                                <td className="px-4 py-2">{(saleAdvert.price / BigInt(10 ** 8)).toString()} ICP</td>
                                                <td className="px-4 py-2">{saleAdvert.status}</td>
                                                <td className="px-4 py-2">{saleAdvert.farmerPaid.toString()}</td>
                                                <td className="px-4 py-2">
                                                  <Button
                                                    color="blue_gray_900_02"
                                                    className="min-w-[115px] rounded-[28px]"
                                                    size="6xl"
                                                    onClick={() => handleAccept(saleAdvert.id)}
                                                  >
                                                    Accept
                                                  </Button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                  </>
                                ) : tab === "Approved" ? (
                                  <>
                                    <div className="overflow-x-auto w-full">
                                      <table className="table-auto w-full bg-white-A700_01 shadow-xs rounded-[12px]">
                                        <thead>
                                          <tr>
                                            <th className="px-4 py-2">Product ID</th>
                                            <th className="px-4 py-2">Quantity</th>
                                            <th className="px-4 py-2">Price (ICP)</th>
                                            <th className="px-4 py-2">Status</th>
                                            <th className="px-4 py-2">Farmer Paid</th>
                                            <th className="px-4 py-2">Action</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {approvedAdverts.map((saleAdvert, index) => (
                                            <tr key={index} className="bg-white border-t">
                                              <td className="px-4 py-2">{saleAdvert.productId}</td>
                                              <td className="px-4 py-2">{saleAdvert.quantity.toString()}</td>
                                              <td className="px-4 py-2">{(saleAdvert.price / BigInt(10 ** 8)).toString()} ICP</td>
                                              <td className="px-4 py-2">{saleAdvert.status}</td>
                                              <td className="px-4 py-2">{saleAdvert.farmerPaid.toString()}</td>
                                              <td className="px-4 py-2">
                                                <AddDeliveryDetails saleAdvert={saleAdvert} />
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>

                                  </>
                                ) : tab === "Tenders" ? (
                                  <>
                                    <div className="overflow-x-auto w-full">
                                      <table className="table-auto w-full bg-white-A700_01 shadow-xs rounded-[12px]">
                                        <thead>
                                          <tr>
                                            <th className="px-4 py-2">Tender Title</th>
                                            <th className="px-4 py-2">Tender Description</th>
                                            <th className="px-4 py-2">Delivery Weight</th>
                                            <th className="px-4 py-2">Cost/KG (ICP)</th>
                                            <th className="px-4 py-2">Additional Cost (ICP)</th>
                                            <th className="px-4 py-2">Action</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {deliveryTenders.map((deliveryTender, index) => (
                                            <tr key={index} className="bg-white border-t">
                                              <td className="px-4 py-2">{deliveryTender.tenderTitle}</td>
                                              <td className="px-4 py-2">{deliveryTender.tenderDescription}</td>
                                              <td className="px-4 py-2">{deliveryTender.deliveryWeight.toString()} Kg</td>
                                              <td className="px-4 py-2">{(deliveryTender.costPerWeight / BigInt(10 ** 8)).toString()} ICP</td>
                                              <td className="px-4 py-2">{(deliveryTender.additionalCost / BigInt(10 ** 8)).toString()} ICP</td>
                                              <td className="px-4 py-2">
                                                <Button
                                                  size="6xl"
                                                  color="blue_gray_900_02"
                                                  className="min-w-[115px] rounded-[28px]"
                                                  onClick={() => handleAcceptTender(deliveryTender.id)}
                                                >
                                                  Accept
                                                </Button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>

                                  </>

                                ):tab === "Picked" ? (
                                  <>
                                   <div className="overflow-x-auto w-full">
                                      <table className="table-auto w-full bg-white-A700_01 shadow-xs rounded-[12px]">
                                        <thead>
                                          <tr>
                                            <th className="px-4 py-2">Product ID</th>
                                            <th className="px-4 py-2">Quantity</th>
                                            <th className="px-4 py-2">Total Price (ICP)</th>
                                            <th className="px-4 py-2">Status</th>
                                            <th className="px-4 py-2">Farmer Paid</th>
                                            <th className="px-4 py-2">Action</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {pickedProducts.map((saleAdvert, index) => (
                                            <tr key={saleAdvert.id} className="bg-white border-t">
                                              <td className="px-4 py-2">{saleAdvert.productId}</td>
                                              <td className="px-4 py-2">{saleAdvert.quantity.toString()} Kg</td>
                                              <td className="px-4 py-2">
                                                {((saleAdvert.price / BigInt(10 ** 8)) * saleAdvert.quantity).toString()} ICP
                                              </td>
                                              <td className="px-4 py-2">{saleAdvert.status}</td>
                                              <td className="px-4 py-2">{saleAdvert.farmerPaid.toString()}</td>
                                              <td className="px-4 py-2">
                                                <PayFarmer saleAdvert={saleAdvert} fetchPaidAdverts={fetchPaidAdverts} />
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>

                                  </>
                                ):tab === "Completed" ?(
                                  <>
                                <div className="overflow-x-auto w-full">
                                  <table className="table-auto w-full bg-white-A700_01 shadow-xs rounded-[12px]">
                                    <thead>
                                      <tr>
                                        <th className="px-4 py-2">Product ID</th>
                                        <th className="px-4 py-2">Quantity</th>
                                        <th className="px-4 py-2">Total Price (ICP)</th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2">Farmer Paid</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {paidAdverts.map((saleAdvert, index) => (
                                        <tr key={saleAdvert.id} className="bg-white border-t">
                                          <td className="px-4 py-2">{saleAdvert.productId}</td>
                                          <td className="px-4 py-2">{saleAdvert.quantity.toString()}</td>
                                          <td className="px-4 py-2">
                                            {((saleAdvert.price / BigInt(10 ** 8)) * saleAdvert.quantity).toString()} ICP
                                          </td>
                                          <td className="px-4 py-2">{saleAdvert.status}</td>
                                          <td className="px-4 py-2"> {saleAdvert.farmerPaid.toString()}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                </>
                                ):tab === "completedDel" ? (
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
                                                <ViewTenderProcessor 
                                                  deliveryDetailId={deliveryDetail.id} 
                                                  companyId={id} 
                                                />
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>

                                </>
                                ):(
                                  <></>
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
                          Focus on optimizing yield and minimizing waste: Implement efficient 
                          processing techniques to maximize product extraction and minimize byproduct waste. Explore 
                          repurposing byproducts into valuable secondary products.
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
                          <div className="flex flex-row justify-start items-start w-full gap-1.5">
                            <Img
                              src={Images.img_image_194}
                              alt="image183_one"
                              className="h-[52px] w-[52px] rounded-[50%]"
                            />
                            <div className="flex flex-col items-start justify-start w-[80%] gap-[17px]">
                              <div className="flex flex-col items-start justify-start w-[97%] ml-[7px]">
                                <div className="flex flex-row justify-between items-center w-full">
                                  <Text size="2xl" as="p">
                                    David Johnson
                                  </Text>
                                  <Img
                                    src={Images.img_image_205}
                                    alt="image205_one"
                                    className="w-[9%] object-cover rounded-[9px]"
                                  />
                                </div>
                                <Text as="p" className="mt-1.5">
                                  on Product - SKU789
                                </Text>
                                <Text as="p" className="mt-5">
                                  Best product I&#39;ve ever
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
                        <a
                          href="#"
                          className="flex justify-center items-center w-[289px] h-[47px] px-[35px] py-4 bg-white-A700_01 text-shadow-ts1 rounded-[18px]"
                        >
                          <Text size="2xl" as="p" className="!text-gray-500_02">
                            View All
                          </Text>
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-row justify-center w-full p-[22px] bg-blue_gray-900_0c shadow-xs rounded-[19px]">
                      <div className="flex flex-col items-start justify-start w-[95%] mt-3.5 gap-8">
                        <Text size="3xl" as="p" className="ml-0.5">
                          Manage Tender Requests
                        </Text>
                        <div className="flex flex-row justify-start items-start ml-[9px] gap-[19px]">
                          <Img
                            src={Images.img_image_196}
                            alt="image196_one"
                            className="w-[13%] mt-1 object-cover rounded-[12px]"
                          />
                          <Text as="p" className="w-[79%] !leading-[18px]">
                            You have 52 open Tender
                            <br />
                            requests to process. This
                            <br />
                            includes 8 new requests
                          </Text>
                        </div>
                        <a
                          href="#"
                          className="flex justify-center items-center w-[280px] h-[39px] px-[35px] py-3 border-gray-600_07 border border-solid bg-white-A700_01 text-shadow-ts rounded-[19px]"
                        >
                          <Text size="2xl" as="p" className="!text-gray-500_02">
                            View All
                          </Text>
                        </a>
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
