import React, { useState } from "react";
import { Button as BButton, Modal, Form, FloatingLabel } from "react-bootstrap";
import { Button } from "../../../components/utils";


const AddVehicle = ({save}) => {
    const [vehicleMake, setVehicleMake] = useState("");
    const [vehicleModel, setVehicleModel] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [vehicleRegNo, setVehicleRegNo] = useState("");

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return (
        <>
            <Button
               color="blue_gray_900_02"
               className="min-w-[115px] rounded-[28px]"
                size="12xl"
                onClick={handleShow}
            >
                Add Vehicle
            </Button>
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>New Vehicle</Modal.Title>
                </Modal.Header>
                <Form >
                    <Modal.Body>
                        <FloatingLabel
                            controlId="inputName"
                            label="Vehicle Make"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                onChange={(e) => {
                                    setVehicleMake(e.target.value);
                                }}
                                placeholder="Enter vehicle make"
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputModel"
                            label="Vehicle Model"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                placeholder="Vehicle Model"
                                onChange={(e) => {
                                    setVehicleModel(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputType"
                            label="Vehicle Type"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                placeholder="Vehicle Type"
                                onChange={(e) => {
                                    setVehicleType(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                        <FloatingLabel
                            controlId="inputRegNo"
                            label="Vehicle Registration Number"
                            className="mb-3"
                        >
                            <Form.Control
                                type="text"
                                placeholder="Vehicle Registration Number"
                                onChange={(e) => {
                                    setVehicleRegNo(e.target.value);
                                }}
                            />
                        </FloatingLabel>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button
                            color="blue_gray_900_02"
                            className="min-w-[115px] rounded-[28px]"
                            onClick={() => {
                                save({
                                    vehicleMake,
                                    vehicleModel,
                                    vehicleType,
                                    vehicleRegNo,
                                });
                                handleClose();
                            }}
                        >
                            Create
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    )
}

export default AddVehicle