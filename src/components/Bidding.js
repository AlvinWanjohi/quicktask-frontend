import { useState } from "react";
import { placeBid } from "../services/bidService";

const Bidding = ({ taskId }) => {
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await placeBid(taskId, amount);
    setAmount("");
  };

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="text-lg font-bold">Place a Bid</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Bid Amount ($)"
          className="w-full p-2 border rounded mb-3"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Bid
        </button>
      </form>
    </div>
  );
};

export default Bidding;
