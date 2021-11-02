import React, { FunctionComponent, useContext, useState } from "react";
import {
  ActivityIndicator,
  Image, TouchableWithoutFeedback, View,
} from "react-native";
// @ts-ignore
import ProgressBar from "react-native-progress/Bar";
// @ts-ignore
import { WebViewProps } from "react-native-webview";

import { setCpxState } from "../../actions/applicationActions";
import { endpoints, urls } from "../../utils/globals";
import { buildQueryString, getRequestParams } from "../../utils/helpers";
import { IStore, StoreContext } from "../../utils/store";
import WebView from "./WebView";
import styles, { progressBarHeight } from "./Webview.style";
import { WebviewIcon } from "./webviewIcon/WebviewIcon";
import webviewIconStyles from "./webviewIcon/WebviewIcon.style";

const closeIcon = require("../../../assets/close.png");
const helpIcon = require("../../../assets/help.png");
const homeIcon = require("../../../assets/home.png");
const settingsIcon = require("../../../assets/settings.png");

interface ITabs
{
  help: string;
  home: string;
  settings: string;
}

export const WebviewWrapper: FunctionComponent = () =>
{
  const store = useContext<IStore>(StoreContext);

  const baseUrl = urls.baseUrl + endpoints.homeEndpoint;
  const requestParams = getRequestParams(store);

  const tabs: ITabs = {
    help: baseUrl + buildQueryString({
      ...requestParams,
      site: "help"
    }),
    home: baseUrl + buildQueryString({
      ...requestParams,
      survey_id: store.cpxState === "webViewSingleSurvey" ? store.singleSurveyIdForWebView : undefined,
    }),
    settings: baseUrl + buildQueryString({
      ...requestParams,
      site: "settings-webview"
    }),
  };

  const [activeTab, setActiveTab] = useState<keyof typeof tabs>("home");
  const [isLoading, setIsLoading] = useState(false);
  const [webViewContainerWidth, setWebViewContainerWidth] = useState<number | undefined>();

  return (
    <View style={styles.container}>
      <View style={styles.iconsWrapper}>
        <WebviewIcon
          icon={helpIcon}
          isActive={activeTab === "help"}
          onPress={() => setActiveTab("help")}
        />
        <WebviewIcon
          icon={settingsIcon}
          isActive={activeTab === "settings"}
          onPress={() => setActiveTab("settings")}
        />
        <WebviewIcon
          icon={homeIcon}
          isActive={activeTab === "home"}
          onPress={() => setActiveTab("home")}
        />
        <TouchableWithoutFeedback onPress={() =>
        {
          console.log("close webView");
          setCpxState("widgets", store);
        }}>
          <View style={webviewIconStyles.iconWrapper}>
            <Image style={webviewIconStyles.iconImage} source={closeIcon}/>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View style={{ flex: 1 }} onLayout={e => setWebViewContainerWidth(e.nativeEvent.layout.width)}>
        {isLoading && (
          <>
            <View style={styles.linearProgressBarWrapper}>
              <ProgressBar
                indeterminate={true}
                width={webViewContainerWidth || 0}
                height={progressBarHeight}
                unfilledColor="white"
                borderColor="transparent"
                borderWidth={0}
                color={store.config.accentColor}
              />
            </View>
            <View pointerEvents="box-none" style={styles.circularProgressIndicatorWrapper}>
              <ActivityIndicator
                style={styles.circularProgressIndicator}
                size="large"
                color={store.config.accentColor}
              />
            </View>
          </>
        )}
        <WebView
          activeTab={activeTab}
          currentUrl={tabs[activeTab]}
          onLoadEnd={() => setIsLoading(false)}
          onLoadStart={() => setIsLoading(true)}
        />
      </View>
    </View>
  );
};
