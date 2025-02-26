import "./home.css";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { addTransaction, getTransactions } from "../../utils/ApiRequest";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import Analytics from "./Analytics";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BarChartIcon from "@mui/icons-material/BarChart";
const Home = () => {
  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };
  const [cUser, setcUser] = useState();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [view, setView] = useState("table");

  const handleStartChange = (date) => {
    setStartDate(date);
  };

  const handleEndChange = (date) => {
    setEndDate(date);
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const avatarFunc = async () => {
      if (localStorage.getItem("user")) {
        const user = JSON.parse(localStorage.getItem("user"));
        console.log(user);

        if (user.isAvatarImageSet === false || user.avatarImage === "") {
          navigate("/setAvatar");
        }
        setcUser(user);
        setRefresh(true);
      } else {
        navigate("/login");
      }
    };

    avatarFunc();
  }, [navigate]);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleChangeFrequency = (e) => {
    setFrequency(e.target.value);
  };

  const handleSetType = (e) => {
    setType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { title, amount, description, category, date, transactionType } = values;
  
    if (!title || !amount || !description || !category || !date || !transactionType) {
      toast.error("Please enter all the fields", toastOptions);
      return;
    }
  
    if (!cUser || !cUser.email) {
      toast.error("User not found. Please log in again.", toastOptions);
      return;
    }
  
    setLoading(true);
  
    const newTransaction = {
      id: Date.now(), // Unique ID for the transaction
      
      title,
      amount,
      description,
      category,
      date,
      transactionType,
      userId: cUser._id,
    };
  
    // Retrieve existing transactions from localStorage
    const storedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
  
    // Add the new transaction to the array
    const updatedTransactions = [...storedTransactions, newTransaction];
  
    // Save the updated array back to localStorage
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
  
    // Update state to trigger UI refresh
    setTransactions(updatedTransactions);
    setRefresh(!refresh);
    setLoading(false);
    toast.success("Transaction added successfully!", toastOptions);
    handleClose();
  };
  

  const handleReset = () => {
    setType("all");
    setStartDate(null);
    setEndDate(null);
    setFrequency("7");
    setRefresh(!refresh); // Trigger re-fetch
  };
  
  useEffect(() => {
    const fetchAllTransactions = async () => {
      setLoading(true);
    
      try {
        
        const storedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
        console.log("All Transactions from localStorage:", storedTransactions);
    
        let filteredTransactions = storedTransactions.filter(txn => txn.userId === cUser._id);
        console.log("Transactions after filtering by userId:", filteredTransactions);
    
        // Apply Type Filter
        if (type !== "all") {
          filteredTransactions = filteredTransactions.filter(txn => txn.transactionType === type);
          console.log(`Transactions after filtering by type (${type}):`, filteredTransactions);
        }
    
        // Apply Date Filters
        const today = new Date();
        if (frequency !== "custom") {
          let startDate = new Date(); // Today
          startDate.setDate(startDate.getDate() - parseInt(frequency));
          startDate.setHours(0, 0, 0, 0); // Normalize start time
        
          let endDate = new Date(); // Today, end of the day
          endDate.setHours(23, 59, 59, 999);
        
          console.log(`Filtering transactions from ${startDate.toISOString()} to ${endDate.toISOString()}`);
          transactions.forEach(txn => {
            console.log(`🔍 Checking Transaction: ${new Date(txn.date + "T00:00:00").toISOString()} Original: ${txn.date}`);
          });
          
        
          const filteredTransactions = transactions.filter(txn => {
            const txnDate = new Date(txn.date + "T00:00:00"); // Ensure it's treated as local time
            return txnDate >= startDate && txnDate <= endDate;
          });
          
        
        
          console.log("Transactions after filtering by frequency:", filteredTransactions);
        
        
        
        
        
        } else if (startDate && endDate) {
          let start = new Date(startDate);
          let end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // Ensure transactions on the end date are included
          
          console.log(`Filtering transactions between ${start.toISOString()} and ${end.toISOString()}`);
        
          filteredTransactions = filteredTransactions.filter(txn => {
            const txnDate = new Date(txn.date);
            return txnDate >= start && txnDate <= end;
          });
          console.log("Transactions after filtering by custom date range:", filteredTransactions);
        }
        
    
        setTransactions(filteredTransactions);
        console.log("Final transactions set in state:", filteredTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    
      setLoading(false);
    };
  
    fetchAllTransactions();
  }, [refresh, frequency, type, startDate, endDate]);
  
  
  

  const handleTableClick = (e) => {
    setView("table");
  };

  const handleChartClick = (e) => {
    setView("chart");
  };

  return (
    <>
      <Header />

      {loading ? (
        <>
          <Spinner />
        </>
      ) : (
        <>
          <Container 
            style={{ position: "relative", zIndex: "2 !important", backgroundColor:'#2D336B'  }}
            className="mt-3 full-screen-container"
          >
            <div className="filterRow">
              <div className="text-white">
                <Form.Group className="mb-3" controlId="formSelectFrequency">
                  <Form.Label>Select Frequency</Form.Label>
                  <Form.Select
                    name="frequency"
                    value={frequency}
                    onChange={handleChangeFrequency}
                  >
                    <option value="7">Last Week</option>
                    <option value="30">Last Month</option>
                    <option value="365">Last Year</option>
                    <option value="custom">Custom</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="text-white type">
                <Form.Group className="mb-3" controlId="formSelectFrequency">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={type}
                    onChange={handleSetType}
                  >
                    <option value="all">All</option>
                    <option value="expense">Expense</option>
                    <option value="credit">Income</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="text-white iconBtnBox">
                <FormatListBulletedIcon
                  sx={{ cursor: "pointer" }}
                  onClick={handleTableClick}
                  className={`${
                    view === "table" ? "iconActive" : "iconDeactive"
                  }`}
                />
                <BarChartIcon
                  sx={{ cursor: "pointer" }}
                  onClick={handleChartClick}
                  className={`${
                    view === "chart" ? "iconActive" : "iconDeactive"
                  }`}
                />
              </div>
              {/* Display selected filter options */}


              <div>
                <Button onClick={handleShow} className="addNew">
                  Add New
                </Button>
                <Button onClick={handleShow} className="mobileBtn">
                  +
                </Button>
                <Modal show={show} onHide={handleClose} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Add Transaction Details</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="formName">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          name="title"
                          type="text"
                          placeholder="Enter Transaction Name"
                          value={values.name}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formAmount">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control
                          name="amount"
                          type="number"
                          placeholder="Enter your Amount"
                          value={values.amount}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formSelect">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          name="category"
                          value={values.category}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="Groceries">Groceries</option>
                          <option value="Rent">Rent</option>
                          <option value="Salary">Salary</option>
                          <option value="Tip">Tip</option>
                          <option value="Food">Food</option>
                          <option value="Medical">Medical</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Transportation">Transportation</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          type="text"
                          name="description"
                          placeholder="Enter Description"
                          value={values.description}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formSelect1">
                        <Form.Label>Transaction Type</Form.Label>
                        <Form.Select
                          name="transactionType"
                          value={values.transactionType}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="credit">Credit</option>
                          <option value="expense">Expense</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formDate">
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={values.date}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      {/* Add more form inputs as needed */}
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                      Submit
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
            </div>
            <br style={{ color: "white" }}></br>
            {transactions.length > 0 && frequency !== "all" && type !== "all" && (
  <div style={{ textAlign: "center", color: "white", margin: "20px 0" }}>
    <h4 style={{ fontWeight: "bold", marginBottom: "15px" }}>Filtered Transactions</h4>

    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
      backgroundColor: "#ddd",
      padding: "20px",
      borderRadius: "10px",
      maxWidth: "500px",
      margin: "auto",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"
    }}>
      {transactions.map((txn) => (
        <div key={txn._id} style={{
          backgroundColor: "#2D336B",
          padding: "10px 15px",
          borderRadius: "8px",
          width: "100%",
          textAlign: "center",
          color: "#fff",
          fontSize: "16px",
          fontWeight: "500"
        }}>
          {txn.title} - ₹{txn.amount} ({txn.transactionType})
        </div>
      ))}
    </div>
  </div>
)}




            {frequency === "custom" ? (
              <>
                <div className="date">
                  <div className="form-group">
                    <label htmlFor="startDate" className="text-white">
                      Start Date:
                    </label>
                    <div>
                      <DatePicker
                        selected={startDate}
                        onChange={handleStartChange}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="endDate" className="text-white">
                      End Date:
                    </label>
                    <div>
                      <DatePicker
                        selected={endDate}
                        onChange={handleEndChange}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}

            <div className="containerBtn">
              <Button variant="primary" onClick={handleReset}>
                Reset Filter
              </Button>
            </div>
            {view === "table" ? (
              <>
                <TableData data={transactions} user={cUser} />
              </>
            ) : (
              <>
                <Analytics transactions={transactions} user={cUser} />
              </>
            )}
            <ToastContainer />
            

          </Container>
        </>
      )}
    </>
  );
};

export default Home;