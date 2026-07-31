import axios from "axios";
import config from "../../config";

// ---- Khalti ePayment (KPG-2) types ----

export type TKhaltiCustomerInfo = {
  name?: string;
  email?: string;
  phone?: string;
};

export type TKhaltiInitiatePayload = {
  return_url: string;
  website_url: string;
  amount: number; // amount in paisa
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info?: TKhaltiCustomerInfo;
};

export type TKhaltiInitiateResponse = {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
};

export type TKhaltiLookupStatus =
  | "Completed"
  | "Pending"
  | "Initiated"
  | "Refunded"
  | "Expired"
  | "User canceled"
  | "Partial Refunded";

export type TKhaltiLookupResponse = {
  pidx: string;
  total_amount: number;
  status: TKhaltiLookupStatus;
  transaction_id: string | null;
  fee: number;
  refunded: boolean;
};

const khaltiClient = axios.create({
  baseURL: config.khalti.khalti_base_url,
  headers: {
    Authorization: `Key ${config.khalti.khalti_secret_key}`,
    "Content-Type": "application/json",
  },
});

// Initiate a payment request with Khalti (KPG-2) and get back the pidx + payment_url
const initiatePayment = async (
  payload: TKhaltiInitiatePayload
): Promise<TKhaltiInitiateResponse> => {
  const { data } = await khaltiClient.post<TKhaltiInitiateResponse>(
    "/epayment/initiate/",
    payload
  );

  return data;
};

// Verify / lookup the status of a payment using its pidx
const verifyPaymentAsync = async (
  pidx: string
): Promise<TKhaltiLookupResponse> => {
  const { data } = await khaltiClient.post<TKhaltiLookupResponse>(
    "/epayment/lookup/",
    { pidx }
  );

  return data;
};

// Export utility functions
export const orderUtils = {
  initiatePayment,
  verifyPaymentAsync,
};
