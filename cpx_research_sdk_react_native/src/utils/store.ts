import React from "react";

interface IWidgetStyle
{
  backgroundColor: string;
  roundedCorners: number;
  text: string;
  textColor: string;
  textSize: number;
}

interface IWidgetConfig
{
  isSingleSurvey?: boolean;
}

export interface ICornerWidgetStyle extends IWidgetStyle
{
  position: "topleft" | "topright" | "bottomright" | "bottomleft";
  size: number;
}

export interface INotificationWidgetStyle extends IWidgetStyle
{
  height: number;
  position: "top" | "bottom";
  width: number;
}

export interface ISidebarWidgetStyle extends IWidgetStyle
{
  height: number;
  position: "left" | "right";
  width: number;
}

export interface ICpxConfig
{
  accentColor: string;
  appId: string;
  bindFetchSurveysAndTransactions?: (fetchSurveysAndTransactions: () => Promise<void>) => void;
  bindMarkTransactionAsPaid?: (markTransactionAsPaid: (transactionId: string, messageId: string) => Promise<void>) => void;
  bindOpenWebView?: (openWebView: (surveyId?: string) => void) => void;
  cornerWidget?: ICornerWidgetStyle & IWidgetConfig;
  isHidden?: boolean;
  notificationWidget?: INotificationWidgetStyle & IWidgetConfig;
  onSurveysUpdate?: (surveys: any[]) => void;
  onTransactionsUpdate?: (transactions: any[]) => void;
  sidebarWidget?: ISidebarWidgetStyle & IWidgetConfig;
  userId: string;
}

export type ICpxState = "hidden" | "webView" | "webViewSingleSurvey" | "widgets";

interface IWidgetImages
{
  corner?: string;
  notification?: string;
  sidebar?: string;
}

export interface IStore
{
  config: ICpxConfig;
  cpxState: ICpxState;
  isNotificationWidgetHidden: boolean;
  notify(): void;
  singleSurveyIdForWebView?: any;
  subscribers: ((store: IStore) => void)[];
  surveys: any[];
  transactions: any[];
  widgetImages: IWidgetImages;
}

export const StoreContext = React.createContext<IStore>(null as unknown as IStore);

export const createStore = (config: ICpxConfig): IStore => ({
  config,
  cpxState: "hidden",
  isNotificationWidgetHidden: false,
  notify()
  {
    this.subscribers.forEach((subscriber: (store: IStore) => void) =>
      subscriber(this)
    );
  },
  singleSurveyIdForWebView: undefined,
  subscribers: [],
  surveys: [],
  transactions: [],
  widgetImages: {},
});
