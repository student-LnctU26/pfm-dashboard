import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaidLink } from "react-plaid-link";

// Mock data to start with
const INITIAL_ACCOUNTS = [
  { id: "1", name: "Chase Checking", mask: "4321", balance: 2450.75, institution: "Chase" },
  { id: "2", name: "BofA Savings", mask: "9876", balance: 12800.00, institution: "Bank of America" }
];

const INITIAL_TRANSACTIONS = [
  { id: "t1", merchant: "Starbucks Coffee", category: "Food & Drink", date: "2026-05-24", amount: -4.75, type: "expense" },
  { id: "t2", merchant: "Salary Pay", category: "Income", date: "2026-05-20", amount: 2500.00, type: "income" },
  { id: "t3", merchant: "Netflix Subscription", category: "Entertainment", date: "2026-05-18", amount: -15.99, type: "expense" },
  { id: "t4", merchant: "Uber", category: "Travel", date: "2026-05-15", amount: -24.50, type: "expense" }
];

function Dashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  
  // Plaid connection states
  const [linkToken, setLinkToken] = useState(null);
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [showMockModal, setShowMockModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [mockLoading, setMockLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Check authentication on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    if (!token) {
      navigate("/");
    } else {
      setUserEmail(email || "user@example.com");
    }
  }, [navigate]);

  // Attempt to fetch real link token from backend (if teammate built it)
  useEffect(() => {
    fetch("/api/plaid/create_link_token", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.link_token) setLinkToken(data.link_token);
      })
      .catch(() => console.log("Backend Plaid link token not configured. Using Mock fallback."));
  }, []);

  const onPlaidSuccess = async (public_token, metadata) => {
    try {
      const response = await fetch("/api/plaid/exchange_public_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ public_token, metadata }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.accounts) setAccounts(data.accounts);
        if (data.transactions) setTransactions(data.transactions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const { open: openPlaid, ready: plaidReady } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
  });

  const handleConnectBank = () => {
    if (linkToken && plaidReady) {
      openPlaid();
    } else {
      setShowMockModal(true);
    }
  };

  const handleMockConnect = (e) => {
    e.preventDefault();
    if (!selectedBank) return;

    setMockLoading(true);

    setTimeout(() => {
      const randMask = Math.floor(1000 + Math.random() * 9000).toString();
      const randBal = Math.floor(2000 + Math.random() * 8000);
      const newAcc = {
        id: Date.now().toString(),
        name: `${selectedBank} Account`,
        mask: randMask,
        balance: randBal,
        institution: selectedBank
      };

      const newTx = {
        id: `t-mock-${Date.now()}`,
        merchant: `${selectedBank} Setup Deposit`,
        category: "Income",
        date: new Date().toISOString().split('T')[0],
        amount: 100.00,
        type: "income"
      };

      setAccounts([...accounts, newAcc]);
      setTransactions([newTx, ...transactions]);
      setMockLoading(false);
      setShowMockModal(false);
      setSelectedBank("");
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  // Calculations
  const totalBalance = accounts.reduce((sum, item) => sum + item.balance, 0);
  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = Math.abs(transactions.filter(t => t.type === "expense").reduce((sum, item) => sum + item.amount, 0));

  const filteredTransactions = transactions.filter(t => {
    if (activeFilter === "income") return t.type === "income";
    if (activeFilter === "expense") return t.type === "expense";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-8">
      {/* Header bar */}
      <nav className="bg-slate-850 border-b border-slate-750 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">PFM Dashboard</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-300 hidden sm:inline">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-755 text-sm rounded border border-slate-700 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Page Area */}
      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Title and connect button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Overview</h1>
            <p className="text-sm text-slate-400">View your bank accounts and recent transactions</p>
          </div>
          <button
            onClick={handleConnectBank}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 font-semibold rounded text-sm transition-colors cursor-pointer"
          >
            + Link Bank Account
          </button>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-850 p-6 rounded-lg border border-slate-750">
            <p className="text-xs text-slate-400 uppercase font-semibold">Total Balance</p>
            <h3 className="text-2xl font-bold text-white mt-1">${totalBalance.toFixed(2)}</h3>
          </div>
          <div className="bg-slate-850 p-6 rounded-lg border border-slate-750">
            <p className="text-xs text-slate-400 uppercase font-semibold">Income</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">${totalIncome.toFixed(2)}</h3>
          </div>
          <div className="bg-slate-850 p-6 rounded-lg border border-slate-750">
            <p className="text-xs text-slate-400 uppercase font-semibold">Expenses</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1">${totalExpense.toFixed(2)}</h3>
          </div>
        </div>

        {/* Lower Grid (Accounts vs Transactions) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Accounts list */}
          <div className="bg-slate-850 p-6 rounded-lg border border-slate-750 lg:col-span-1 space-y-4">
            <h3 className="text-lg font-bold text-white">Connected Accounts</h3>
            <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.id} className="p-3 bg-slate-900 border border-slate-750 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{acc.name}</h4>
                    <p className="text-xs text-slate-500">•••• {acc.mask}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">${acc.balance.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">{acc.institution}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleConnectBank}
              className="w-full py-2 bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-300 text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              + Link Another Account
            </button>
          </div>

          {/* Transactions list */}
          <div className="bg-slate-850 p-6 rounded-lg border border-slate-750 lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
              {/* Filter buttons */}
              <div className="flex gap-1 bg-slate-900 p-0.5 border border-slate-750 rounded text-xs">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer ${activeFilter === "all" ? "bg-purple-600 text-white" : "text-slate-400"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter("income")}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer ${activeFilter === "income" ? "bg-purple-600 text-white" : "text-slate-400"}`}
                >
                  Income
                </button>
                <button
                  onClick={() => setActiveFilter("expense")}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer ${activeFilter === "expense" ? "bg-purple-600 text-white" : "text-slate-400"}`}
                >
                  Expenses
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-750 text-slate-400 uppercase font-semibold">
                    <th className="pb-2">Merchant</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-semibold text-white">{tx.merchant}</td>
                      <td className="py-3 text-slate-400">{tx.category}</td>
                      <td className="py-3 text-slate-400">{tx.date}</td>
                      <td className={`py-3 text-right font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {tx.type === "income" ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-slate-500">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>

      {/* Mock Bank Connection Modal */}
      {showMockModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-850 border border-slate-750 w-full max-w-sm rounded-lg shadow-2xl p-6 relative">
            <h4 className="text-lg font-bold text-white text-center">Connect Bank Account (Mock)</h4>
            <p className="text-xs text-slate-400 text-center mt-1">Simulate Plaid Link connection for testing</p>

            <form onSubmit={handleMockConnect} className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Choose Bank
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Chase", "Bank of America", "Wells Fargo", "Citi"].map(bank => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`py-2 px-3 bg-slate-900 border text-xs font-semibold rounded cursor-pointer text-center block ${selectedBank === bank ? "border-purple-500 text-purple-400" : "border-slate-700 text-slate-300"}`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Mock Username
                </label>
                <input
                  type="text"
                  placeholder="user_good"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Mock Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMockModal(false);
                    setSelectedBank("");
                  }}
                  className="flex-1 py-2 border border-slate-700 text-xs rounded hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mockLoading}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded transition-colors cursor-pointer"
                >
                  {mockLoading ? "Connecting..." : "Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
