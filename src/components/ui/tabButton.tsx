import { globalStyles } from "@/styles/globalStyles";
import { colors } from "@/theme/colors";
import { TabTriggerSlotProps } from "expo-router/ui";
import { Pressable, Text } from "react-native";

export type TabButtonProps = TabTriggerSlotProps & {
  icon: React.ComponentType<{ color: string; size?: number }>;
};

export function TabButton({
  icon: Icon,
  children,
  isFocused,
  ...props
}: TabButtonProps) {
  return (
    <Pressable
      {...props}
      style={{
        alignItems: "center",
        gap: 5,
      }}
    >
      <Icon color={isFocused ? colors.primary : colors.secondary} size={20} />
      <Text style={{ color: isFocused ? colors.primary : colors.secondary, fontSize: 13, fontFamily: globalStyles.text.fontFamily }}>
        {children}
      </Text>
    </Pressable>
  );
}
