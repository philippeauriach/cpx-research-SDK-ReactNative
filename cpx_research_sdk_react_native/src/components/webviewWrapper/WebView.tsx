// @ts-ignore
import axios from "axios";
// eslint-disable-next-line import/no-extraneous-dependencies
import React, { Component, ReactElement } from "react";
// @ts-ignore
import { WebView as ReactNativeWebView } from "react-native-webview";

import { setCpxState } from "../../actions/applicationActions";
import { endpoints, urls } from "../../utils/globals";
import { getRequestParams } from "../../utils/helpers";
import { StoreContext } from "../../utils/store";

interface IProps
{
  activeTab: string;
  currentUrl: string;
  onLoadEnd: () => void;
  onLoadStart: () => void;
}

class WebView extends Component<IProps>
{
  public shouldComponentUpdate(nextProps: Readonly<IProps>): boolean
  {
    return this.props.activeTab !== nextProps.activeTab;
  }

  public render(): ReactElement
  {
    return (
      <StoreContext.Consumer>
        {store => (
          <ReactNativeWebView
            {...this.props}
            renderError={async (errorDomain: string | undefined, errorCode: number, errorDesc: string) =>
            {
              alert("An error occurred: " + errorDesc);
              setCpxState("widgets", store);
              console.log("[renderError] ", errorDomain, errorCode, errorDesc);

              try
              {
                await axios.get(urls.baseUrl + endpoints.homeEndpoint, {
                  params: {
                    ...getRequestParams(store),
                    webViewErrorCode: errorCode,
                    webViewErrorDescription: errorDesc,
                    webViewErrorDomain: errorDomain
                  }
                });
              }
              catch (e)
              {
                console.log("an error occurred while logging the webViewError", e);
              }
            }}
            source={{ uri: this.props.currentUrl }}
          />
        )}
      </StoreContext.Consumer>
    );
  }
}

export default WebView;
