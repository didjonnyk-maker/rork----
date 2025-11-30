import { useRouter } from "expo-router";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  History,
  LogOut,
  User as UserIcon,
} from "lucide-react-native";
import { useMemo } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";

export default function EmployeeScreen() {
  const router = useRouter();
  const {
    currentUser,
    logout,
    getAvailableShiftsForEmployee,
    bookShift,
    getEmployeeShifts,
    calculateEmployeeSalary,
  } = useApp();

  const currentPeriod = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }, []);

  const salaryInfo = useMemo(() => {
    if (!currentUser) return null;
    return calculateEmployeeSalary(currentUser.id, currentPeriod.start, currentPeriod.end);
  }, [currentUser, currentPeriod, calculateEmployeeSalary]);

  const availableShifts = useMemo(
    () =>
      currentUser
        ? getAvailableShiftsForEmployee(currentUser.position).sort((a, b) => {
            const dateA = new Date(a.date + " " + a.startTime);
            const dateB = new Date(b.date + " " + b.startTime);
            return dateA.getTime() - dateB.getTime();
          })
        : [],
    [currentUser, getAvailableShiftsForEmployee]
  );

  const myShifts = useMemo(
    () => (currentUser ? getEmployeeShifts(currentUser.id) : []),
    [currentUser, getEmployeeShifts]
  );

  const handleLogout = () => {
    logout();
    router.replace("/" as never);
  };

  const handleBookShift = (shiftId: string) => {
    if (!currentUser) return;

    bookShift(shiftId, currentUser.id, currentUser.name);

    if (Platform.OS === "web") {
      alert("Смена успешно забронирована!");
    } else {
      Alert.alert("Успешно", "Смена успешно забронирована!");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Доступные смены</Text>
          <Text style={styles.headerSubtitle}>
            {currentUser?.name} • {currentUser?.position}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {salaryInfo && (
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Баланс за {new Date().toLocaleDateString("ru-RU", { month: "long" })}</Text>
            <Text style={styles.balanceAmount}>{salaryInfo.totalPayout.toFixed(0)} с</Text>
          </View>
          <View style={styles.balanceDetails}>
             <Text style={styles.balanceDetailText}>Отработано: {salaryInfo.hoursWorked.toFixed(1)} ч</Text>
             {salaryInfo.advances > 0 && <Text style={styles.balanceDetailTextWarning}>Авансы: -{salaryInfo.advances} с</Text>}
             {salaryInfo.penalties > 0 && <Text style={styles.balanceDetailTextWarning}>Штрафы: -{salaryInfo.penalties} с</Text>}
          </View>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/employee/my-shifts" as never)}
        >
          <Calendar size={20} color="#2563EB" strokeWidth={2} />
          <Text style={styles.actionButtonText}>Мои смены ({myShifts.length})</Text>
        </TouchableOpacity>

        {currentUser?.position === "Кассир" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/employee/report" as never)}
          >
            <FileText size={20} color="#2563EB" strokeWidth={2} />
            <Text style={styles.actionButtonText}>Отчёт</Text>
          </TouchableOpacity>
        )}

        {currentUser?.position === "Кассир" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/employee/report-history" as never)}
          >
            <History size={20} color="#2563EB" strokeWidth={2} />
            <Text style={styles.actionButtonText}>История</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/employee/tasks" as never)}
        >
          <ClipboardList size={20} color="#2563EB" strokeWidth={2} />
          <Text style={styles.actionButtonText}>Задания</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/employee/training" as never)}
        >
          <BookOpen size={20} color="#2563EB" strokeWidth={2} />
          <Text style={styles.actionButtonText}>Обучение</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Свободные смены</Text>
        <Text style={styles.sectionSubtitle}>
          Доступно: {availableShifts.length}
        </Text>
      </View>

      {availableShifts.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={48} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Нет доступных смен</Text>
          <Text style={styles.emptySubtitle}>
            Пока нет свободных смен для вашей должности
          </Text>
        </View>
      ) : (
        <FlatList
          data={availableShifts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.shiftCard}>
              <View style={styles.shiftHeader}>
                <View style={styles.dateSection}>
                  <Calendar size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.shiftDate}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>Свободно</Text>
                </View>
              </View>

              <View style={styles.shiftInfo}>
                <View style={styles.infoRow}>
                  <Clock size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.infoText}>
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <UserIcon size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.infoText}>{item.position}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleBookShift(item.id)}
              >
                <Text style={styles.bookButtonText}>Забронировать</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: "#1E40AF",
    borderRadius: 16,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    color: "#BFDBFE",
    fontSize: 14,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  balanceAmount: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  balanceDetails: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  balanceDetailText: {
    color: "#DBEAFE",
    fontSize: 12,
  },
  balanceDetailTextWarning: {
    color: "#FCA5A5",
    fontSize: 12,
  },
  logoutButton: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#2563EB",
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#6B7280",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  shiftCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  shiftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dateSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
  },
  freeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#DCFCE7",
  },
  freeBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#15803D",
  },
  shiftInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
  },
  bookButton: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
