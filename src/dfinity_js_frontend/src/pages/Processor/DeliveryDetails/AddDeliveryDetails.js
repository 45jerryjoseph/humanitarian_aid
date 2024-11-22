import React, { useCallback, useEffect, useState } from "react";
import { Button as BButton, Modal, Form, FloatingLabel } from "react-bootstrap";
import { Button, Loader, NotificationError, NotificationSuccess } from "../../../components/utils";
import { toast } from "react-toastify";
import { getAllDistributorsCompanies } from "../../../utils/distributorsCompany";
import { createDeliveryDetails } from "../../../utils/deliveries";

const AddDeliveryDetails = ({ saleAdvert}) => {

     const [distributorCompanies, setDistributorCompanies] = useState([]);
    const [distributionCompanyId, setDistributorCompanyId] = useState("");
    const [dis, setDis] = useState(true);

    const [loading, setLoading] = useState(false);
    const [pickupDate, setPickupDate] = useState("");
    const [pickupRegion, setPickupRegion] = useState("");
    const [deliveredRegion, setDeliveredRegion] = useState("");
    const [deliveryPriority, setDeliveryPriority] = useState("");
    const [deliveryDescription, setDeliveryDescription] = useState("");

    const { farmerId, processorCompanyId, productId } = saleAdvert;


    const deliveryPayload = {
        processorsId: processorCompanyId,
        farmerId,
        productId,
        distributorsId: distributionCompanyId,
        pickupDate,
        pickupRegion,
        deliveredRegion,
        deliveryPriority,
        deliveryDescription,
    };

    const fetchDistributorsCompanies = useCallback(async () => {
        try {
          setLoading(true);
          setDistributorCompanies(await getAllDistributorsCompanies());
          setLoading(false);
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      });
        


    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSubmit = async () => {
        try {
          setLoading(true);
          await createDeliveryDetails(deliveryPayload).then((resp) => {
            console.log("resp1", resp);
            toast(<NotificationSuccess text="Delivery details added successfully." />);
          });
          setLoading(false);
        } catch (error) {
          console.log(error);
          setLoading(false);
          toast(<NotificationError text="Failed to add delivery details." />);
        }
      };

    useEffect(() => {
        fetchDistributorsCompanies();
    }, []);

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
              Create Delivery Details 
            </Button>
  
            <Modal size="lg"
            className="w-[50%]" centered show={show} onHide={handleClose}>
            <Modal.Header closeButton>            
                <Modal.Title>Create Delivery Details</Modal.Title>    
            </Modal.Header>
            <Modal.Body>
                <Form className="max-w-lg mx-auto mb-2 p-2 bg-white shadow-md rounded-lg">
                    <FloatingLabel controlId="floatingInput" label="Pickup Date"className="my-2">
                        <Form.Control
                            type="date"
                            placeholder="Pickup Date"
                            onChange={(e) => setPickupDate(e.target.value)}
                        />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingInput" label="Pickup Region"className="my-2">
                        <Form.Control
                            type="text"
                            placeholder="Pickup Region"
                            onChange={(e) => setPickupRegion(e.target.value)}
                        />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingInput" label="Delivered Region"className="my-2">
                        <Form.Control
                            type="text"
                            placeholder="Delivered Region"
                            onChange={(e) => setDeliveredRegion(e.target.value)}
                        />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingInput" label="Delivery Priority"className="my-2">
                        <Form.Control
                            type="text"
                            placeholder="Delivery Priority"
                            onChange={(e) => setDeliveryPriority(e.target.value)}
                        />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingInput" label="Delivery Description"className="my-2">
                        <Form.Control
                            type="text"
                            placeholder="Delivery Description"
                            onChange={(e) => setDeliveryDescription(e.target.value)}
                        />
                    </FloatingLabel>
                </Form>
                <table className="table">
                  <thead className="thead-dark">
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Years in Operation</th>
                      <th scope="col">bussinessType</th>
                      <th scope="col">Reg No</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributorCompanies.map((company, index) => (
                      <TableRow
                        key={index}
                        company={company}
                        setDistributorCompanyId={setDistributorCompanyId}
                        setDis={setDis}
                        dis={dis}
                      />
                    ))}
                  </tbody>
                </table>
            </Modal.Body>
            <Modal.Footer>
                <Button
                
                onClick={handleClose}
                >
                Close
                </Button>
                <Button
                color="blue_gray_900_02"
                className="min-w-[115px] rounded-[28px]"
                onClick={() => {
                    handleSubmit();
                    handleClose();
                } }
                >
                Create
                </Button>
            </Modal.Footer>
        
           
            </Modal>
           
          </>
        )}
      </>
    )
}

function TableRow({ company, setDistributorCompanyId, setDis, dis}) {
    return (
      <tr>
        <td>{company.name}</td>
        <td>{company.YearsInOperation}</td>
        <td>{company.bussinessType}</td>
        <td>{company.regNo}</td>
        <td>
          <BButton
            variant="dark"
            onClick={() => {
              setDistributorCompanyId(company.id);
              setDis(false);
            }}
            disabled={!dis}
          >
            Select Company
          </BButton>
        </td>
      </tr>
    )
}

export default AddDeliveryDetails