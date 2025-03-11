import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTaskById, submitBid, getBidsByTaskId, acceptBid } from "../services/taskService";

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [userRole, setUserRole] = useState("freelancer");
  
  useEffect(() => {
    const fetchTask = async () => {
      const data = await getTaskById(id);
      setTask(data);
    };

    const fetchBids = async () => {
      const bidData = await getBidsByTaskId(id);
      setBids(bidData);
    };

    fetchTask();
    fetchBids();
  }, [id]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    const bidData = { taskId: id, amount: bidAmount, message: bidMessage };
    const newBid = await submitBid(bidData);
    setBids([...bids, newBid]);
    setBidAmount("");
    setBidMessage("");
  };

  const handleAcceptBid = async (bidId) => {
    await acceptBid(bidId);
    alert("Bid accepted!");

  };

  if (!task) return <p>Loading task details...</p>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold">{task.title}</h2>
      <p className="text-gray-700">{task.description}</p>
      <p className="text-blue-600 font-semibold">Budget: ${task.budget}</p>

      {/* Bidding Section */}
      {userRole === "freelancer" && (
        <div className="mt-6 p-4 border rounded-lg shadow">
          <h3 className="text-lg font-semibold">Place a Bid</h3>
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <input
              type="number"
              placeholder="Enter your bid amount"
              className="w-full p-2 border rounded"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              required
            />
            <textarea
              placeholder="Write a short proposal..."
              className="w-full p-2 border rounded"
              value={bidMessage}
              onChange={(e) => setBidMessage(e.target.value)}
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Submit Bid
            </button>
          </form>
        </div>
      )}

      {/* Bids List (For Task Owner) */}
      {userRole === "employer" && (
        <div className="mt-6 p-4 border rounded-lg shadow">
          <h3 className="text-lg font-semibold">Bids Received</h3>
          {bids.length > 0 ? (
            <ul>
              {bids.map((bid) => (
                <li key={bid.id} className="border-b py-2">
                  <p><strong>Bidder:</strong> {bid.freelancerName}</p>
                  <p><strong>Amount:</strong> ${bid.amount}</p>
                  <p><strong>Message:</strong> {bid.message}</p>
                  <button
                    className="bg-green-600 text-white px-3 py-1 mt-2 rounded"
                    onClick={() => handleAcceptBid(bid.id)}
                  >
                    Accept Bid
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No bids yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
