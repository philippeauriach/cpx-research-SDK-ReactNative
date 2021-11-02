import React, { FunctionComponent, useContext, useState } from "react";
import { SafeAreaView, View } from "react-native";

import { setCpxState } from "../../actions/applicationActions";
import { IStore, StoreContext } from "../../utils/store";
import { CornerWidget } from "../cornerWidget/CornerWidget";
import { NotificationWidget } from "../notificationWidget/NotificationWidget";
import { SidebarWidget } from "../sidebarWidget/SidebarWidget";
import { WebviewWrapper } from "../webviewWrapper/WebviewWrapper";
import styles from "./Container.style";

export const Container: FunctionComponent = () =>
{
  const store = useContext<IStore>(StoreContext);

  const [containerHeight, setContainerHeight] = useState<number | undefined>();
  const [containerWidth, setContainerWidth] = useState<number | undefined>();

  if(store.cpxState === "hidden")
  {
    return null;
  }

  const onWidgetPress = (isSingleSurvey?: boolean): void =>
  {
    console.log("open webview");
    setCpxState(isSingleSurvey ? "webViewSingleSurvey" : "webView", store);
  };

  const isWebViewActive = store.cpxState === "webView" || store.cpxState === "webViewSingleSurvey";

  return (
    <SafeAreaView
      pointerEvents="box-none"
      style={[styles.container, isWebViewActive && styles.containerWebViewActive]}>
      <View
        pointerEvents="box-none"
        style={styles.innerContainer}
        onLayout={event =>
        {
          setContainerHeight(event.nativeEvent.layout.height);
          setContainerWidth(event.nativeEvent.layout.width);
        }}>
        {store.cpxState === "widgets" && (
          <>
            <CornerWidget onPress={() => onWidgetPress(store.config.cornerWidget?.isSingleSurvey)}/>
            <SidebarWidget
              onPress={() => onWidgetPress(store.config.sidebarWidget?.isSingleSurvey)}
              containerHeight={containerHeight}
              containerWidth={containerWidth}
            />
            {!store.isNotificationWidgetHidden && (
              <NotificationWidget
                onPress={() => onWidgetPress(store.config.notificationWidget?.isSingleSurvey)}
                containerHeight={containerHeight}
                containerWidth={containerWidth}
              />
            )}
          </>
        )}
        {isWebViewActive && <WebviewWrapper/>}
      </View>
    </SafeAreaView>
  );
};
