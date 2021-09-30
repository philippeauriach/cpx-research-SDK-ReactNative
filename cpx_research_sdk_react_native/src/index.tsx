import React from "react";
import { AppState, AppStateStatus } from "react-native";

import { fetchSurveysAndTransactions, getWidgetImages, markTransactionAsPaid } from "./actions/apiActions";
import { setCpxState, setNotificationWidgetHiding } from "./actions/applicationActions";
import { Container } from "./components/container/Container";
import { CpxSurveyCards } from "./cpxSurveyCards/CpxSurveyCards";
import { throwErrorIfColorStringsAreNoHexColor } from "./utils/helpers";
import { createStore, ICpxConfig, IStore, StoreContext } from "./utils/store";

class CpxResearch extends React.Component<ICpxConfig, IStore>
{
  private fetchSurveysAndTransactionsInterval: NodeJS.Timer | undefined;

  public constructor(props: ICpxConfig)
  {
    super(props);

    throwErrorIfColorStringsAreNoHexColor([
      props.cornerWidget?.backgroundColor,
      props.cornerWidget?.textColor,
      props.sidebarWidget?.backgroundColor,
      props.sidebarWidget?.textColor,
      props.notificationWidget?.backgroundColor,
      props.notificationWidget?.textColor
    ]);

    this.markTransactionAsPaid = this.markTransactionAsPaid.bind(this);
    this.fetchSurveysAndTransactions = this.fetchSurveysAndTransactions.bind(this);
    this.openWebView = this.openWebView.bind(this);

    const store = createStore(props);

    store.subscribers.push((updatedStore: IStore) =>
    {
      this.setState(updatedStore);
    });

    this.state = store;
  }

  private startFetchInterval = (): void =>
  {
    this.fetchSurveysAndTransactionsInterval = setInterval(
      async () => fetchSurveysAndTransactions(this.state),
      10000 // TODO: Change to 120000
    );
  };

  private stopFetchInterval = (): void =>
  {
    if(this.fetchSurveysAndTransactionsInterval)
    {
      clearInterval(this.fetchSurveysAndTransactionsInterval);
    }
  };

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

  public componentDidUpdate(_prevProps: Readonly<ICpxConfig>, prevState: Readonly<IStore>): void
  {
    if(JSON.stringify(prevState.surveys) !== JSON.stringify(this.state.surveys))
    {
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
      <StoreContext.Provider value={this.state}>
        <Container/>
      </StoreContext.Provider>
    );
  }
}

export default CpxResearch;
export { CpxSurveyCards };
