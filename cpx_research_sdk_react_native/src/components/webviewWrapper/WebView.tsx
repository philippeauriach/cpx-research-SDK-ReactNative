// eslint-disable-next-line import/no-extraneous-dependencies
import React, { Component, ReactElement } from "react";
// @ts-ignore
import { WebView as ReactNativeWebView } from "react-native-webview";

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
      <ReactNativeWebView
        {...this.props}
        source={{
          uri: this.props.currentUrl
        }}
      />
    );
  }
}

export default WebView;
