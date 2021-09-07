import React, { FunctionComponent, useContext } from "react";
import {
  View, Image, StyleProp, ViewStyle, TouchableWithoutFeedback
} from "react-native";

import { IStore, StoreContext } from "../../utils/store";
import { globalStyles } from "../../utils/styles";
import styles from "./SidebarWidget.style";

interface IProps
{
  containerHeight?: number;
  containerWidth?: number;
  onPress: () => void;
}

export const SidebarWidget: FunctionComponent<IProps> = ({
  containerHeight,
  containerWidth,
  onPress
}) =>
{
  const store = useContext<IStore>(StoreContext);

  if(!store.config.sidebarWidget || !store.widgetImages.sidebar)
  {
    return null;
  }

  const { height, width } = store.config.sidebarWidget;

  const renderedHeight = Math.min(height, (containerHeight || 0) * 0.8);
  const renderedWidth = Math.min(width, (containerWidth || 0) * 0.25);

  let containerStyle: StyleProp<ViewStyle> = {
    height: renderedHeight,
    top: "50%",
    transform: [{ translateY: -(renderedHeight / 2) }],
    width: renderedWidth,
  };

  switch (store.config.sidebarWidget.position)
  {
    case "left":
      containerStyle = {
        ...containerStyle,
        left: 0,
        shadowOffset: { height: 0, width: 1 }
      };
      break;
    case "right":
      containerStyle = {
        ...containerStyle,
        right: 0,
        shadowOffset: { height: 0, width: -1 },
      };
      break;
  }

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={[globalStyles.widgetsShadow, styles.container, containerStyle]}>
        <Image
          source={{ uri: store.widgetImages.sidebar }}
          style={styles.image}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};
