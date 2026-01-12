export interface DriverOnboardingRequest {
  licenseNumber: string;
  licenseExpiryDate: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
}

export interface Driver {
  id: string;
  userId: string;
  tenantId: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  status: "pending" | "active" | "inactive" | "suspended";
  onboardedAt?: string;
  createdAt: string;
  updatedAt: string;
}
