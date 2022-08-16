import React, { FunctionComponent, useEffect, useMemo, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useImmerReducer } from "use-immer";

import { fetchSurveysAndTransactions, getWidgetImages, markTransactionAsPaid } from "./actions/apiActions";
import { Container } from "./components/container/Container";
import { IAppContext, ICpxConfig, initialAppStore } from "./context/context";
import appReducer from "./context/reducer";
import { CpxSurveyCards } from "./cpxSurveyCards/CpxSurveyCards";
import { deepPropsComparison, throwErrorIfColorStringsAreNoHexColor } from "./utils/helpers";

const CpxResearch2: FunctionComponent<ICpxConfig> = (props) =>
{
  const fetchSurveysAndTransactionsIntervalRef = useRef<NodeJS.Timer>();
  const [appContext, appDispatch] = useImmerReducer(appReducer, initialAppStore);

  const memoizedAppContext = useMemo<IAppContext>(
    () => ({ appContext, appDispatch }),
    [appContext, appDispatch]
  );

  const startFetchInterval = (): void =>
  {
    fetchSurveysAndTransactionsIntervalRef.current = setInterval(
      async () =>
      {
        if(appContext.cpxState === "webView" || appContext.cpxState === "webViewSingleSurvey")
        {
          return;
        }

        return fetchSurveysAndTransactions(this.state);
      },
      120 * 1000 // 120 Seconds
    );
  };

  const stopFetchInterval = (): void =>
  {
    if(fetchSurveysAndTransactionsIntervalRef.current)
    {
      clearInterval(fetchSurveysAndTransactionsIntervalRef.current);
    }
  };

  useEffect(() =>
  {
    throwErrorIfColorStringsAreNoHexColor([
      props.cornerWidget?.backgroundColor,
      props.cornerWidget?.textColor,
      props.sidebarWidget?.backgroundColor,
      props.sidebarWidget?.textColor,
      props.notificationWidget?.backgroundColor,
      props.notificationWidget?.textColor
    ]);
  }, [props.cornerWidget, props.notificationWidget, props.sidebarWidget]);

  if(props.isHidden)
  {
    return null;
  }

  return (
    <AppStoreContext.Provider value={memoizedAppContext}>
      <Container/>
    </AppStoreContext.Provider>
  );
};

class CpxResearch extends React.Component<ICpxConfig, IStore>
{
  private fetchSurveysAndTransactionsInterval: NodeJS.Timer | undefined;

  private handleAppStateChange = (appState: AppStateStatus): void =>
  {
    if(appState === "active")
    {
      console.log("App has come to foreground. Start timer.");
      void this.startFetchInterval();
    }
    else
    {
      console.log("App has gone to is inactive. Stop timer.");
      void this.stopFetchInterval();
    }
  };

  private onSurveysUpdate(): void
  {
    console.log("surveys changed! " + this.state.surveys?.length + " surveys available");

    if(this.props.onSurveysUpdate)
    {
      this.props.onSurveysUpdate(this.state.surveys);
    }

    if(this.state.cpxState === "webView" || this.state.cpxState === "webViewSingleSurvey")
    {
      // if the user currently uses the webView, do nothing
      console.log("user currently uses the webView. return");
      return;
    }

    if(this.state.surveys?.length > 0)
    {
      if(this.state.cpxState === "hidden")
      {
        console.log("show widgets");
        setCpxState("widgets", this.state);
      }

      if(this.state.isNotificationWidgetHidden)
      {
        console.log("show notification widget");
        setNotificationWidgetHiding(false, this.state);
      }
    }
    else
    {
      if(this.state.cpxState !== "hidden")
      {
        console.log("no surveys available. hide CPX Layer");
        setCpxState("hidden", this.state);
      }
    }
  }

  private onTextsUpdate(): void
  {
    console.log("texts changed!");

    if(this.props.onTextsUpdate)
    {
      this.props.onTextsUpdate(this.state.texts);
    }
  }

  private async onWebViewWasClosed(): Promise<void>
  {
    console.log("webView was closed");

    await fetchSurveysAndTransactions(this.state);

    if(this.props.onWebViewWasClosed) 
    {
      this.props.onWebViewWasClosed();
    }
  }

  private onTransactionsUpdate(): void
  {
    console.log("transactions changed! " + this.state.transactions?.length + " transactions available");

    if(this.props.onTransactionsUpdate)
    {
      this.props.onTransactionsUpdate(this.state.transactions);
    }
  }

  private openWebView(surveyId?: string): void
  {
    this.setState({ singleSurveyIdForWebView: surveyId }, () =>
    {
      setCpxState("webViewSingleSurvey", this.state);
    });
  }

  private async markTransactionAsPaid(transactionId: string, messageId: string): Promise<void>
  {
    await markTransactionAsPaid(transactionId, messageId, this.state);
    await fetchSurveysAndTransactions(this.state);
  }

  private async fetchSurveysAndTransactions(): Promise<void>
  {
    await fetchSurveysAndTransactions(this.state);
  }

  public shouldComponentUpdate(nextProps: Readonly<ICpxConfig>, nextState: Readonly<IStore>): boolean
  {
    console.log("shouldComponentUpdate");

    const didPropsChange = !deepPropsComparison(this.props, nextProps);
    const didStateChange = !deepPropsComparison(this.state, nextState);

    console.log("didPropsChange: " + didPropsChange.valueOf());
    console.log("didStateChange: " + didStateChange.valueOf());

    return didPropsChange || didStateChange;
  }

  public componentDidUpdate(_prevProps: Readonly<ICpxConfig>, prevState: Readonly<IStore>): void
  {
    console.log("[componentDidUpdate]");

    if((prevState.cpxState === "webViewSingleSurvey" || prevState.cpxState === "webView") &&
      (this.state.cpxState !== "webView" && this.state.cpxState !== "webViewSingleSurvey"))
    {
      console.log("call onWebViewWasClosed.");
      console.log("prev: " + prevState.cpxState);
      console.log("now: " + this.state.cpxState);
      void this.onWebViewWasClosed();
    }

    if(JSON.stringify(prevState.surveys) !== JSON.stringify(this.state.surveys))
    {
      console.log("call onSurveysUpdate");
      this.onSurveysUpdate();
    }

    if(JSON.stringify(prevState.transactions) !== JSON.stringify(this.state.transactions))
    {
      this.onTransactionsUpdate();
    }

    if(JSON.stringify(prevState.texts) !== JSON.stringify(this.state.texts))
    {
      this.onTextsUpdate();
    }
  }

  public async componentDidMount(): Promise<void>
  {
    console.log("componentDidMount");

    this.props.bindMarkTransactionAsPaid?.(this.markTransactionAsPaid);
    this.props.bindFetchSurveysAndTransactions?.(this.fetchSurveysAndTransactions);
    this.props.bindOpenWebView?.(this.openWebView);

    void await fetchSurveysAndTransactions(this.state);
    getWidgetImages(this.state);

    this.startFetchInterval();

    AppState.addEventListener("change", this.handleAppStateChange);
  }

  public componentWillUnmount(): void
  {
    AppState.removeEventListener("change", this.handleAppStateChange);

    this.stopFetchInterval();
  }

  public render(): React.ReactElement | null
  {
    if(this.props.isHidden)
    {
      return null;
    }

    return (
      <AppStoreContext.Provider value={memoizedAppContext}>
        <Container/>
      </AppStoreContext.Provider>
    );
  }
}

export default CpxResearch;
export { CpxSurveyCards };
