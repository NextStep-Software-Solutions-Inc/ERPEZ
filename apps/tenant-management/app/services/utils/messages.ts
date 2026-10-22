import type { APIResponse, PaginationResponse, AxiosError, AxiosResponse } from "erpez-shared-lib";

export const extractErrorMessage = (error: AxiosError): { title: string, description: string } => {
  let title = error.message || "Error";
  console.error({ error });
  if (!error.response?.data || typeof error.response?.data !== "object") {
    return {
      title,
      description: "An error occurred while processing your request."
    };
  }
  let message =
    "message" in error.response.data && typeof error.response.data.message === "string"
      ? error.response.data.message
      : "An error occurred while processing your request.";

  if ("error" in error.response.data && Array.isArray(error.response.data.error)) {

    const errorDetails = error.response.data.error
      .filter((item: unknown) => item && typeof item === "object")
      .flatMap((item: Record<string, unknown>) =>
        Object.entries(item)
          .filter(([_, value]) => value && typeof value === "string")
          .map(([key, value]) => `${key}: ${value}`)
      );

    if (errorDetails.length > 0) {
      message += "\n Details: " + errorDetails.join("; ");
    }
  }

  return {
    title,
    description: message
  };
};

/**
 * Extracts a success message from an Axios response that follows the project's APIResponse/PaginationResponse shapes.
 */
export const extractSuccessMessage = <T>(
  response: AxiosResponse<APIResponse<T> | PaginationResponse<T>>
): string => {
  return response.data &&
    "succeeded" in response.data &&
    response.data.succeeded &&
    "message" in response.data &&
    typeof response.data.message === "string"
    ? response.data.message
    : "Request successful";
};
