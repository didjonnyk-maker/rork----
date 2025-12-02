import { useRouter } from "expo-router";
import {
  ArrowLeft,
  DollarSign,
  Save,
  Search,
  User,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { DEFAULT_HOURLY_RATE } from "@/types";

export default function EmployeesScreen() {
  const router = useRouter();
  const { users, updateUser, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (u.role === "Учредитель") return false;
      // Filter by market if director? Or Director sees all?
      // Usually Director manages their market, but user said "Director sets rate for employees".
      // Let's assume Director sees employees of their market or all if no market set.
      if (currentUser?.marketId && u.marketId && u.marketId !== currentUser.marketId) {
          // Check if employee is Universal/etc. who might work in multiple?
          // For now restrict to market match if both have marketId
          return false;
      }

      return (
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [users, searchQuery, currentUser]);

  const handleEditRate = (userId: string, currentRate: number) => {
    setEditingUserId(userId);
    setEditingRate(currentRate.toString());
  };

  const handleSaveRate = (userId: string) => {
    const rate = parseFloat(editingRate);
    if (isNaN(rate) || rate < 0) {
      const msg = "Введите корректную ставку";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }

    updateUser(userId, { hourlyRate: rate });
    setEditingUserId(null);
    setEditingRate("");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Сотрудники и ставки</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Поиск сотрудника..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.employeeCard}>
              <View style={styles.employeeInfo}>
                <View style={styles.avatarContainer}>
                  <User size={20} color="#6B7280" strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.employeeName}>{item.name}</Text>
                  <Text style={styles.employeeRole}>{item.position}</Text>
                </View>
              </View>

              <View style={styles.rateContainer}>
                {editingUserId === item.id ? (
                  <View style={styles.editRateContainer}>
                    <TextInput
                      style={styles.rateInput}
                      value={editingRate}
                      onChangeText={setEditingRate}
                      keyboardType="numeric"
                      autoFocus
                    />
                    <TouchableOpacity
                      style={styles.saveRateButton}
                      onPress={() => handleSaveRate(item.id)}
                    >
                      <Save size={16} color="#FFFFFF" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.rateDisplay}
                    onPress={() => handleEditRate(item.id, item.hourlyRate || DEFAULT_HOURLY_RATE)}
                  >
                    <DollarSign size={14} color="#2563EB" strokeWidth={2} />
                    <Text style={styles.rateText}>
                      {item.hourlyRate || DEFAULT_HOURLY_RATE} с/ч
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  employeeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  employeeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  employeeName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  employeeRole: {
    fontSize: 13,
    color: "#6B7280",
  },
  rateContainer: {
    minWidth: 100,
    alignItems: "flex-end",
  },
  rateDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  rateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  editRateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rateInput: {
    width: 70,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 8,
    fontSize: 14,
    color: "#111827",
    textAlign: "center",
  },
  saveRateButton: {
    backgroundColor: "#15803D",
    padding: 8,
    borderRadius: 8,
  },
});
