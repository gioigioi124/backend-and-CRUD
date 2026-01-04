import { useState } from "react";
import { Users } from "lucide-react";
import CustomerUpload from "../components/CustomerUpload";
import CustomerList from "../components/CustomerList";

const CustomerManagementPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger refresh of customer list
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Khách Hàng</h1>
          <p className="text-muted-foreground">
            Upload và quản lý thông tin khách hàng
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <CustomerUpload onUploadSuccess={handleUploadSuccess} />

      {/* Customer List */}
      <CustomerList refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default CustomerManagementPage;
