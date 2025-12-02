import { useRouter } from "expo-router";
import {
  AlertCircle,
  BarChart3,
  Banknote,
  BookOpen,
  Calendar,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Star,
} from "lucide-react-native";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";

export default function ManagementScreen() {
  const router = useRouter();
  const { currentUser, shifts, logout, getUnfilledShiftsWarning } = useApp();

  const unfilledCount = getUnfilledShiftsWarning();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Управление сменами</Text>
          <Text style={styles.headerSubtitle}>{currentUser?.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {unfilledCount !== null && unfilledCount > 0 && (
        <View style={styles.warning}>
          <AlertCircle size={20} color="#F59E0B" strokeWidth={2} />
          <Text style={styles.warningText}>
            Внимание! Есть {unfilledCount} незаполненных смен в ближайшие 3 дня
          </Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{shifts.length}</Text>
          <Text style={styles.statLabel}>Всего смен</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {shifts.filter((s) => s.status === "Свободно").length}
          </Text>
          <Text style={styles.statLabel}>Свободно</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {shifts.filter((s) => s.status === "Забронировано").length}
          </Text>
          <Text style={styles.statLabel}>Забронировано</Text>
        </View>
      </View>

      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionGridButton}
          onPress={() => router.push("/management/dashboard" as never)}
        >
          <LayoutDashboard size={22} color="#2563EB" strokeWidth={2} />
          <Text style={styles.actionGridText}>Мониторинг</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionGridButton}
          onPress={() => router.push("/management/all-shifts" as never)}
        >
          <Calendar size={22} color="#2563EB" strokeWidth={2} />
          <Text style={styles.actionGridText}>Все смены</Text>
        </TouchableOpacity>
        {currentUser?.position === "Директор" && (
          <TouchableOpacity
            style={styles.actionGridButton}
            onPress={() => router.push("/management/finance" as never)}
          >
            <Banknote size={22} color="#2563EB" strokeWidth={2} />
            <Text style={styles.actionGridText}>Финансы</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionGridButton}
          onPress={() => router.push("/management/kpi" as never)}
        >
          <BarChart3 size={22} color="#2563EB" strokeWidth={2} />
          <Text style={styles.actionGridText}>KPI</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionGridButton}
          onPress={() => router.push("/management/tasks" as never)}
        >
          <ClipboardList size={22} color="#2563EB" strokeWidth={2} />
          <Text style={styles.actionGridText}>Задания</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionGridButton}
          onPress={() => router.push("/management/history" as never)}
        >
          <History size={22} color="#2563EB" strokeWidth={2} />
          <Text style={styles.actionGridText}>История</Text>
        </TouchableOpacity>
        {currentUser?.position === "Директор" && (
          <TouchableOpacity
            style={styles.actionGridButton}
            onPress={() => router.push("/management/materials" as never)}
          >
            <BookOpen size={22} color="#2563EB" strokeWidth={2} />
            <Text style={styles.actionGridText}>Материалы</Text>
          </TouchableOpacity>
        )}
        {currentUser?.position === "Директор" && (
          <TouchableOpacity
            style={styles.actionGridButton}
            onPress={() => router.push("/management/completed-tasks" as never)}
          >
            <Star size={22} color="#2563EB" strokeWidth={2} />
            <Text style={styles.actionGridText}>Проверенные</Text>
          </TouchableOpacity>
        )}
      </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    fontWeight: "500" as const,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#2563EB",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  actionGridButton: {
    flexBasis: "31%" as const,
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  actionGridText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#374151",
    textAlign: "center" as const,
  },
});
