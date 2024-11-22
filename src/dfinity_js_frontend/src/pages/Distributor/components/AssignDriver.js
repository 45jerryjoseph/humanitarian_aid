import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Button as BButton, Modal, Form } from "react-bootstrap";
import { Button, Loader } from "../../../components/utils";
import { getAllDrivers } from "../../../utils/driver";

function AssignDrivers({ deliveryDetail, save }) {
  const [show, setShow] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { id, pickupDate } = deliveryDetail;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setDrivers(await getAllDrivers(id));
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  console.log(drivers, "drivers");

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
            className="min-w-[115px] items-center gap-2 flex rounded-[28px] mr-3"
          >
            Assign Driver
          </Button>
          <Modal
            size="lg"
            className="w-[50%]"
            show={show}
            onHide={handleClose}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Drivers Available for Delivery {pickupDate}</Modal.Title>
            </Modal.Header>
            <Form>
              <Modal.Body>
                <table className="table">
                  <thead className="thead-dark">
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Contact</th>
                      <th scope="col">Experience</th>
                      <th scope="col">Licence No</th>
                      <th scope="col">driverRating</th>
                      <th scope="col">Vehicle Model</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver, index) => (
                      <TableRow
                        key={index}
                        driver={driver}
                        id={id}
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
  );
}

AssignDrivers.propTypes = {
  deliveryDetail: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
};

function TableRow({ driver, id, save, handleClose }) {
  return (
    <tr>
      <td>{driver.fullName}</td>
      <td>{driver.contact}</td>
      <td>{driver.experience}</td>
      <td>{driver.licenseNo}</td>
      <td>{driver.driverRating.toString()}</td>
      <td>
        {driver.assignedVehicle && driver.assignedVehicle.length > 0 
          ? driver.assignedVehicle[0].vehicleMake 
          : 'No Vehicle Assigned'}
      </td>
      <td>
        <BButton
          variant="dark"
          onClick={() => {
            save(id, driver.id);
            handleClose();
          }}
        >
          Select Driver
        </BButton>
      </td>
    </tr>
  );
}

export default AssignDrivers;
