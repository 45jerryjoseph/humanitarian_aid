import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button as BButton, Modal, Form, FloatingLabel } from "react-bootstrap";
import { Button, Loader } from "../../../components/utils";
import { payFarmer } from "../../../utils/processorCompany";
import { toast } from "react-toastify";
import { NotificationError, NotificationSuccess } from "../../../components/utils";
import { markFarmerSalesAdvertAsFarmerPaid } from "../../../utils/advert";


const PayFarmer = ({ saleAdvert,fetchPaidAdverts }) => {
    const [loading, setLoading] = useState(false);

    const farmerSalesAdvertId = saleAdvert.id;

    console.log("first", farmerSalesAdvertId)
    console.log("second", saleAdvert)

  const payFarmerFunc = async () => {
    try {
      setLoading(true);
      await payFarmer({ farmerSalesAdvertId }).then((resp) => {
        console.log("resp1", resp);
        markFarmerSalesAdvertAsFarmerPaid(farmerSalesAdvertId);
        fetchPaidAdverts();
        toast(<NotificationSuccess text="Farmer paid successfully." />);
      });
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast(<NotificationError text="Failed to pay Farmer." />);
    }
  };
  return (
    <>
        {loading ? (
            <Loader />
        ) : (
            <Button
            onClick={()=>{
                payFarmerFunc();
            }}
            color="blue_gray_900_02"
            size="8xl"
            className="min-w-[115px] items-center gap-2 flex rounded-[28px]"
            >
            Pay Farmer
            </Button>
        )}
      
    </>
  );
};

export default PayFarmer;
