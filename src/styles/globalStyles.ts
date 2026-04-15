import { colors } from "@/theme/colors";
import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
  },
  
  containerCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Text styles with Karla font
  text: {
    fontFamily: "Karla_400Regular",
    color: colors.text,
    fontSize: 16,
  },
  
  textMedium: {
    fontFamily: "Karla_500Medium",
    color: colors.text,
    fontSize: 16,
  },
  
  textSemiBold: {
    fontFamily: "Karla_600SemiBold",
    color: colors.text,
    fontSize: 16,
  },
  
  textBold: {
    fontFamily: "Karla_700Bold",
    color: colors.text,
    fontSize: 16,
  },
  
  textExtraBold: {
    fontFamily: "Karla_800ExtraBold",
    color: colors.text,
    fontSize: 16,
  },
  
  // Headings with Karla
  h1: {
    fontFamily: "Karla_700Bold",
    fontSize: 32,
    color: colors.text,
  },
  
  h2: {
    fontFamily: "Karla_600SemiBold",
    fontSize: 24,
    color: colors.text,
  },
  
  h3: {
    fontFamily: "Karla_500Medium",
    fontSize: 20,
    color: colors.text,
  },
  
  // Text sizes
  textLarge: {
    fontFamily: "Karla_400Regular",
    fontSize: 24,
    color: colors.text,
  },
  
  textSmall: {
    fontFamily: "Karla_400Regular",
    fontSize: 14,
    color: colors.text,
  },
  
  textSecondary: {
    fontFamily: "Karla_400Regular",
    color: colors.text,
    fontSize: 16,
    opacity: 0.7,
  },
});