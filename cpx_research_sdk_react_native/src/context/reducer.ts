import {
  ISetNotificationWidgetHiding,
  ISetCpxState, IGetWidgetImages
} from "./actionInterfaces";
import {
  getWidgetImages,
  setCpxState, setNotificationWidgetHiding
} from "./actions";
import { IAppStore } from "./context";

const appReducer = (state: IAppStore, action: IAppContextActions): IAppStore | void =>
{
  switch (action.actionType) 
  {
    case "setNotificationWidgetHiding":
      return setNotificationWidgetHiding(state, action.payload);
    case "setCpxState":
      return setCpxState(state, action.payload);
    case "getWidgetImages":
      return getWidgetImages(state);
  }
};

export default appReducer;

export type IAppContextActions =
  ISetCpxState |
  IGetWidgetImages |
  ISetNotificationWidgetHiding;
