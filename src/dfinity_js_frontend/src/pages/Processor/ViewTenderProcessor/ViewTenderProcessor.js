import React, { useCallback, useEffect, useState } from "react";
import { Button as BButton, Modal, } from "react-bootstrap";
import { Button } from "../../../components/utils";
import { getTenderForDeliveryDetailsForProcessingCompany } from "../../../utils/tender";
import { toast } from "react-toastify";
import { NotificationError, NotificationSuccess } from "../../../components/utils/Notifications";
import { payDistributors } from "../../../utils/processorCompany";
import { Loader } from "../../../components/utils";


const ViewTenderProcessor = ({deliveryDetailId, companyId}) => {

    const [tender, setTender] = useState({});

    const [show, setShow] = useState(false);

    const [loading, setLoading] = useState(false);


    const deliveryTenderId = tender.id;

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const fetchTender =  async () => {
        try {
            await getTenderForDeliveryDetailsForProcessingCompany(companyId,deliveryDetailId).then(async (res) => {
                console.log("resU", res);
                setTender(res.Ok);
            });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
    fetchTender();
    } ,[])

      // pay driver
  const payDistributorsFunc = async () => {

    try {
      setLoading(true);
      await payDistributors({ deliveryTenderId }).then((resp) => {
        console.log("resp", resp);
        toast(<NotificationSuccess text="Distributors paid successfully." />);
      });
      toast(<NotificationSuccess text="Distributors paid successfully." />);
    } catch (error) {
      console.log(error);
      toast(<NotificationError text="Failed to pay Distributors." />);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {
        loading ? (
          <Loader />
        ) : (
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
                      <p><strong>Delivery Weight: </strong>{tender.deliveryWeight && tender?.deliveryWeight.toString()}</p>
                      <p><strong>Cost Per Weight: </strong>{tender.costPerWeight && (tender?.costPerWeight/BigInt(10**8)).toString()}  ICP</p>
                      <p><strong>Additional Cost: </strong>{tender.additionalCost && (tender?.additionalCost/BigInt(10**8)).toString()} ICP</p>
                      <p><strong>Total Cost: </strong>{tender.totalCost && (tender?.totalCost/BigInt(10**8)).toString()} ICP</p>
                      <Button
                          onClick={payDistributorsFunc}
                          color="blue_gray_900_02"
                          size="11xl"
                          className="min-w-[115px] items-center gap-2 flex rounded-[28px]"
                      >
                          Pay Distributors
                      </Button>
                  </Modal.Body>
              </Modal>
          </>
        )
      }
    </>
  )
}

export default ViewTenderProcessor