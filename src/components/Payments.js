import { useState } from "react";
import { makePayment } from "../services/paymentService";

 

const Payments = ({taskId }) => {
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await makePayment(taskId, amount);
    setAmount("");
  };

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="text-lg font-bold">Make Payment</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Amount ($)"
          className="w-full p-2 border rounded mb-3"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
          Pay
        </button>
      </form>
    </div>
  );
};

export default Payments;
