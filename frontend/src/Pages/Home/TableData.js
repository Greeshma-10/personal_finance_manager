import React, { useEffect, useState } from "react";
import { Button, Container, Form, Modal, Table, Alert,ProgressBar } from "react-bootstrap";
import axios from "axios";
import moment from "moment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import "./home.css";

const TableData = () => {
  const [transactions, setTransactions] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currId, setCurrId] = useState(null);
  const [deletedTransaction, setDeletedTransaction] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [countdown, setCountdown] = useState(30); // ⏳ 30-second timer
  const [deletedTransactions, setDeletedTransactions] = useState([null]);





  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const [newTransaction, setNewTransaction] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: moment().format("YYYY-MM-DD"),
    transactionType: "Expense",
  });

  // Fetch transactions from MongoDB
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");

        if (!userEmail) {
          console.error("User email is missing. Please log in.");
          return;
        }

        const response = await axios.get(`http://localhost:4000/api/v1/getTransaction?email=${userEmail}`);
        setTransactions(response.data.transactions || []);
      } catch (error) {
        console.error("Error fetching transactions:", error.response?.data || error.message);
      }
    };
    fetchTransactions();
  }, []);

  // Open Edit Modal and Load Data
  const handleEditClick = (transactionId) => {
    console.log("Clicked Edit for:", transactionId);
    
    const transaction = transactions.find((item) => item._id === transactionId);
  
    if (transaction) {
      console.log("Transaction found:", transaction);
  
      setCurrId(transactionId);
      setEditingTransaction(transaction);
      setValues({
        title: transaction.title,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: moment(transaction.date).format("YYYY-MM-DD"),
        transactionType: transaction.transactionType,
      });
  
      setShowEdit(true);
    } else {
      console.error("Transaction not found for ID:", transactionId);
    }
  };
  

  // Update Transaction in MongoDB
  const handleEditSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const userEmail = localStorage.getItem("userEmail");
  
      if (!userEmail) {
        console.error("User email not found. Ensure the user is logged in.");
        return;
      }
  
      const userId = await getUserIdByEmail(userEmail);
  
      if (!userId) {
        console.error("Failed to fetch userId for email:", userEmail);
        return;
      }
  
      const response = await axios.put(
        `http://localhost:4000/api/v1/updateTransaction/${currId}?userId=${userId}`,
        values
      );
  
      // Update state with the modified transaction
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === currId ? { ...transaction, ...values } : transaction
        )
      );
  
      setShowEdit(false);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };
  

  // Delete Transaction from MongoDB
  // Function to get userId by email
const getUserIdByEmail = async (userEmail) => {
  try {
    const response = await axios.get(`http://localhost:4000/api/v1/getUserId?email=${userEmail}`);
    return response.data.userId; // Extract userId from the response
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null;
  }
};
// multiple deletion
const handleSelectTransaction = (transactionId) => {
  setSelectedTransactions((prevSelected) =>
    prevSelected.includes(transactionId)
      ? prevSelected.filter((id) => id !== transactionId) // Remove if already selected
      : [...prevSelected, transactionId] // Add if not selected
  );
};

// Handle "Select All" functionality
const handleSelectAll = () => {
  if (selectedTransactions.length === transactions.length) {
    setSelectedTransactions([]); // Deselect all
  } else {
    setSelectedTransactions(transactions.map((item) => item._id)); // Select all
  }
};

const handleBulkDelete = async () => {
  if (selectedTransactions.length === 0) {
    alert("No transactions selected for deletion.");
    return;
  }

  if (!window.confirm("⚠️ Are you sure? This action is irreversible and will permanently delete the selected transactions.")) {
    return;
  }

  try {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      console.error("User email not found.");
      return;
    }

    const userId = await getUserIdByEmail(userEmail);
    if (!userId) {
      console.error("Failed to fetch userId.");
      return;
    }

    // 🔥 Send DELETE request
    const response = await axios.delete(`http://localhost:4000/api/v1/deleteTransactions`, {
      data: { userId, transactionIds: selectedTransactions },
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 200) {
      console.log("✅ Transactions permanently deleted.");

      // 🔥 Remove deleted transactions from UI
      setTransactions((prev) => prev.filter((t) => !selectedTransactions.includes(t._id)));
      setSelectedTransactions([]);
    }
  } catch (error) {
    console.error("❌ Error permanently deleting transactions:", error);
    alert("Failed to delete transactions. Please try again.");
  }
};



const handleDeleteClick = async (transactionId) => {
  try {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
      console.error("User email not found. Ensure the user is logged in.");
      return;
    }

    const userId = await getUserIdByEmail(userEmail);

    if (!userId) {
      console.error("Failed to fetch userId for email:", userEmail);
      return;
    }

    console.log("Soft deleting transaction:", transactionId);

    // ✅ Soft delete: Mark transaction as `isDeleted: true`
    const response = await axios.put(
      `http://localhost:4000/api/v1/softDeleteTransaction/${transactionId}`,
      { userId }, 
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.status === 200) {
      console.log("Transaction marked as deleted.");

      // ✅ Store deleted transaction for Undo
      setDeletedTransaction(response.data.transaction);
      setShowUndo(true);

      // ✅ Remove transaction from UI
      setTransactions((prev) => prev.filter((t) => t._id !== transactionId));

      // ✅ Auto-delete permanently after 30s
      setTimeout(() => {
        if (deletedTransaction) {
          handleHardDelete(transactionId);
        }
      }, 30000); // 30 seconds
    } else {
      console.error("Failed to soft delete transaction:", response.data);
    }
  } catch (error) {
    console.error("Error deleting transaction:", error.response?.data || error.message);
  }
};

