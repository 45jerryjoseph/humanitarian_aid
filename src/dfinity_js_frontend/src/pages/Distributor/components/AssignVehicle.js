import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button as BButton, Modal, Form } from "react-bootstrap";
import { Button, Loader } from "../../../components/utils";
import { getAllVehicles, getVehiclesByDistributorCompany } from "../../../utils/vehicle";


const AssignVehicle = ({ deliveryDetail, save }) => {

  // assignVehicle

  const [show, setShow] = useState(false);
  const [vehicles,setVehicles] = useState([])
  const [loading, setLoading] = useState(false);

  const { id,pickupDate,distributorsId } = deliveryDetail;

  const driverId = deliveryDetail.driverId[0];
  console.log("driverId", driverId);
  console.log("distributorId", distributorsId);

  
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setVehicles(await getVehiclesByDistributorCompany(distributorsId));
      console.log("Allvehicles", await getAllVehicles());
      console.log("disVehicle", await getVehiclesByDistributorCompany(distributorsId));
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }
  , [fetchVehicles]);

  console.log(vehicles, "vehicles");

  return (
    <>
    {loading ? (
      <Loader />
    ) : (
      <>
        <Button
          onClick={handleShow}
          color="blue_gray_900_02"
          size="11xl"
          className="min-w-[115px] items-center gap-2 flex rounded-[28px]"
        >
          Assign Vehicle
        </Button>
        <Modal
          size="lg"
          className="w-[50%]"
          show={show}
          onHide={handleClose}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Vehicles Available for Delivery {pickupDate}</Modal.Title>
          </Modal.Header>
          <Form>
            <Modal.Body>
              <table className="table">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col">vehicleMake</th>
                    <th scope="col">vehicleModel</th>
                    <th scope="col">vehicleType</th>
                    <th scope="col">vehicleRegNo</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle, index) => (
                    <TableRow
                      key={index}
                      vehicle={vehicle}
                      driverId={driverId}
                      save={save}
                      handleClose={handleClose}
                    />
                  ))}
                </tbody>
              </table>
            </Modal.Body>
          </Form>
          <Modal.Footer>
            <BButton variant="outline-secondary" onClick={handleClose}>
              Close
            </BButton>
          </Modal.Footer>
        </Modal>
      </>
    )}
  </>
  )
}

function TableRow({ vehicle, driverId, save, handleClose }) {
  return (
    <tr>
      <td>{vehicle.vehicleMake}</td>
      <td>{vehicle.vehicleModel}</td>
      <td>{vehicle.vehicleType}</td>
      <td>{vehicle.vehicleRegNo}</td>
      <td>
        <BButton
          variant="dark"
          onClick={() => {
            save(driverId, vehicle.id);
            handleClose();
          }}
        >
          Assign Vehicle 
        </BButton>
      </td>
    </tr>
  );
}

export default AssignVehicle