import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    flexDirection: "column",
    marginHorizontal: 5,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      height: 2,
      width: 2
    },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    width: 150,
  },
  cardWrapper: {
    flexDirection: "row",
    justifyContent: "center"
  },
  currency: {
    color: "#3ed5c9",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: -2,
  },
  payout: {
    color: "#3ed5c9",
    fontSize: 24,
    fontWeight: "800"
  }
});

export default styles;