const handleUndoDelete = async () => {
  if (!deletedTransaction) return;

  try {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
      console.error("User email not found. Ensure the user is logged in.");
      return;
    }

    const userId = await getUserIdByEmail(userEmail);

    if (!userId) {
      console.error("Failed to fetch userId for email:", userEmail);
      return;
    }

    console.log("Restoring transaction:", deletedTransaction._id);

    // ✅ Restore soft-deleted transaction
    const response = await axios.put("http://localhost:4000/api/v1/restoreTransaction", {
      transactionId: deletedTransaction._id,
      userId: userId,
    });

    if (response.data.success) {
      console.log("Transaction restored successfully.");

      // ✅ Add back to transactions list
      setTransactions((prev) => [...prev, response.data.transaction]);

      // ✅ Hide Undo button & clear deleted transaction
      setShowUndo(false);
      setDeletedTransaction(null);
    } else {
      console.error("Failed to restore transaction:", response.data.message);
    }
  } catch (error) {
    console.error("Error restoring transaction:", error);
  }
};

// ✅ Countdown timer logic
useEffect(() => {
  if (showUndo && countdown > 0) {
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }

  // When countdown reaches 0, remove Undo button
  if (countdown === 0) {
    setShowUndo(false);
    setDeletedTransaction(null);
  }
}, [showUndo, countdown]);

// ✅ Hard delete permanently after timeout
const handleHardDelete = async (transactionId) => {
  try {
    console.log("Permanently deleting transaction:", transactionId);

    const response = await axios.delete(
      `http://localhost:4000/api/v1/hardDeleteTransaction/${transactionId}`
    );

    if (response.status === 200) {
      console.log("Transaction permanently deleted.");
      setDeletedTransaction(null);
    } else {
      console.error("Failed to permanently delete transaction:", response.data.message);
    }
  } catch (error) {
    console.error("Error permanently deleting transaction:", error.message);
  }
};

  // Add New Transaction to MongoDB
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const userEmail = localStorage.getItem("userEmail");
      const transactionData = { ...newTransaction, email: userEmail };

      const response = await axios.post("http://localhost:4000/api/v1/addTransaction", transactionData);

      setTransactions((prevTransactions) => [...prevTransactions, response.data.transaction]);

      setShowAdd(false);
      setNewTransaction({
        title: "",
        amount: "",
        description: "",
        category: "",
        date: moment().format("YYYY-MM-DD"),
        transactionType: "Expense",
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <>
      <Container>
        
      {showUndo && (
        <Alert variant="warning" className="d-flex align-items-center">
          <span className="me-auto">Transaction deleted! Undo within {countdown}s</span>
          <Button variant="link" onClick={handleUndoDelete} className="me-2">
            Undo
          </Button>
          <ProgressBar
            animated
            striped
            now={(countdown / 30) * 100} // Progress bar percentage
            variant="danger"
            style={{ width: "100px", height: "5px" }}
          />
        </Alert>
      )}
        {selectedTransactions.length > 0 && (
        <Button
          variant="danger"
          className="mb-3"
          onClick={handleBulkDelete}
        >
          Delete Selected ({selectedTransactions.length})
        </Button>
      )}



        

<Table responsive="md" className="data-table">
  <thead>
    <tr>
      <th>
        <input
          type="checkbox"
          checked={selectedTransactions.length === transactions.length && transactions.length > 0}
          onChange={handleSelectAll}
        />
      </th>
      <th>Date</th>
      <th>Title</th>
      <th>Amount</th>
      <th>Type</th>
      <th>Category</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody className="text-white">
    {transactions && transactions.length > 0 ? (
      transactions.map((item) => (
        <tr key={item._id}>
          <td>
            <input
              type="checkbox"
              checked={selectedTransactions.includes(item._id)}
              onChange={() => handleSelectTransaction(item._id)}
            />
          </td>
          <td>{moment(item.date).format("YYYY-MM-DD")}</td>
          <td>{item.title}</td>
          <td>{item.amount}</td>
          <td>{item.transactionType}</td>
          <td>{item.category}</td>
          <td>
            <EditNoteIcon sx={{ cursor: "pointer" }} onClick={() => handleEditClick(item._id)} />
            <DeleteForeverIcon sx={{ color: "red", cursor: "pointer" }} onClick={() => handleDeleteClick(item._id)} />
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="7" className="text-center">No transactions found</td>
      </tr>
    )}
  </tbody>
</Table>

      </Container>
     


      {/* Add Transaction Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={newTransaction.title} onChange={(e) => setNewTransaction({ ...newTransaction, title: e.target.value })} />
            </Form.Group>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAdd(false)}>Close</Button>
              <Button variant="primary" type="submit">Add</Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Edit Transaction Modal */}
<Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Edit Transaction</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleEditSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control 
          type="text" 
          value={values.title} 
          onChange={(e) => setValues({ ...values, title: e.target.value })} 
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Amount</Form.Label>
        <Form.Control 
          type="number" 
          value={values.amount} 
          onChange={(e) => setValues({ ...values, amount: e.target.value })} 
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Control 
          type="text" 
          value={values.category} 
          onChange={(e) => setValues({ ...values, category: e.target.value })} 
        />
      </Form.Group>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowEdit(false)}>Close</Button>
        <Button variant="primary" type="submit">Save Changes</Button>
      </Modal.Footer>
    </Form>
  </Modal.Body>
</Modal>

    </>
  );
};

export default TableData;
