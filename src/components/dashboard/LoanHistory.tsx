import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Loan {
  _id: string;
  loanType: string;
  monthlyIncome: number;
  status: "Applied" | "Approved" | "Rejected";
  createdAt: string;
  purpose: string;
  amount: number;
}

interface UnderwritingResult {
  decision: string;
  score: number;
  reasons: string[];
}

const LoanHistory = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [underwritingResults, setUnderwritingResults] = useState<Record<string, UnderwritingResult>>({});
  const { toast } = useToast();
  const { token } = useAuth();

  useEffect(() => {
    fetchLoanHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLoanHistory = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/loan/my-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch loans");
      }

      setLoans(data.applications || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch loan history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (loanId: string) => {
    try {
      setEvaluatingId(loanId);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/underwriting/${loanId}/underwrite`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );


      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to evaluate loan");
      }

      setUnderwritingResults((prev) => ({
        ...prev,
        [loanId]: data,
      }));

      toast({
        title: "Evaluation Complete",
        description: "Underwriting analysis has been completed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to evaluate loan",
        variant: "destructive",
      });
    } finally {
      setEvaluatingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Rejected":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your loans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Loan History</h2>
      </div>

      {loans.length === 0 ? (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="pt-6 text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No loans yet</h3>
            <p className="text-muted-foreground">Apply for your first loan to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <Card key={loan._id} className="border-0 shadow-[var(--shadow-card)]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">{loan.loanType} Loan</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{loan.purpose}</p>
                  </div>
                  <Badge className={`${getStatusColor(loan.status)} border`}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(loan.status)}
                      {loan.status}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Loan Amount:</p>
                  <p className="text-lg font-medium">₹{loan.amount.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Income</p>
                    <p className="text-lg font-semibold">₹{loan.monthlyIncome.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Applied Date</p>
                    <p className="text-sm font-medium">{new Date(loan.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {underwritingResults[loan._id] && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Underwriting Results</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Decision:</span>
                        <span className="text-sm font-medium">{underwritingResults[loan._id].decision}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Score:</span>
                        <span className="text-sm font-medium">{underwritingResults[loan._id].score}/100</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Reasons:</p>
                        <ul className="text-sm space-y-1">
                          {underwritingResults[loan._id].reasons.map((reason, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-primary">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {loan.status === "Applied" && !underwritingResults[loan._id] && (
                  <Button
                    onClick={() => handleEvaluate(loan._id)}
                    disabled={evaluatingId === loan._id}
                    variant="outline"
                    className="w-full"
                  >
                    {evaluatingId === loan._id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Evaluate
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoanHistory;
