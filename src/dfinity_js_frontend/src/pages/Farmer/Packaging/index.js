import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button as BButton, Modal, Form, FloatingLabel } from "react-bootstrap";
import { Button, Loader, NotificationError, NotificationSuccess } from "../../../components/utils";
import { addPackagedDetails } from "../../../utils/item";
import { toast } from "react-toastify";

function ProductPackaging({ product }) {

    const [packagingMaterial, setPackagingMaterial] = useState("");
    const [packagingType, setPackagingType] = useState("");
    const [packagingSize, setPackagingSize] = useState("");
    const [packagingColor, setPackagingColor] = useState("");
    const [packagingDate, setPackagingDate] = useState("");
  
    const [loading, setLoading] = useState(false);

    const packagingPayload = {
        packagingMaterial,
        packagingType,
        packagingSize,
        packagingColor,
        packagingDate
    };
    
    const { id} = product;
  
    const productId = id;
    
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
  

    const handleSubmit = async () => {
        try{
            setLoading(true);
            await addPackagedDetails(productId, packagingPayload);
            toast( <NotificationSuccess text="Packaging details added successfully" />);
            setLoading(false);
        } catch (error) {
            console.log(error);
            toast( <NotificationError text="Failed to add packaging details" />);
            setLoading(false);
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
              className="min-w-[115px] rounded-[28px]"
              size="12xl"
              onClick={handleShow}
            >
              Package 
            </Button>
  
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Package Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className="max-w-lg mx-auto p-2 bg-white shadow-md rounded-lg">
                    <FloatingLabel controlId="floatingInput" label="Packaging Material" className="my-2">
                        <Form.Control
                        type="text"
                        placeholder="Packaging Material"
                        onChange={(e) => setPackagingMaterial(e.target.value)}
                        />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingInput" label="Packaging Type" className="my-2">
                        <Form.Control
                        type="text"
                        placeholder="Packaging Type"
                        onChange={(e) => setPackagingType(e.target.value)}
                        />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingInput" label="Packaging Size" className="my-2">
                        <Form.Control
                        type="text"
                        placeholder="Packaging Size"
                        onChange={(e) => setPackagingSize(e.target.value)}
                        />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingInput" label="Packaging Color" className="my-2">
                        <Form.Control
                        type="text"
                        placeholder="Packaging Color"
                        onChange={(e) => setPackagingColor(e.target.value)}
                        />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingInput" label="Packaging Date" className="my-2">
                        <Form.Control
                        type="date"
                        placeholder="Packaging Date"
                        onChange={(e) => setPackagingDate(e.target.value)}
                        />
                    </FloatingLabel>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                     color="blue_gray_900_02"
                    className="min-w-[115px] rounded-[28px]"
                    onClick={() => {
                        handleSubmit();
                        handleClose();
                    } }
                    >
                    Save
                    </Button>
                </Modal.Footer>
            </Modal>
           
          </>
        )}
      </>
    );
  }

  
  export default ProductPackaging;