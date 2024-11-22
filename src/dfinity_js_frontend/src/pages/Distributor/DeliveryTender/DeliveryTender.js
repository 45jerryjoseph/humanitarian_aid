import React, {  useState } from "react";
import { Button as BButton, Modal, Form, FloatingLabel } from "react-bootstrap";
import { Button, Loader, NotificationError, NotificationSuccess } from "../../../components/utils";
import { toast } from "react-toastify";
import { createDeliveryTender } from '../../../utils/tender';

const DeliveryTender = ({deliveryDetail}) => {

    const {id, processorsId, distributorsId} = deliveryDetail;
    const [tenderTitle, setTenderTitle] = useState("");
    const [tenderDescription, setTenderDescription] = useState("");
    const [deliveryWeight, setDeliveryWeight] = useState(0);
    const [costPerWeight, setCostPerWeight] = useState(0);
    const [additionalCost, setAdditionalCost] = useState(0);

    const [loading, setLoading] = useState(false);

    const tenderPayload = {
        tenderTitle,
        DeliveryDetailsId: id,
        tenderDescription,
        processorsId,
        distributorsId,
        deliveryWeight,
        costPerWeight,
        additionalCost
    };

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    const handleSubmit = async () => {
        try {
            setLoading(true);
            let deliveryWeightStr = tenderPayload.deliveryWeight;
            let costPerWeightStr = tenderPayload.costPerWeight;
            let additionalCostStr = tenderPayload.additionalCost;

            tenderPayload.deliveryWeight = parseInt(deliveryWeightStr);
            tenderPayload.costPerWeight = parseInt(costPerWeightStr, 10)* 10**8;
            tenderPayload.additionalCost = parseInt(additionalCostStr, 10) * 10**8;
            await createDeliveryTender(tenderPayload).then((resp) => {
                console.log("resp1", resp);
                toast(<NotificationSuccess text="Tender added successfully." />);
            });
            setLoading(false);
        }
        catch (error) {
            console.log(error);
            setLoading(false);
            toast(<NotificationError text="Failed to add tender." />);
        }
    }




  return (
    <>
        {loading ? (
            <Loader />
        ) : (
            <>
            <Button
                color="blue_gray_900_02"
                size="12xl"
                className="min-w-[115px] rounded-[28px]"
                onClick={handleShow}
            >
                Add Tender
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                <Modal.Title>Add Tender</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form className="max-w-lg mx-auto p-2 bg-white shadow-md rounded-lg">
                    <FloatingLabel controlId="floatingInput" label="Tender Title" className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Tender Title"
                        onChange={(e) => setTenderTitle(e.target.value)}
                    />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingInput" label="Tender Description"className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Tender Description"
                        onChange={(e) => setTenderDescription(e.target.value)}
                    />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingInput" label="Delivery Weight"className="mb-3">
                    <Form.Control
                        type="number"
                        placeholder="Delivery Weight"
                        onChange={(e) => setDeliveryWeight(e.target.value)}
                    />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingInput" label="Cost Per Weight"className="mb-3">
                    <Form.Control
                        type="number"
                        placeholder="Cost Per Weight"
                        onChange={(e) => setCostPerWeight(e.target.value)}
                    />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingInput" label="Additional Cost"className="mb-3">
                    <Form.Control
                        type="number"
                        placeholder="Additional Cost"
                        onChange={(e) => setAdditionalCost(e.target.value)}
                    />
                    </FloatingLabel>
                </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button
                color="blue_gray_900_02"
                className="min-w-[115px] rounded-[28px]"
                onClick={
                    () => {
                        handleSubmit();
                        handleClose();
                    }
                }>
                    Save Changes
                </Button>
                </Modal.Footer> 
            </Modal>
            </>
        )}
    </>
  )
}

export default DeliveryTender