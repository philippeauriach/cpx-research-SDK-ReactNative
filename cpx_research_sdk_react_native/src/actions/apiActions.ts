// @ts-ignore
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

import { endpoints, urls } from "../utils/globals";
import { getRequestParams } from "../utils/helpers";

export const fetchSurveysAndTransactions = async (store: IStore): Promise<void> =>
{
  console.log("[fetchSurveysAndTransactions]");

  let hasAnErrorOccurred = false;
  let response: AxiosResponse;

  try
  {
    response = await axios.get(urls.apiUrl + endpoints.surveysEndpoint, { params: getRequestParams(store) });
  }
  catch (e)
  {
    console.log("an error occurred while fetching surveys and transactions: ", e);
    hasAnErrorOccurred = true;
  }

  if(!hasAnErrorOccurred && response == null)
  {
    console.log("an error occurred while fetching surveys and transactions: empty response");
    hasAnErrorOccurred = true;
  }
  else if(!hasAnErrorOccurred && response?.data?.error_code)
  {
    console.log("an error occurred while fetching surveys and transactions: ", response.data?.error_message);
    hasAnErrorOccurred = true;
  }

  const storeCopy = { ...store };

  if(hasAnErrorOccurred)
  {
    storeCopy.surveys = [];
    storeCopy.transactions = [];
    storeCopy.singleSurveyIdForWebView = undefined;
    storeCopy.texts = emptyTexts;

    store = storeCopy;
    store.notify();
    return;
  }

  if(!response.data)
  {
    console.log("no data returned from the api");
    return;
  }

  if(!response.data.surveys)
  {
    console.log("no surveys returned from the api");
    return;
  }

  console.log(`fetched ${response.data?.count_available_surveys} surveys and ${response.data?.transactions?.length} transactions successfully`);

  storeCopy.surveys = response.data.surveys;
  storeCopy.singleSurveyIdForWebView = response.data.surveys?.[0]?.id;
  storeCopy.transactions = response.data.transactions || [];
  storeCopy.texts = {
    currencyPlural: response.data.text?.currency_name_plural,
    currencySingular: response.data.text?.currency_name_singular,
    shortcutMin: response.data.text?.shortcurt_min,
  };

  store = storeCopy;
  store.notify();
  return;
};

