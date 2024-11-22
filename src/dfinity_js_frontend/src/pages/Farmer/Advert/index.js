import React, { useCallback, useEffect, useState } from "react";
import { Button as BButton, Modal, Form, FloatingLabel } from "react-bootstrap";
import { Button, Loader, NotificationError, NotificationSuccess } from "../../../components/utils";
import { toast } from "react-toastify";
import { getAllProcessingCompanies } from "../../../utils/processorCompany";
import { createFarmerSalesAdvert } from "../../../utils/advert";

function SaleAdvert({ product, farmerId }) {

    const [processingCompanies, setProcessingCompanies] = useState([]);
    const [processorCompanyId, setProcessorCompanyId] = useState("");
    const [dis, setDis] = useState(true);

      
    const { id} = product;
  
    const productId = id;
  
    const [loading, setLoading] = useState(false);

    const advertPayload = {
        farmerId,
        processorCompanyId,
        productId,
        quantity:product.quantity,
        price:product.price
    };
    console.log("processingCompanyId", processorCompanyId);
    console.log("calculate",(product.price * product.quantity))
    const fetchProcessingCompanies = useCallback(async () => {
        try {
          setLoading(true);
          setProcessingCompanies(await getAllProcessingCompanies());
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
        try{
            setLoading(true);
            await createFarmerSalesAdvert(advertPayload);
            toast( <NotificationSuccess text="Outreach sent successfully" />);
            setLoading(false);
        } catch (error) {
            console.log(error);
            toast( <NotificationError text="Failed to send Outreach" />);
            setLoading(false);
        }
    }
        
    useEffect(() => {
        fetchProcessingCompanies();
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
              Outreach 
            </Button>
  
            <Modal size="lg"
            className="w-[50%]" centered show={show} onHide={handleClose}>
            <Modal.Header closeButton>            
                <Modal.Title>Send Outreach</Modal.Title>    
            </Modal.Header>
            <Modal.Body>

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
                    {processingCompanies.map((company, index) => (
                      <TableRow
                        key={index}
                        company={company}
                        setProcessorCompanyId={setProcessorCompanyId}
                        setDis={setDis}
                        dis={dis}
                      />
                    ))}
                  </tbody>
                </table>
            </Modal.Body>
            <Modal.Footer>
                <Button
                variant="secondary"
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
                Send
                </Button>
            </Modal.Footer>
        
           
            </Modal>
           
          </>
        )}
      </>
    );
  }

  function TableRow({ company, setProcessorCompanyId, setDis, dis}) {
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
              setProcessorCompanyId(company.id);
              setDis(false);
            }}
            disabled={!dis}
          >
            Select Company
          </BButton>
        </td>
      </tr>
    );
  }

  
  export default SaleAdvert;