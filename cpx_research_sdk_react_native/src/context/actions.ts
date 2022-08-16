import { buildWidgetImageUrl, getWidgetImageRequestParams } from "./actionHelpers";
import {
  ISetNotificationWidgetHiding, ISetCpxState
} from "./actionInterfaces";
import { IAppStore } from "./context";

export const setCpxState = (state: IAppStore, payload: ISetCpxState["payload"]): void =>
{
  console.log("[setCPXState] set state to " + payload.state);

  if(state.cpxState === "widgets" && (!state.surveys || state.surveys.length === 0))
  {
    state.cpxState = "hidden";
    return;
  }

  state.cpxState = payload.state;
};

export const setNotificationWidgetHiding = (state: IAppStore, payload: ISetNotificationWidgetHiding["payload"]): void =>
{
  state.isNotificationWidgetHidden = payload.isHidden;
};

export const getWidgetImages = (state: IAppStore): void =>
{
  console.log("[getWidgetImages]");

  const {
    config: {
      cornerWidget,
      notificationWidget,
      sidebarWidget
    }
  } = state;

  let cornerWidgetImage;
  let notificationWidgetImage;
  let sidebarWidgetImage;

  if(cornerWidget)
  {
    const params = getWidgetImageRequestParams("corner", cornerWidget);
    cornerWidgetImage = buildWidgetImageUrl(params);
  }

  if(notificationWidget)
  {
    const params = getWidgetImageRequestParams("screen", notificationWidget);
    notificationWidgetImage = buildWidgetImageUrl(params);
  }

  if(sidebarWidget)
  {
    const params = getWidgetImageRequestParams("side", sidebarWidget);
    sidebarWidgetImage = buildWidgetImageUrl(params);
  }

  state.widgetImages.corner = cornerWidgetImage;
  state.widgetImages.notification = notificationWidgetImage;
  state.widgetImages.sidebar = sidebarWidgetImage;
};
