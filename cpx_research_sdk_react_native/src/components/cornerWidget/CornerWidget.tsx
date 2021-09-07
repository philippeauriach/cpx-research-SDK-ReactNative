import React, { FunctionComponent, useContext } from "react";
import {
  View, Image, StyleProp, ViewStyle, ImageStyle, TouchableWithoutFeedback
} from "react-native";

import { IStore, StoreContext } from "../../utils/store";
import { globalStyles } from "../../utils/styles";
import styles from "./CornerWidget.style";

interface IProps
{
  onPress: () => void;
}

export const CornerWidget: FunctionComponent<IProps> = ({ onPress }) =>
{
  const store = useContext<IStore>(StoreContext);

  if(!store.config.cornerWidget || !store.widgetImages.corner)
  {
    return null;
  }

  const { size } = store.config.cornerWidget;

  const buttonSize = size * Math.sqrt(2);
  const buttonOffset = -(size * Math.sqrt(2) / 2);

  let buttonStyle: StyleProp<ViewStyle>;
  let containerStyle: StyleProp<ViewStyle>;
  let imageStyle: StyleProp<ImageStyle>;

  switch (store.config.cornerWidget.position)
  {
    case "topleft":
      buttonStyle = {
        left: buttonOffset,
        top: buttonOffset,
      };
      containerStyle = {
        left: 0,
        shadowOffset: { height: 1, width: 1 },
        top: 0,
      };
      imageStyle = {
        left: 0,
        top: 0
      };
      break;
    case "topright":
      buttonStyle = {
        right: buttonOffset,
        top: buttonOffset,
      };
      containerStyle = {
        right: 0,
        shadowOffset: { height: 1, width: -1 },
        top: 0
      };
      imageStyle = {
        right: 0,
        top: 0
      };
      break;
    case "bottomright":
      buttonStyle = {
        bottom: buttonOffset,
        right: buttonOffset,
      };
      containerStyle = {
        bottom: 0,
        right: 0,
        shadowOffset: { height: -1, width: -1 }
      };
      imageStyle = {
        bottom: 0,
        right: 0
      };
      break;
    case "bottomleft":
      buttonStyle = {
        bottom: buttonOffset,
        left: buttonOffset,
      };
      containerStyle = {
        bottom: 0,
        left: 0,
        shadowOffset: { height: -1, width: 1 }
      };
      imageStyle = {
        bottom: 0,
        left: 0
      };
      break;
  }

  return (
    <View pointerEvents="box-none" style={[globalStyles.widgetsShadow, styles.container, containerStyle]}>
      <Image
        source={{ uri: store.widgetImages.corner }}
        style={[styles.image, imageStyle, {
          height: size,
          width: size,
        }]}
      />
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={[styles.triangle, buttonStyle, {
          height: buttonSize,
          width: buttonSize,
        }]}
        />
      </TouchableWithoutFeedback>
    </View>
  );
};
