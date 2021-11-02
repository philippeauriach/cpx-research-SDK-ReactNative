import React, { FunctionComponent, useContext } from "react";
import { Image, ImageSourcePropType, TouchableOpacity } from "react-native";

import { IStore, StoreContext } from "../../../utils/store";
import styles from "./WebviewIcon.style";

interface IProps
{
  icon: ImageSourcePropType;
  isActive: boolean;
  onPress: () => void;
}

export const WebviewIcon: FunctionComponent<IProps> = ({
  icon,
  isActive,
  onPress,
}) =>
{
  const store = useContext<IStore>(StoreContext);

  return (
    <TouchableOpacity
      activeOpacity={.6}
      disabled={isActive}
      onPress={onPress}
      style={[styles.iconWrapper, isActive && { backgroundColor: store.config.accentColor }]}>
      <Image style={styles.iconImage} source={icon}/>
    </TouchableOpacity>
  );
};
