import React, { useCallback, useEffect, useState } from "react";
import { Button as BButton, Modal, } from "react-bootstrap";
import { Button } from "../../../components/utils";
import { getAllDeliveryTenders, getTenderForDeliveryDetailsForDistributorCompany } from "../../../utils/tender";
import PayDriver from "./PayDriver";
import { payDriver } from "../../../utils/distributorsCompany";
import { toast } from "react-toastify";
import { NotificationError, NotificationSuccess } from "../../../components/utils/Notifications";


const ViewTender = ({deliveryDetailId, companyId}) => {

    const [tender, setTender] = useState({});

    const [loading, setLoading] = useState(false);

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    console.log("deliveryDetailId", deliveryDetailId)
    console.log("companyId", companyId )

    // const fetchTender =  async () => {
    //     try {
    //         await getTenderForDeliveryDetailsForDistributorCompany(companyId,deliveryDetailId).then(async (res) => {
    //             console.log("resUn", res);
    //             setTender(res.Ok);
    //         });
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };
    

    

    const fetchTender = async () => {
        try {
          let allTenders = await getAllDeliveryTenders();
          // console.log("allTenders", allTenders);
          for(let i = 0; i < allTenders.length; i++){
            if(allTenders[i].accepted && allTenders[i].distributorsId === companyId && allTenders[i].DeliveryDetailsId === deliveryDetailId){
              // console.log("found",allTenders[i])
              setTender(allTenders[i]);
            }
          }
        }
        catch (error) {
          console.log(error);
          return Err("No tender found");
        }
    }


        fetchTender();

      // pay driver
  const payDriverFunc = async (data) => {
    const {deliveryTenderId} = data
    let amntStr = data.amount;
    data.amount = parseInt(amntStr, 10) * 10 ** 8;
    // console.log("data", data);
    // console.log("amount", data.amount);
    // console.log("deliveryTenderId", deliveryTenderId)

    try {
      setLoading(true);
      await payDriver({ deliveryTenderId }, data.amount).then((resp) => {
        console.log("resp", resp);
        toast(<NotificationSuccess text="Driver paid successfully." />);
      });
      toast(<NotificationSuccess text="Driver paid successfully." />);
    } catch (error) {
      console.log(error);
      toast(<NotificationError text="Failed to pay driver." />);
    } finally {
      setLoading(false);
    }
  };

  console.log("Tender", tender )
  return (
    <>

        <Button
            onClick={handleShow}
            color="blue_gray_900_02"
            size="11xl"
            className="min-w-[115px] items-center gap-2 flex rounded-[28px]"
        >
            View Tender
        </Button>
        <Modal
            size="lg"
            className="w-[50%]"
            show={show}
            onHide={handleClose}
            centered
        >
            <Modal.Header closeButton>
            <Modal.Title>Tender Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Arrange the values within the modal without table */}
                <p><strong>Tender Title: </strong>{tender?.tenderTitle}</p>
                <p><strong>Tender Description: </strong>{tender?.tenderDescription}</p>
                <p><strong>Delivery Weight: </strong>{tender.deliveryWeight && tender?.deliveryWeight.toString()} Kg</p>
                <p><strong>Cost Per Weight: </strong>{tender.costPerWeight && (tender?.costPerWeight/BigInt(10**8)).toString()}  ICP</p>
                <p><strong>Additional Cost: </strong>{tender.additionalCost && (tender?.additionalCost/BigInt(10**8)).toString()} ICP</p>
                <p><strong>Total Cost: </strong>{tender.totalCost && (tender?.totalCost/BigInt(10**8)).toString()} ICP</p>
                <PayDriver deliveryTender={tender} save={payDriverFunc} />




            
            </Modal.Body>
        </Modal>
    </>
  )
}

export default ViewTender