import React, { useState } from 'react';

const MyBids = () => {
  const [bids, setBids] = useState([
    { id: 1, task: "Website Development", amount: 250, status: "Pending" },
    { id: 2, task: "Logo Design", amount: 100, status: "Accepted" },
    { id: 3, task: "App UI Design", amount: 300, status: "Rejected" }
  ]);
  const [sortOrder, setSortOrder] = useState("asc");

  const sortBids = () => {
    const sortedBids = [...bids].sort((a, b) => (sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount));
    setBids(sortedBids);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-100 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">My Bids</h1>
        <p className="mt-4 text-lg text-gray-700">Track your bids and manage them efficiently.</p>

        <button onClick={sortBids} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          Sort by Amount ({sortOrder === "asc" ? "Lowest First" : "Highest First"})
        </button>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bids.map((bid) => (
            <div key={bid.id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <h3 className="text-xl font-semibold">{bid.task}</h3>
              <p className="text-gray-600 mt-2">Your Bid: <span className="text-purple-600 font-bold">${bid.amount}</span></p>
              <span className={`px-3 py-1 rounded-full text-white ${bid.status === "Accepted" ? "bg-green-500" : bid.status === "Rejected" ? "bg-red-500" : "bg-yellow-500"}`}>
                {bid.status}
              </span>
              <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                Manage Bid
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyBids;
