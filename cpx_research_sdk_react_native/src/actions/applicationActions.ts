import { ICpxState, IStore } from "../utils/store";

export const setCpxState = (state: ICpxState, store: IStore): void =>
{
  console.log("[setCPXState]");

  const storeCopy = { ...store };

  if(state === "widgets" && (!storeCopy.surveys || storeCopy.surveys.length === 0))
  {
    storeCopy.cpxState = "hidden";
    store = storeCopy;
    store.notify();
    return;
  }

  storeCopy.cpxState = state;
  store = storeCopy;
  store.notify();
};

export const setNotificationWidgetHiding = (isHidden: boolean, store: IStore): void =>
{
  const storeCopy = { ...store };

  storeCopy.isNotificationWidgetHidden = isHidden;

  store = storeCopy;
  store.notify();
};
