import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

import { IAppStore } from "../context/context";
import { endpoints, urls } from "../utils/globals";
import { getRequestParams } from "../utils/helpers";

export const markTransactionAsPaid = async (transactionId: string, messageId: string, appStore: IAppStore): Promise<void> =>
{
  console.log("[markTransactionAsPaid]");

  const params = {
    ...getRequestParams(appStore),
    messageId,
    transactionId,
    transaction_set_paid: true
  };

  const requestConfig: AxiosRequestConfig = {
    params,
    url: urls.apiUrl + endpoints.surveysEndpoint
  };

  console.log(`Mark transaction ${transactionId} as paid with url '${axios.getUri(requestConfig)}'`);

  let response: AxiosResponse | undefined;
  let hasAnErrorOccurred = false;

  try
  {
    response = await axios.get(urls.apiUrl + endpoints.surveysEndpoint, { params });
  }
  catch (e)
  {
    console.log("an error occurred while marking transaction as paid: ", e);
    hasAnErrorOccurred = true;
  }

  if(response?.data?.error_code)
  {
    console.log("an error occurred while marking transaction as paid: ", response.data.error_message);
    hasAnErrorOccurred = true;
  }

  if(hasAnErrorOccurred)
  {
    return;
  }

  console.log("marked transaction as paid successfully");
};
