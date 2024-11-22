import React from "react";
import { Helmet } from "react-helmet";
import * as Images from "../../assets/images";
// import { Text, Button, Input } from "../../components";
import { Img } from "../../components/utils/Img";
import { Text } from "../../components/utils/Text";
import { Button } from "../../components/utils/Button";
import { Input } from "../../components/utils/Input";
import { Link } from "react-router-dom";

export default function HomeLandingpagePage() {
  const [searchBarValue, setSearchBarValue] = React.useState("");

  return (
    <>
      <Helmet>
        <title>AgriChain♾️</title>
        <meta
          name="description"
          content="Web site created using create-react-app"
        />
      </Helmet>
      <div className="flex flex-col items-center justify-start w-full pr-[3px] gap-[250px] py-[3px] bg-gray-200 shadow-sm">
        <div className="flex flex-col items-center justify-start w-full mt-[73px] max-w-[1171px]">
          <div className="flex flex-col items-start justify-start w-full gap-10">
            <Text
              size="14xl"
              as="p"
              className="w-[14%] ml-2.5 !text-blue_gray-900_02"
            >
              AgriChain♾️
            </Text>
            <div className="flex flex-col items-center justify-start w-full">
              <div className="h-[405px] w-[99%] relative">
                <div className="flex flex-row justify-start items-center w-[59%] gap-px bottom-0 right-0 left-0 m-auto absolute">
                  <Input
                    color="white_A700_01"
                    size="5xl"
                    name="search"
                    placeholder="Search"
                    value={searchBarValue}
                    onChange={(e) => setSearchBarValue(e)}
                    suffix={
                      searchBarValue?.length > 0 ? (
                        <CloseSVG
                          onClick={() => setSearchBarValue("")}
                          height={16}
                          width={16}
                        />
                      ) : (
                        <Img
                          src={Images.img_image_702}
                          alt="Image 702"
                          className="w-[16px] h-[16px] cursor-pointer"
                        />
                      )
                    }
                    className="w-[76%] gap-[35px] border-gray-500_03 border border-solid rounded-[24px]"
                  />
                  <Button
                    color="blue_gray_900_02"
                    size="19xl"
                    className="min-w-[165px] rounded-[24px]"
                  >
                    Search
                  </Button>
                </div>
                <Img
                  src={Images.img_image_705}
                  alt="image705_one"
                  className="h-[189px] w-[189px] left-0 top-0 m-auto rounded-[50%] absolute"
                />
                <Img
                  src={Images.img_image_a}
                  alt="image693_one"
                  className="h-[179px] w-[17%] bottom-[1%] right-0 m-auto object-cover absolute rounded-[12px]"
                />
                <Text
                  size="13xl"
                  as="p"
                  className="w-[85%] top-[31%] right-0 left-4 m-auto !text-blue_gray-900_02 absolute"
                >
                  "Transforming Agriculture with Technology 
                  <br />
                  for Transparency, Efficiency, and Security."
                </Text>
              </div>
              <div className="flex flex-row justify-between items-start w-[99%] mt-[271px]">
                <Text
                  size="9xl"
                  as="p"
                  className="mt-2.5 !text-blue_gray-900_02"
                >
                  Key Features
                </Text>
                <Img
                  src={Images.img_image_699}
                  alt="image699_one"
                  className="w-[4%] mb-1 object-cover rounded-[12px]"
                />
              </div>
              <div className="flex flex-row w-[99%] mt-[41px] gap-[66px]">
                <div className="flex flex-col items-center justify-start w-[27%] mt-[76px] mb-[90px] cursor-pointer hover:shadow-xs">
                  <div className="flex flex-col items-end justify-start w-full gap-[11px]">
                    <div className="flex flex-row justify-start items-center w-[70%] mr-2 gap-[7px]">
                      <div className="flex flex-row justify-between items-center w-[69%] p-[5px] border-gray-500_03 border border-solid bg-gray-200 shadow-xs rounded-[10px]">
                        <Text size="s" as="p" className="!text-gray-500_02">
                          Delivery address
                        </Text>
                        <Img
                          src={Images.img_image_704}
                          alt="delivery"
                          className="h-[9px] w-[9px] mr-1 rounded-[50%]"
                        />
                      </div>
                      <Button
                        color="blue_gray_900_02"
                        size="xs"
                        className="!text-gray-400_02 min-w-[59px]"
                      >
                        Seach
                      </Button>
                    </div>
                    <div className="flex flex-col items-start justify-start w-full">
                      <Img
                        src={Images.img_image_691}
                        alt="step_one"
                        className="w-[76%] ml-0.5 object-cover rounded-[12px]"
                      />
                      <Text
                        size="10xl"
                        as="p"
                        className="mt-6 !text-blue_gray-900_03"
                      >
                          Transparent Supply Chain
                      </Text>
                      <Text
                        size="3xl"
                        as="p"
                        className="mt-[25px] ml-0.5 !text-blue_gray-800_08"
                      >
                       Experience end-to-end visibility in the agricultural supply chain, from farm to table
                      </Text>
                    
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start justify-start w-[37%] gap-24 p-10 bg-gray-200 shadow-xs cursor-pointer rounded-[12px] hover:shadow-xs">
                  <Img
                    src={Images.img_image_694}
                    alt="image694_one"
                    className="h-[250px] w-[250px] ml-8 rounded-[50%]"
                  />
                  <div className="flex flex-col items-start justify-start mb-[47px] ml-[11px] gap-[25px]">
                    <Text size="8xl" as="p" className="!text-blue_gray-900_03">
                      Efficiency
                    </Text>
                    <Text
                      size="3xl"
                      as="p"
                      className="!text-blue_gray-800_08 !leading-6"
                    >
                     Streamline agricultural operations with real-time data and automated processes for optimal efficiency
                    </Text>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-start w-[31%] mt-6 mb-[87px] gap-[18px] cursor-pointer hover:shadow-xs">
                  <Img
                    src={Images.img_image_696}
                    alt="image696_one"
                    className="w-full object-cover rounded-[12px]"
                  />
                  <div className="flex flex-col items-start justify-start w-[82%]">
                    <Text
                      size="8xl"
                      as="p"
                      className="ml-px !text-blue_gray-900_03"
                    >
                      Trust and Accountability:
                    </Text>
                    <Text
                      size="3xl"
                      as="p"
                      className="mt-[30px] ml-px !text-blue_gray-800_08"
                    >
                      Building consumer trust through a secure, traceable, and verifiable network that connects processing companies, 
                      distributors, farmers, and drivers for efficient transfers.
                    </Text>

                  </div>
                </div>
              </div>
              <div className="flex flex-row justify-between items-center w-[99%] mt-[41px]">
                <Text size="9xl" as="p" className="!text-blue_gray-900_02">
                  Access Platform as:
                </Text>
                <Img
                  src={Images.img_image_703}
                  alt="image703_one"
                  className="w-[3%] object-cover rounded-[12px]"
                />
              </div>
              <div className="flex flex-row justify-between items-center w-[98%] mt-[61px]">
              
                <div className="flex flex-row items-start justify-between w-[27%] space-x-[80px]">

                  <Link
                    to="/farmers?canisterId=br5f7-7uaaa-aaaaa-qaaca-cai"
                    className="no-underline"
                  >
                    <Button
                      color="gray_200"
                      size="18xl"
                      className="mt-[31px] min-w-[214px] rounded-[24px] no-underline border-2 border-blue_gray-900_02"
                    >
                      Farmer
                    </Button>
                  </Link>
                 
                  <Link
                    to="/drivers?canisterId=br5f7-7uaaa-aaaaa-qaaca-cai"
                    className="no-underline"
                  >
                    <Button
                      color="gray_200"
                      size="18xl"
                      className="mt-[31px] min-w-[214px] rounded-[24px] no-underline border-2 border-blue_gray-900_02"
                    >
                      Driver
                    </Button>
                  </Link>
               
                  <Link
                    to="/distributors?canisterId=br5f7-7uaaa-aaaaa-qaaca-cai"
                    className="no-underline"
                  >
                    <Button
                      color="gray_200"
                      size="18xl"
                      className="mt-[31px] min-w-[214px] rounded-[24px] no-underline border-2 border-blue_gray-900_02"
                    >
                      Distributor Company
                    </Button>
                  </Link>
                 
                  <Link
                    to="/processors?canisterId=br5f7-7uaaa-aaaaa-qaaca-cai"
                    className="no-underline"
                  >
                    <Button
                      color="gray_200"
                      size="18xl"
                      className="mt-[31px] min-w-[214px] rounded-[24px] no-underline border-2 border-blue_gray-900_02"
                    >
                      Processing Company
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex flex-row justify-between items-start w-[99%] mt-[74px]">
                <Text size="9xl" as="p" className="mt-2 !text-blue_gray-900_02">
                  How it Works
                </Text>
                <Img
                  src={Images.img_image_697}
                  alt="image697_one"
                  className="w-[35px] mb-1.5 object-cover rounded-[12px]"
                />
              </div>
              <div className="h-[382px] w-full mt-[53px] relative">
                <div className="flex flex-row justify-center items-center w-full h-full left-0 bottom-0 right-0 top-0 m-auto absolute">
                  
                  <div className="flex flex-row justify-start items-start w-full space-x-[40px]">
                    <Text
                      size="3xl"
                      as="p"
                      className="w-[46%] mt-[116px] !text-blue_gray-800_08 z-[1] !leading-6"
                    >
                      Blockchain technology is the backbone of AgriChain, providing an immutable and 
                      transparent ledger for all transactions and movements within the agricultural supply chain
                    </Text>

                    <Text
                      size="3xl"
                      as="p"
                      className="w-[46%] mt-[116px] !text-blue_gray-800_08 z-[1] !leading-6"
                    >
                      Smart contracts are self-executing contracts with the terms of the agreement directly written into code.
                     They play a crucial role in automating and streamlining the supply chain processes on AgriChain 
                    </Text>

                  </div>
                </div>
                <div className="h-[23px] w-[23px] bottom-[21%] right-[46%] m-auto bg-gray-200 shadow-xs absolute rounded-[11px]" />
                <Text
                  size="6xl"
                  as="p"
                  className="left-0 top-[15%] m-auto !text-blue_gray-900_02 absolute"
                >
                  <strong>Blockchain Technology:</strong>
                    <br />
                    <br />
                   Ensuring Transparency and Traceability
                </Text>
                <Text
                  size="6xl"
                  as="p"
                  className="right-0 top-[15%] m-auto !text-blue_gray-900_02 absolute"
                >
                  <strong>Smart Contracts: </strong>
                    <br />
                    <br />
                    Automating and Streamlining  Supply Chain
                    <br />
                    Processes
                </Text>
                
              </div>


              {/*  */}
                    
              {/*  */}
            </div>
          </div>
        </div>
        <footer className="flex justify-center items-center w-full pl-[63px] pr-14 py-[7px] bg-gray-400_03 shadow-xs rounded-[12px]">
          <div className="flex flex-row justify-center w-full mb-12 mx-auto max-w-[1190px]">
            <div className="flex flex-row justify-center w-full">
              <div className="flex flex-row justify-between items-center w-full gap-[461px]">
                <Text
                  size="10xl"
                  as="p"
                  className="w-[13%] mt-110px !text-blue_gray-900_02"
                >
                  {/* AgriChain♾️ */}
                </Text>
                <div className="flex flex-row justify-start items-start w-[49%] gap-[82px]">
                  <div className="flex flex-col items-start justify-start w-[59%] gap-3">
                    
                    
                      
                    
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
