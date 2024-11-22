import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button as BButton, Modal, Form, FloatingLabel } from "react-bootstrap";
import { Button, Loader } from "../../../components/utils";

function ProductGrading({ product, save }) {

  // productId, grade, quantity, price

  const [grade, setGrade] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

  const [loading, setLoading] = useState(false);
  
  const { id} = product;

  const productId = id;
  
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  console.log("detailsP", id, grade, quantity, price);

 

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Button
            color="blue_gray_900_02"
            className="min-w-[115px] rounded-[28px]"
            size="8xl"
            onClick={handleShow}
          >
            Grade & Sort 
          </Button>

          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Grade Product</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form className="max-w-lg mx-auto p-2 bg-white shadow-md rounded-lg">
                <FloatingLabel controlId="floatingInput" label="Grade" className="my-2">
                  <Form.Control
                    type="text"
                    placeholder="Grade"
                    onChange={(e) => setGrade(e.target.value)}
                  />
                </FloatingLabel>
                <FloatingLabel controlId="floatingInput" label="Quantity (Kg)" className="my-2">
                  <Form.Control
                    type="number"
                    placeholder="Quantity"
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </FloatingLabel>
                <FloatingLabel controlId="floatingInput" label="Price per Kg" className="my-2">
                  <Form.Control
                    type="number"
                    placeholder="Price per Kg"
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </FloatingLabel>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={handleClose}
                className="rounded-[28px]"
              >
                Close
              </Button>
              <Button
                 color="blue_gray_900_02"
                 className="min-w-[115px] rounded-[28px]"
                onClick={() => {
                  save({productId, grade, quantity, price});
                  handleClose();
                }}
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

ProductGrading.propTypes = {
  product: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
};



export default ProductGrading;
