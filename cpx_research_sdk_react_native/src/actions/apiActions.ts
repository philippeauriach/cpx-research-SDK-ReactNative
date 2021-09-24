// @ts-ignore
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

import { endpoints, urls } from "../utils/globals";
import { getRequestParams } from "../utils/helpers";
import {
  emptyTexts, ICornerWidgetStyle, INotificationWidgetStyle, ISidebarWidgetStyle, IStore
} from "../utils/store";

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

  if(response.data.error_code)
  {
    console.log("an error occurred while fetching surveys and transactions: ", response.data.error_message);
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

  console.log(`fetched ${response.data.count_available_surveys} surveys and ${response.data.transactions.length} transactions successfully`);

  storeCopy.surveys = response.data.surveys;
  storeCopy.singleSurveyIdForWebView = response.data.surveys?.[0]?.id;
  storeCopy.transactions = response.data.transactions;
  storeCopy.texts = {
    currencyPlural: response.data.text?.currency_name_plural,
    currencySingular: response.data.text?.currency_name_singular,
    shortcutMin: response.data.text?.shortcurt_min,
  };

  store = storeCopy;
  store.notify();
  return;
};

interface IGetCpxImageRequestParams
{
  backgroundcolor: string;
  corner: number;
  emptycolor: "transparent";
  height: number;
  position: string;
  text: string;
  textcolor: string;
  textsize: number;
  type: "corner" | "screen" | "side";
  width: number;
}

const getWidgetImageRequestParams = (
  type: "corner" | "screen" | "side",
  widgetStyle: INotificationWidgetStyle | ISidebarWidgetStyle | ICornerWidgetStyle
): IGetCpxImageRequestParams => ({
  backgroundcolor: "." + widgetStyle.backgroundColor.substring(1),
  corner: widgetStyle.roundedCorners,
  emptycolor: "transparent",
  height: "height" in widgetStyle ? widgetStyle.height : widgetStyle.size,
  position: widgetStyle.position,
  text: widgetStyle.text,
  textcolor: "." + widgetStyle.textColor.substring(1),
  textsize: widgetStyle.textSize,
  type,
  width: "width" in widgetStyle ? widgetStyle.width : widgetStyle.size,
});

const buildWidgetImageUrl = (params: IGetCpxImageRequestParams): string =>
{
  console.log("build " + params.type + " widget image url");

  return axios.getUri({
    params,
    url: urls.imagesUrl + endpoints.imagesEndpoint
  });
};

export const getWidgetImages = (store: IStore): void =>
{
  console.log("[getWidgetImages]");

  const {
    config: {
      cornerWidget,
      notificationWidget,
      sidebarWidget
    }
  } = store;

  let cornerWidgetImage;
  let notificationWidgetImage;
  let sidebarWidgetImage;

  if(cornerWidget)
  {
    const params = getWidgetImageRequestParams("corner", cornerWidget);
    cornerWidgetImage = buildWidgetImageUrl(params);
  }

  if(notificationWidget)
  {
    const params = getWidgetImageRequestParams("screen", notificationWidget);
    notificationWidgetImage = buildWidgetImageUrl(params);
  }

  if(sidebarWidget)
  {
    const params = getWidgetImageRequestParams("side", sidebarWidget);
    sidebarWidgetImage = buildWidgetImageUrl(params);
  }

  const storeCopy = { ...store };

  storeCopy.widgetImages.corner = cornerWidgetImage;
  storeCopy.widgetImages.notification = notificationWidgetImage;
  storeCopy.widgetImages.sidebar = sidebarWidgetImage;

  store = storeCopy;
  store.notify();
};

export const markTransactionAsPaid = async (transactionId: string, messageId: string, store: IStore): Promise<void> =>
{
  console.log("[markTransactionAsPaid]");

  const params = {
    ...getRequestParams(store),
    messageId,
    transactionId,
    transaction_set_paid: true
  };

  const requestConfig: AxiosRequestConfig = {
    params,
    url: urls.apiUrl + endpoints.surveysEndpoint
  };

  console.log(`Mark transaction ${transactionId} as paid with url '${axios.getUri(requestConfig)}'`);

  let response: AxiosResponse;
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

  if(response.data.error_code)
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
