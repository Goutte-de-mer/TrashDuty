import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    if (email.trim() === "" || password.trim() === "") {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (loginError: unknown) {
      const message =
        loginError instanceof Error
          ? loginError.message
          : "Connexion échouée. Vérifie tes identifiants.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Bienvenue</Text>
        <Text style={styles.subtitle}>Connecte-toi à TrashDuty.</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="toi@exemple.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Ton mot de passe"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          {error !== null && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(auth)/register")}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>
              Pas encore de compte ? S'inscrire
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  title: {
    color: colors.foreground,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xxl,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.mutedForeground,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    color: colors.foreground,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: colors.foreground,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.md,
  },
  errorText: {
    color: colors.destructive,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.primaryForeground,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.md,
  },
  linkText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    textAlign: "center",
    marginTop: 8,
  },
});
