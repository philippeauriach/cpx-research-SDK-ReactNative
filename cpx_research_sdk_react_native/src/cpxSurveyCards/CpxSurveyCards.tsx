import React, { FunctionComponent } from "react";
import { Image, ScrollView, Text, View } from "react-native";

import { ITexts } from "../utils/store";
import styles from "./CpxSurveyCards.style";

const clockIcon = require("../../assets/clock.png");
const starIcon = require("../../assets/star.png");

interface IConfig
{
  accentColor?: string;
  cardBackgroundColor?: string;
  inactiveStarColor?: string;
  starColor?: string;
  textColor?: string;
}

interface IProps
{
  config?: IConfig;
  surveys: any[];
  texts: ITexts;
}

export const CpxSurveyCards: FunctionComponent<IProps> = ({
  config,
  surveys,
  texts
}) =>
{
  const relevantSurveys = surveys.slice(0, 10);

  if(!surveys || surveys.length === 0 || !texts)
  {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal style={styles.cardsWrapper}>
        {relevantSurveys.map((survey, index) =>
        {
          const stars = survey.statistics_rating_avg || 0;
          const disabledStars = 5 - stars;
          const accentColor = config?.accentColor || "#43eadc";

          return (
            <View
              style={[
                styles.card,
                { backgroundColor: config?.cardBackgroundColor || "white" },
                index === 0 ? { marginLeft: 12 } : { },
                index === relevantSurveys.length - 1 ? { marginRight: 12 } : { }
              ]}
              key={survey.id}>
              <Text style={[styles.payout, { color: accentColor }]}>{survey.payout}</Text>
              <Text style={[styles.currency, { color: accentColor }]}>{survey.payout === 1 ? texts.currencySingular : texts.currencyPlural}</Text>
              <View style={styles.timeNeededWrapper}>
                <Image style={[styles.clockIcon, { tintColor: accentColor }]} source={clockIcon}/>
                <Text style={[styles.timeNeededText, { color: config?.textColor || "black" }]}>
                  {survey.loi} {texts.shortcutMin}
                </Text>
              </View>
              <View style={styles.starsWrapper}>
                {[...Array(stars)].map((_, index2) => (
                  <Image
                    key={index2}
                    style={[styles.star, { tintColor: config?.starColor || "#ffc400" }]}
                    source={starIcon}
                  />
                ))}
                {[...Array(disabledStars)].map((_, index2) => (
                  <Image
                    key={"2-" + index2}
                    style={[styles.star, { tintColor: config?.inactiveStarColor || "#dfdfdfff" }]}
                    source={starIcon}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
