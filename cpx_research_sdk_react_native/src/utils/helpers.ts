import deepEqual from "deep-equal";

const { version } = require("../../package.json");

export interface IRequestParams
{
  app_id: string;
  ext_user_id: string;
  sdk: string;
  skdVersion: string;
}

export const getRequestParams = (appId: string, userId: string): IRequestParams => ({
  app_id: appId,
  ext_user_id: userId,
  sdk: "react-native",
  skdVersion: version
});

export const checkIfStringIsHexColor = (string: string): boolean =>
{
  const regExp = new RegExp("^#(?:[0-9a-fA-F]{3}){1,2}$");
  return regExp.test(string);
};

export const throwErrorIfColorStringsAreNoHexColor = (strings: (string | undefined)[]): void =>
{
  strings.forEach(string =>
  {
    if(string && !checkIfStringIsHexColor(string))
    {
      throw Error(`The provided color '${string}' is not of hex color format (e.g. '#76BCFF')`);
    }
  });
};

export const buildQueryString = (params: Record<string, any>): string =>
{
  const queryString = Object.keys(params)
    .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k as keyof typeof params]))
    .join("&");

  return "?" + queryString;
};

export const deepPropsComparison = (prevProps: Record<string, any>, nextProps: Record<string, any>): boolean => deepEqual(prevProps, nextProps);
