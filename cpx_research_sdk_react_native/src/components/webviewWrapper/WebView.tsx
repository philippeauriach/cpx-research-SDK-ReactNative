import axios from "axios";
import React, { Component, ErrorInfo, ReactElement } from "react";
import { Text } from "react-native";
import { WebView as ReactNativeWebView } from "react-native-webview";

import AppStoreContext, { IAppContext } from "../../context/context";
import { endpoints, urls } from "../../utils/globals";
import { getRequestParams } from "../../utils/helpers";

interface IProps
{
  activeTab: string;
  currentUrl: string;
  onLoadEnd: () => void;
  onLoadStart: () => void;
}

interface IState
{
  hasError: false;
}

class WebView extends Component<IProps, IState>
{
  private constructor(props: IProps)
  {
    super(props);
    this.state = { hasError: false };
  }

  public shouldComponentUpdate(nextProps: Readonly<IProps>): boolean
  {
    return this.props.activeTab !== nextProps.activeTab;
  }

  private static getDerivedStateFromError(error: any): { hasError: boolean }
  {
    console.error("[WebView getDerivedStateFromError]: ", error);

    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void
  {
    console.error("WebView did catch an error: ", error, errorInfo);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onError = async (appStore: IAppContext, nativeEvent: any, error?: string): Promise<void> =>
  {
    if(error) 
    {
      alert("Something went wrong: " + error);
    }
    else 
    {
      alert("Something went wrong");
    }

    try 
    {
      await axios.get(urls.baseUrl + endpoints.homeEndpoint, {
        params: {
          ...getRequestParams(appStore.appContext.config.appId, appStore.appContext.config.userId),
          webViewErrorEvent: nativeEvent,
        }
      });
    }
    catch (e) 
    {
      console.log("an error occurred while logging the webViewError", e);
    }

    appStore.appDispatch({
      actionType: "setCpxState",
      payload: { state: "widgets" }
    });
  };

  public render(): ReactElement
  {
    if(this.state.hasError)
    {
      return <Text>Something went wrong.</Text>;
    }

    return (
      <AppStoreContext.Consumer>
        {appStore => (
          <ReactNativeWebView
            {...this.props}
            onError={(syntheticEvent: any) =>
            {
              const { nativeEvent } = syntheticEvent;
              console.error("[WebView onError]: ", nativeEvent);
              void this.onError(appStore, nativeEvent, nativeEvent.description);
            }}
            onHttpError={(syntheticEvent: any) => 
            {
              const { nativeEvent } = syntheticEvent;
              console.error("[WebView onHttpError]: WebView received error: ", nativeEvent);
              void this.onError(appStore, nativeEvent, nativeEvent.statusCode + " - " + nativeEvent.description);
            }}
            source={{ uri: this.props.currentUrl }}
          />
        )}
      </AppStoreContext.Consumer>
    );
  }
}

export default WebView;
