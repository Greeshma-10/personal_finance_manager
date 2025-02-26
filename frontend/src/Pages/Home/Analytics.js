import React from "react";
import { Container, Row } from "react-bootstrap";
import CircularProgressBar from "../../components/CircularProgressBar";
import LineProgressBar from "../../components/LineProgressBar";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

const Analytics = ({ transactions }) => {
  if (!transactions.length) return null;

  const TotalTransactions = transactions.length;
  const totalIncomeTransactions = transactions.filter(item => item.transactionType === "credit");
  const totalExpenseTransactions = transactions.filter(item => item.transactionType === "expense");

  let totalIncomePercent = (totalIncomeTransactions.length / TotalTransactions) * 100;
  let totalExpensePercent = (totalExpenseTransactions.length / TotalTransactions) * 100;

  const totalTurnOver = transactions.reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  const totalTurnOverIncome = totalIncomeTransactions.reduce((acc, transaction) => acc + Number(transaction.amount), 0);
  const totalTurnOverExpense = totalExpenseTransactions.reduce((acc, transaction) => acc + Number(transaction.amount), 0);

  const TurnOverIncomePercent = (totalTurnOverIncome / totalTurnOver) * 100;
  const TurnOverExpensePercent = (totalTurnOverExpense / totalTurnOver) * 100;

  const categories = ["Groceries", "Rent", "Salary", "Tip", "Food", "Medical", "Utilities", "Entertainment", "Transportation", "Other"];
  const colors = {
    "Groceries": '#FF6384', "Rent": '#36A2EB', "Salary": '#FFCE56', "Tip": '#4BC0C0',
    "Food": '#9966FF', "Medical": '#FF9F40', "Utilities": '#8AC926', "Entertainment": '#6A4C93',
    "Transportation": '#1982C4', "Other": '#F45B69'
  };

  const monthlyData = {};
  transactions.forEach(transaction => {
    const month = new Date(transaction.date).toLocaleString("default", { month: "short" });
    if (!monthlyData[month]) {
      monthlyData[month] = { month, income: 0, expense: 0 };
    }
    if (transaction.transactionType === "credit") {
      monthlyData[month].income += Number(transaction.amount);
    } else {
      monthlyData[month].expense += Number(transaction.amount);
    }
  });

  const monthlyChartData = Object.values(monthlyData);

  return (
    <Container className="mt-5 text-center">
      <Row>
        {[{
          title: "Total Transactions", data: TotalTransactions, income: totalIncomeTransactions.length,
          expense: totalExpenseTransactions.length, incomePercent: totalIncomePercent,
          expensePercent: totalExpensePercent
        }, {
          title: "Total TurnOver", data: totalTurnOver, income: totalTurnOverIncome,
          expense: totalTurnOverExpense, incomePercent: TurnOverIncomePercent,
          expensePercent: TurnOverExpensePercent
        }].map((item, index) => (
          <div key={index} className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header bg-dark text-white font-weight-bold">{item.title}: {item.data}</div>
              <div className="card-body">
                <h5 className="text-success">Income: <ArrowDropUpIcon /> {item.income} <CurrencyRupeeIcon /></h5>
                <h5 className="text-danger">Expense: <ArrowDropDownIcon /> {item.expense} <CurrencyRupeeIcon /></h5>
                <CircularProgressBar percentage={item.incomePercent.toFixed(0)} color="green" className="my-3" />
                <CircularProgressBar percentage={item.expensePercent.toFixed(0)} color="red" />
              </div>
            </div>
          </div>
        ))}
        {['credit', 'expense'].map((type, index) => (
          <div key={index} className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-black text-white font-weight-bold">Category-wise {type === "credit" ? "Income" : "Expense"}</div>
              <div className="card-body">
                {categories.map(category => {
                  const amount = transactions.filter(t => t.transactionType === type && t.category === category)
                    .reduce((acc, t) => acc + Number(t.amount), 0);
                  const percent = (amount / totalTurnOver) * 100;
                  return amount > 0 && <LineProgressBar key={category} label={category} percentage={percent.toFixed(0)} lineColor={colors[category]} />;
                })}
              </div>
            </div>
          </div>
        ))}
      
      </Row>

      <div className="mt-5">
        <h4 className="mb-4 text-primary">Monthly Income vs Expense</h4>
        <div className="bg-white p-3 rounded shadow-sm">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="month" stroke="#333" />
              <YAxis stroke="#333" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#4CAF50" strokeWidth={3} name="Income" dot={{ r: 5 }} />
              <Line type="monotone" dataKey="expense" stroke="#F44336" strokeWidth={3} name="Expense" dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Container>
  );
};

export default Analytics;
