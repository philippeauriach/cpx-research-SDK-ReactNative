import { StyleSheet } from "react-native";

const clockIconSize = 18;
const starIconSize = 22;

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    flexDirection: "column",
    height: 124,
    justifyContent: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      height: 2,
      width: 2
    },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    width: 150,
  },
  cardsWrapper: {
    paddingBottom: 20,
    paddingTop: 10,
    width: "100%",
  },
  clockIcon: {
    height: clockIconSize,
    marginRight: 5,
    resizeMode: "contain",
    tintColor: "#3ed5c9",
    width: clockIconSize,
  },
  currency: {
    color: "#3ed5c9",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: -2,
  },
  payout: {
    color: "#3ed5c9",
    fontSize: 24,
    fontWeight: "800"
  },
  star: {
    height: starIconSize,
    marginHorizontal: -1,
    resizeMode: "contain",
    width: starIconSize
  },
  starsWrapper: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    overflow: "scroll"
  },
  timeNeededText: {
    fontSize: 14,
  },
  timeNeededWrapper: {
    alignItems: "center",
    flexDirection: "row"
  },
  wrapper: {
    alignItems: "center",
    flexDirection: "row",
    height: 154,
    width: "100%",
  }
});

export default styles;
