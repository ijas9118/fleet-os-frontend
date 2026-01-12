import type { DriverOnboardingFormValues } from "@/schemas/driver.schema";
import type { Driver, DriverOnboardingRequest } from "@/types/driver.types";

import { api } from "./api";

export const driverService = {
  /**
   * Complete driver onboarding
   */
  async completeOnboarding(formData: DriverOnboardingFormValues): Promise<Driver> {
    // Transform form data to API request format
    const requestData: DriverOnboardingRequest = {
      licenseNumber: formData.licenseNumber,
      licenseExpiryDate: formData.licenseExpiryDate,
      phoneNumber: formData.phoneNumber,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      },
      emergencyContact: {
        name: formData.emergencyContactName,
        relationship: formData.emergencyContactRelationship,
        phoneNumber: formData.emergencyContactPhone,
      },
    };

    const response = await api.post<{ success: boolean; data: Driver }>(
      "fleet/drivers/complete-onboarding",
      requestData,
    );

    return response.data.data;
  },
};
