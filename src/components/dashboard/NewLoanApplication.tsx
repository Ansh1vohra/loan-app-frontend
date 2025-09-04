import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface LoanFormData {
  panOrAadhaar: string;
  monthlyIncome: string;
  purpose: string;
  bankAccount: string;
  loanType: string;
  amount: string;
}

const NewLoanApplication = () => {
  const [formData, setFormData] = useState<LoanFormData>({
    panOrAadhaar: "",
    monthlyIncome: "",
    purpose: "",
    bankAccount: "",
    loanType: "",
    amount: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { token } = useAuth(); // or sessionStorage
  const { toast } = useToast();

  const handleInputChange = (field: keyof LoanFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.panOrAadhaar || !formData.monthlyIncome || !formData.loanType || !formData.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }

    if (isNaN(Number(formData.monthlyIncome)) || Number(formData.monthlyIncome) <= 0) {
      toast({
        title: "Invalid Income",
        description: "Monthly income must be a positive number.",
        variant: "destructive",
      });
      return false;
    }

    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 1000) {
      toast({
        title: "Invalid Amount",
        description: "Loan amount must be greater than ₹1000.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/loan/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Application failed");
      }

      setIsSuccess(true);
      toast({
        title: "Application Submitted!",
        description: "Your loan application has been successfully submitted.",
      });

    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-4">
        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Application Submitted!</h3>
            <p className="text-muted-foreground mb-4">
              Your loan application has been received and is under review.
            </p>
            <p className="text-sm text-muted-foreground">
              You'll receive an update within 2-3 business days.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-6">
        <PlusCircle className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Apply for Loan</h2>
      </div>

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Loan Application Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PAN or Aadhaar */}
            <div className="space-y-2">
              <Label htmlFor="panOrAadhaar">PAN or Aadhaar Number *</Label>
              <Input
                id="panOrAadhaar"
                placeholder="ABCDE1234F or 1234 5678 9012"
                value={formData.panOrAadhaar}
                onChange={(e) => handleInputChange("panOrAadhaar", e.target.value)}
                className="h-12"
                disabled={isSubmitting}
              />
            </div>

            {/* Monthly Income */}
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income (₹) *</Label>
              <Input
                id="monthlyIncome"
                type="number"
                placeholder="Enter your monthly income"
                value={formData.monthlyIncome}
                onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
                className="h-12"
                disabled={isSubmitting}
              />
            </div>

            {/* Loan Type */}
            <div className="space-y-2">
              <Label>Loan Type *</Label>
              <Select
                value={formData.loanType}
                onValueChange={(value) => handleInputChange("loanType", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personal">Personal Loan</SelectItem>
                  <SelectItem value="Home">Home Loan</SelectItem>
                  <SelectItem value="Car">Car Loan</SelectItem>
                  <SelectItem value="Education">Education Loan</SelectItem>
                  <SelectItem value="Business">Business Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loan Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Loan Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter desired loan amount"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className="h-12"
                disabled={isSubmitting}
              />
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Loan</Label>
              <Textarea
                id="purpose"
                placeholder="Briefly describe the purpose of your loan"
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
                className="min-h-[80px]"
                disabled={isSubmitting}
              />
            </div>

            {/* Bank Account */}
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account Number</Label>
              <Input
                id="bankAccount"
                placeholder="Enter your bank account number"
                value={formData.bankAccount}
                onChange={(e) => handleInputChange("bankAccount", e.target.value)}
                className="h-12"
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By submitting this application, you agree to our terms and conditions
              and authorize us to verify the provided information.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewLoanApplication;
