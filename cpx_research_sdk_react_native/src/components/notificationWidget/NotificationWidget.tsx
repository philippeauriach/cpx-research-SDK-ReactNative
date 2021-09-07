import React, { FunctionComponent, useContext } from "react";
import {
  View, Image, StyleProp, ViewStyle, TouchableWithoutFeedback, Text
} from "react-native";

import { setNotificationWidgetHiding } from "../../actions/applicationActions";
import { IStore, StoreContext } from "../../utils/store";
import { globalStyles } from "../../utils/styles";
import styles from "./NotificationWidget.style";

interface IProps
{
  containerHeight?: number;
  containerWidth?: number;
  onPress: () => void;
}

export const NotificationWidget: FunctionComponent<IProps> = ({
  containerHeight,
  containerWidth,
  onPress
}) =>
{
  const store = useContext<IStore>(StoreContext);

  if(!store.config.notificationWidget || !store.widgetImages.notification)
  {
    return null;
  }

  const {
    height,
    textColor,
    width
  } = store.config.notificationWidget;

  const renderedHeight = Math.min(height, (containerHeight || 0) * 0.25);
  const renderedWidth = Math.min(width, (containerWidth || 0) * 0.8);

  let containerStyle: StyleProp<ViewStyle> = {
    alignSelf: "center",
    height: renderedHeight,
    width: renderedWidth,
  };

  switch (store.config.notificationWidget.position)
  {
    case "top":
      containerStyle = {
        ...containerStyle,
        top: 0
      };
      break;
    case "bottom":
      containerStyle = {
        ...containerStyle,
        bottom: 0,
      };
      break;
  }

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={[globalStyles.widgetsShadow, styles.container, containerStyle]}>
        <TouchableWithoutFeedback onPress={() => setNotificationWidgetHiding(true, store)}>
          <View style={styles.closeIconContainer}>
            <Text style={[styles.closeIcon, { color: textColor }]}>&times;</Text>
          </View>
        </TouchableWithoutFeedback>
        <Image
          source={{ uri: store.widgetImages.notification }}
          style={styles.image}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};
