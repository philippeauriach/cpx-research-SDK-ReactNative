import React, { FunctionComponent, useContext, useState } from "react";
import {
  Image, TouchableWithoutFeedback, View,
} from "react-native";
import ProgressBar from "react-native-progress/Bar";

import AppStoreContext, { IAppContext } from "../../context/context";
import { endpoints, urls } from "../../utils/globals";
import { buildQueryString, getRequestParams } from "../../utils/helpers";
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
  const { appContext, appDispatch } = useContext<IAppContext>(AppStoreContext);

  const baseUrl = urls.baseUrl + endpoints.homeEndpoint;
  const requestParams = getRequestParams(appContext.config.appId, appContext.config.userId);

  const tabs: ITabs = {
    help: baseUrl + buildQueryString({
      ...requestParams,
      site: "help"
    }),
    home: baseUrl + buildQueryString({
      ...requestParams,
      survey_id: appContext.cpxState === "webViewSingleSurvey" ? appContext.singleSurveyIdForWebView : undefined,
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

          appDispatch({
            actionType: "setCpxState",
            payload: { state: "widgets" }
          });
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
                color={appContext.config.accentColor}
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
