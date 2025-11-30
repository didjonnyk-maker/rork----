import { useRouter } from "expo-router";
import { User, UserPlus, Briefcase, Shield } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { 
  Position, 
  UserRole, 
  EMPLOYEE_POSITIONS, 
  ADMIN_POSITIONS, 
  ROLE_BY_POSITION,
  DEFAULT_HOURLY_RATE 
} from "@/types";

type RoleCategory = "employee" | "admin";

export default function LoginScreen() {
  const router = useRouter();
  const { currentUser, isLoading, login, addUser } = useApp();
  const [name, setName] = useState("");
  const [roleCategory, setRoleCategory] = useState<RoleCategory>("employee");
  const [selectedPosition, setSelectedPosition] = useState<Position>("Кассир");

  const availablePositions = roleCategory === "employee" ? EMPLOYEE_POSITIONS : ADMIN_POSITIONS;

  useEffect(() => {
    if (roleCategory === "employee") {
      setSelectedPosition("Кассир");
    } else {
      setSelectedPosition("Операционист-кассир");
    }
  }, [roleCategory]);

  useEffect(() => {
    if (!isLoading && currentUser) {
      const role = currentUser.role;
      if (role === "Директор" || role === "Администратор") {
        router.replace("/management/" as never);
      } else if (role === "Операционист") {
        router.replace("/operator/" as never);
      } else {
        router.replace("/employee/" as never);
      }
    }
  }, [currentUser, isLoading, router]);

  const handleLogin = () => {
    if (!name.trim()) {
      return;
    }

    const role: UserRole = ROLE_BY_POSITION[selectedPosition];

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      role,
      position: selectedPosition,
      hourlyRate: DEFAULT_HOURLY_RATE,
      kpiCoefficient: 1.0,
      balance: 0,
    };

    addUser(newUser);
    login(newUser);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <UserPlus size={48} color="#2563EB" strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>Табель</Text>
          <Text style={styles.subtitle}>
            Система учёта рабочего времени и отчётности
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ваше имя</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Введите ваше имя"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Категория</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  roleCategory === "employee" && styles.roleButtonActive,
                ]}
                onPress={() => setRoleCategory("employee")}
              >
                <User
                  size={20}
                  color={roleCategory === "employee" ? "#FFFFFF" : "#6B7280"}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    roleCategory === "employee" && styles.roleButtonTextActive,
                  ]}
                >
                  Сотрудник
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  roleCategory === "admin" && styles.roleButtonActive,
                ]}
                onPress={() => setRoleCategory("admin")}
              >
                <Shield
                  size={20}
                  color={roleCategory === "admin" ? "#FFFFFF" : "#6B7280"}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    roleCategory === "admin" && styles.roleButtonTextActive,
                  ]}
                >
                  Администрация
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Должность</Text>
            <View style={styles.positionsGrid}>
              {availablePositions.map((pos) => (
                <TouchableOpacity
                  key={pos}
                  style={[
                    styles.positionButton,
                    selectedPosition === pos && styles.positionButtonActive,
                  ]}
                  onPress={() => setSelectedPosition(pos)}
                >
                  <Text
                    style={[
                      styles.positionButtonText,
                      selectedPosition === pos && styles.positionButtonTextActive,
                    ]}
                  >
                    {pos}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.roleInfoBox}>
            <Briefcase size={16} color="#2563EB" strokeWidth={2} />
            <Text style={styles.roleInfoText}>
              Роль: {ROLE_BY_POSITION[selectedPosition]}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, !name.trim() && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={!name.trim()}
          >
            <Text style={styles.loginButtonText}>Войти</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  roleButtons: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  roleButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  roleButtonTextActive: {
    color: "#FFFFFF",
  },
  positionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  positionButton: {
    flexBasis: "48%" as const,
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  positionButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  positionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
    textAlign: "center" as const,
  },
  positionButtonTextActive: {
    color: "#FFFFFF",
  },
  roleInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
  },
  roleInfoText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#1E40AF",
  },
  loginButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
