import React, {
  FunctionComponent, useCallback, useEffect, useMemo, useRef 
} from "react";
import { AppState, AppStateStatus } from "react-native";
import { useImmerReducer } from "use-immer";

import { fetchSurveysAndTransactionsApi, ISurveysTransactionsTexts, markTransactionAsPaidApi } from "./api/api";
import { Container } from "./components/container/Container";
import AppStoreContext, {
  emptyTexts, getInitialAppStore, IAppContext, ICpxConfig
} from "./context/context";
import appReducer from "./context/reducer";
import { CpxSurveyCards } from "./cpxSurveyCards/CpxSurveyCards";
import usePrevious from "./hooks/usePrevious";
import { deepPropsComparison, getRequestParams, throwErrorIfColorStringsAreNoHexColor } from "./utils/helpers";

let CpxResearch: FunctionComponent<ICpxConfig> = config =>
{
  const {
    bindFetchSurveysAndTransactions,
    bindMarkTransactionAsPaid,
    bindOpenWebView,
    onSurveysUpdate: onSurveysUpdateCallback,
    onTextsUpdate: onTextsUpdateCallback,
    onTransactionsUpdate: onTransactionsUpdateCallback,
    onWebViewWasClosed: onWebViewWasClosedCallback,
  } = config;

  const fetchSurveysAndTransactionsIntervalRef = useRef<NodeJS.Timer>();
  const [appContext, appDispatch] = useImmerReducer(appReducer, getInitialAppStore(config));

  const memoizedAppContext = useMemo<IAppContext>(
    () => ({ appContext, appDispatch }),
    [appContext, appDispatch]
  );

  const {
    cpxState,
    isNotificationWidgetHidden,
    surveys,
    texts,
    transactions,
  } = memoizedAppContext.appContext;

  const requestParams = useMemo(
    () => getRequestParams(config.appId, config.userId),
    [config.appId, config.userId]
  );

  const previousSurveys = usePrevious(appContext.surveys);
  const previousTransactions = usePrevious(appContext.transactions);
  const previousTexts = usePrevious(appContext.texts);
  const previousCpxState = usePrevious(appContext.cpxState);

  const fetchSurveysAndTransactions = useCallback(async (): Promise<void> =>
  {
    console.log("fetchSurveysAndTransactions");

    let surveysAndTransactions: ISurveysTransactionsTexts | undefined;

    try
    {
      surveysAndTransactions = await fetchSurveysAndTransactionsApi(requestParams);
    }
    catch (e)
    {
      appDispatch({
        actionType: "updateAppContext",
        payload: {
          singleSurveyIdForWebView: undefined,
          surveys: [],
          texts: emptyTexts,
          transactions: [],
        }
      });
      return;
    }

    appDispatch({
      actionType: "updateAppContext",
      payload: {
        singleSurveyIdForWebView: surveysAndTransactions.surveys?.[0]?.id,
        surveys: surveysAndTransactions.surveys,
        texts: surveysAndTransactions.texts,
        transactions: surveysAndTransactions.transactions,
      }
    });
  }, [requestParams, appDispatch]);

  const startFetchInterval = useCallback((): void =>
  {
    if(fetchSurveysAndTransactionsIntervalRef.current)
    {
      return;
    }

    fetchSurveysAndTransactionsIntervalRef.current = setInterval(
      async () =>
      {
        console.log("interval");
        return fetchSurveysAndTransactions();
      },
      5 * 1000 // 120 Seconds
    );
  }, [fetchSurveysAndTransactions]);

  const stopFetchInterval = (): void =>
  {
    if(fetchSurveysAndTransactionsIntervalRef.current)
    {
      clearInterval(fetchSurveysAndTransactionsIntervalRef.current);
    }
  };

  const handleAppStateChange = useCallback((appState: AppStateStatus): void =>
  {
    if(appState === "active")
    {
      console.log("App has come to foreground. Start timer.");
      void startFetchInterval();
    }
    else
    {
      console.log("App has gone to is inactive. Stop timer.");
      void stopFetchInterval();
    }
  }, [startFetchInterval]);

  const onTransactionsUpdate = useCallback((): void =>
  {
    console.log("transactions changed! " + transactions?.length + " transactions available");

    if(onTransactionsUpdateCallback)
    {
      onTransactionsUpdateCallback(transactions);
    }
  }, [transactions, onTransactionsUpdateCallback]);

  const markTransactionAsPaid = useCallback(async (transactionId: string, messageId: string): Promise<void> =>
  {
    await markTransactionAsPaidApi(transactionId, messageId, requestParams);
    await fetchSurveysAndTransactions();
  }, [requestParams, fetchSurveysAndTransactions]);

  const onTextsUpdate = useCallback((): void =>
  {
    console.log("texts changed!");

    if(onTextsUpdateCallback)
    {
      onTextsUpdateCallback(texts);
    }
  }, [texts, onTextsUpdateCallback]);

  const openWebView = useCallback((surveyId?: string): void =>
  {
    appDispatch({
      actionType: "updateAppContext",
      payload: {
        cpxState: "webViewSingleSurvey",
        singleSurveyIdForWebView: surveyId
      }
    });
  }, [appDispatch]);

  const onWebViewWasClosed = useCallback(async (): Promise<void> =>
  {
    console.log("webView was closed");

    await fetchSurveysAndTransactions();

    if(onWebViewWasClosedCallback)
    {
      onWebViewWasClosedCallback();
    }
  }, [fetchSurveysAndTransactions, onWebViewWasClosedCallback]);

  const onSurveysUpdate = useCallback((): void =>
  {
    console.log("surveys changed! " + surveys?.length + " surveys available");

    if(onSurveysUpdateCallback)
    {
      onSurveysUpdateCallback(surveys);
    }

    if(cpxState === "webView" || cpxState === "webViewSingleSurvey")
    {
      // if the user currently uses the webView, do nothing
      console.log("user currently uses the webView. return");
      return;
    }

    if(surveys?.length > 0)
    {
      if(cpxState === "hidden")
      {
        console.log("show widgets");

        appDispatch({
          actionType: "setCpxState",
          payload: { state: "widgets" }
        });
      }

      if(isNotificationWidgetHidden)
      {
        console.log("show notification widget");

        appDispatch({
          actionType: "setNotificationWidgetHiding",
          payload: { isHidden: false }
        });
      }
    }
    else
    {
      if(cpxState !== "hidden")
      {
        console.log("no surveys available. hide CPX Layer");

        appDispatch({
          actionType: "setCpxState",
          payload: { state: "hidden" }
        });
      }
    }
  }, [cpxState, isNotificationWidgetHidden, surveys, appDispatch, onSurveysUpdateCallback]);

  useEffect(() =>
  {
    console.log("[useEffect 1]");

    bindMarkTransactionAsPaid?.(markTransactionAsPaid);
    bindFetchSurveysAndTransactions?.(fetchSurveysAndTransactions);
    bindOpenWebView?.(openWebView);
  }, [
    fetchSurveysAndTransactions,
    markTransactionAsPaid,
    openWebView,
    bindMarkTransactionAsPaid,
    bindFetchSurveysAndTransactions,
    bindOpenWebView
  ]);

  useEffect(() =>
  {
    console.log("[useEffect 2]");

    void fetchSurveysAndTransactions();
  }, [fetchSurveysAndTransactions]);

  useEffect(() =>
  {
    console.log("[useEffect 3]");

    appDispatch({ actionType: "getWidgetImages" });
  }, [appDispatch]);

  useEffect(() =>
  {
    console.log("[useEffect 4]");

    startFetchInterval();

  }, [startFetchInterval]);

  useEffect(() =>
  {
    console.log("[useEffect 5]");

    AppState.addEventListener("change", handleAppStateChange);

    return () =>
    {
      AppState.removeEventListener("change", handleAppStateChange);
      stopFetchInterval();
    };
  }, [handleAppStateChange]);

  useEffect(() =>
  {
    if((previousCpxState === "webViewSingleSurvey" || previousCpxState === "webView") &&
      (cpxState !== "webView" && cpxState !== "webViewSingleSurvey"))
    {
      console.log("call onWebViewWasClosed.");
      console.log("prev: " + previousCpxState);
      console.log("now: " + cpxState);
      void onWebViewWasClosed();
    }
  }, [cpxState, onWebViewWasClosed, previousCpxState]);

  useEffect(() =>
  {
    if(JSON.stringify(previousSurveys) !== JSON.stringify(surveys))
    {
      console.log("call onSurveysUpdate");
      onSurveysUpdate();
    }
  }, [onSurveysUpdate, previousSurveys, surveys]);

  useEffect(() =>
  {
    if(JSON.stringify(previousTransactions) !== JSON.stringify(transactions))
    {
      onTransactionsUpdate();
    }
  }, [onTransactionsUpdate, previousTransactions, transactions]);

  useEffect(() =>
  {
    if(JSON.stringify(previousTexts) !== JSON.stringify(texts))
    {
      onTextsUpdate();
    }
  }, [onTextsUpdate, previousTexts, texts]);

  useEffect(() =>
  {
    throwErrorIfColorStringsAreNoHexColor([
      config.cornerWidget?.backgroundColor,
      config.cornerWidget?.textColor,
      config.sidebarWidget?.backgroundColor,
      config.sidebarWidget?.textColor,
      config.notificationWidget?.backgroundColor,
      config.notificationWidget?.textColor
    ]);
  }, [config.cornerWidget, config.notificationWidget, config.sidebarWidget]);

  if(config.isHidden)
  {
    return null;
  }

  return (
    <AppStoreContext.Provider value={memoizedAppContext}>
      <Container/>
    </AppStoreContext.Provider>
  );
};

CpxResearch = React.memo(CpxResearch, deepPropsComparison);

export default CpxResearch;
export { CpxSurveyCards };
