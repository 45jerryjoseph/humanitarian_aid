import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button as BButton, Modal, Form, FloatingLabel } from "react-bootstrap";
import { Button } from "../../components/utils";

const AddProduct = ({ save }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");


  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button
      color="blue_gray_900_02"
      className="min-w-[115px] rounded-[28px]"
        size="12xl"
      onClick={handleShow}>
        Add Product
      </Button>

      <Modal show={show} onHide={handleClose} >
        <Modal.Header closeButton>
          <Modal.Title>Add Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="max-w-lg mx-auto p-2 bg-white shadow-md rounded-lg">
            <FloatingLabel controlId="floatingInput" label="Product Name" className="my-2">
              <Form.Control
                type="text"
                placeholder="Product Name"
                onChange={(e) => setName(e.target.value)}
              />
            </FloatingLabel>
            <FloatingLabel controlId="floatingInput" label="Product Description" className="my-2">
              <Form.Control
                type="text"
                placeholder="Description"
                onChange={(e) => setDescription(e.target.value)}
              />
            </FloatingLabel>
            <FloatingLabel controlId="floatingInput" label="Product Category" className="my-2">
              <Form.Control
                type="text"
                placeholder="Category"
                onChange={(e) => setCategory(e.target.value)}
              />
            </FloatingLabel>
            <FloatingLabel controlId="floatingInput" label="Image Url" className="my-2">
              <Form.Control
                type="text"
                placeholder="Image URL"
                onChange={(e) => setImage(e.target.value)}
              />
            </FloatingLabel>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="blue_gray_900_02"
            onClick={() => {
              save({ name, description, category, image });
              handleClose();
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddProduct;
