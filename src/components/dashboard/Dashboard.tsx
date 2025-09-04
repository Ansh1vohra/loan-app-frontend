import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { History, PlusCircle, LogOut, User } from "lucide-react";
import LoanHistory from "./LoanHistory";
import NewLoanApplication from "./NewLoanApplication";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<"history" | "apply">("history");
  const { email, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">LoanApp</h1>
            <p className="text-sm text-muted-foreground">Welcome back!</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{email}</p>
              <p className="text-xs text-muted-foreground">Account</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {activeTab === "history" && <LoanHistory />}
        {activeTab === "apply" && <NewLoanApplication />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
              activeTab === "history"
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">History</span>
          </button>
          
          <button
            onClick={() => setActiveTab("apply")}
            className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
              activeTab === "apply"
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PlusCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Apply</span>
          </button>
          
          <button
            onClick={logout}
            className="flex-1 flex flex-col items-center py-3 px-2 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;