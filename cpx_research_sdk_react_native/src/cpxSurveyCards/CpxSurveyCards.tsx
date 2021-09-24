import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";

import { ITexts } from "../utils/store";
import styles from "./CpxSurveyCards.style";

interface IProps
{
  surveys: any[];
  texts: ITexts;
}

export const CpxSurveyCards: FunctionComponent<IProps> = ({ surveys, texts }) =>
{
  const relevantSurveys = surveys.slice(0, 1);

  if(!surveys || surveys.length === 0 || !texts)
  {
    return null;
  }

  return (
    <View style={styles.cardWrapper}>
      {relevantSurveys.map(survey =>
        <View style={styles.card} key={survey.id}>
          <Text style={styles.payout}>{survey.payout}</Text>
          <Text style={styles.currency}>{survey.payout === 1 ? texts.currencySingular : texts.currencyPlural}</Text>
          <Text>{survey.loi} {texts.shortcutMin}</Text>
          <Text>{survey.statistics_rating_avg}</Text>
        </View>
      )}
    </View>
  );
};
