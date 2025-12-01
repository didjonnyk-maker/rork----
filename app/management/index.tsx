import { useRouter } from "expo-router";
import {
  AlertCircle,
  BarChart3,
  Banknote,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Plus,
  Repeat,
  Star,
  Trash2,
  User as UserIcon,
  Zap,
  XCircle,
  CheckCircle,
} from "lucide-react-native";
import { useMemo } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { SHIFT_CANCEL_PENALTY } from "@/types";

export default function ManagementScreen() {
  const router = useRouter();
  const { currentUser, shifts, logout, getUnfilledShiftsWarning, deleteShift, updateShift, approveCancellation } = useApp();

  const unfilledCount = getUnfilledShiftsWarning();

  const sortedShifts = useMemo(() => {
    return [...shifts].sort((a, b) => {
      const dateA = new Date(a.date + " " + a.startTime);
      const dateB = new Date(b.date + " " + b.startTime);
      return dateB.getTime() - dateA.getTime();
    });
  }, [shifts]);

  const handleLogout = async () => {
    await logout();
    router.dismissAll();
    router.replace("/");
  };

  const handleDeleteShift = (shiftId: string) => {
    if (Platform.OS === "web") {
      if (confirm("Вы уверены, что хотите удалить эту смену?")) {
        deleteShift(shiftId);
      }
    } else {
      Alert.alert(
        "Удаление смены",
        "Вы уверены, что хотите удалить эту смену?",
        [
          { text: "Отмена", style: "cancel" },
          { text: "Удалить", style: "destructive", onPress: () => deleteShift(shiftId) },
        ]
      );
    }
  };

  const handleToggleUrgent = (shiftId: string, currentUrgent?: boolean) => {
    updateShift(shiftId, { isUrgent: !currentUrgent });
  };

  const handleApproveCancellation = (shiftId: string, withPenalty: boolean) => {
    const penaltyAmount = SHIFT_CANCEL_PENALTY;
    const msg = withPenalty 
      ? `Подтвердить отмену и наложить штраф ${penaltyAmount} сом?`
      : "Подтвердить отмену без штрафа?";
      
    if (Platform.OS === "web") {
      if (confirm(msg)) {
        approveCancellation(shiftId, withPenalty);
      }
    } else {
      Alert.alert(
        "Подтверждение отмены",
        msg,
        [
          { text: "Отмена", style: "cancel" },
          { 
            text: "Подтвердить", 
            onPress: () => approveCancellation(shiftId, withPenalty),
            style: withPenalty ? "destructive" : "default"
          },
        ]
      );
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

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Все смены</Text>
        <View style={styles.listHeaderButtons}>
          <TouchableOpacity
            style={styles.templateButton}
            onPress={() => router.push("/management/shift-templates" as never)}
          >
            <Repeat size={18} color="#2563EB" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/management/add-shift" as never)}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Добавить</Text>
          </TouchableOpacity>
        </View>
      </View>

      {sortedShifts.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={48} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Нет смен</Text>
          <Text style={styles.emptySubtitle}>
            Добавьте первую смену, чтобы начать управление расписанием
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedShifts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.shiftCard, item.isUrgent && styles.shiftCardUrgent]}>
              <View style={styles.shiftHeader}>
                <View style={styles.dateSection}>
                  <Calendar size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.shiftDate}>{formatDate(item.date)}</Text>
                  {item.isUrgent && (
                    <View style={styles.urgentBadge}>
                      <Zap size={12} color="#FFFFFF" strokeWidth={2} fill="#FFFFFF" />
                      <Text style={styles.urgentText}>Срочно</Text>
                    </View>
                  )}
                  {item.cancellationRequested && (
                    <View style={styles.cancellationBadge}>
                      <XCircle size={12} color="#DC2626" strokeWidth={2} />
                      <Text style={styles.cancellationText}>Запрос отмены</Text>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === "Свободно"
                      ? styles.statusBadgeFree
                      : styles.statusBadgeBooked,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.status === "Свободно"
                        ? styles.statusTextFree
                        : styles.statusTextBooked,
                    ]}
                  >
                    {item.status}
                  </Text>
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

                {item.employeeName && (
                  <View style={styles.employeeInfo}>
                    <Text style={styles.employeeLabel}>Сотрудник:</Text>
                    <Text style={styles.employeeName}>{item.employeeName}</Text>
                  </View>
                )}
              </View>

              <View style={styles.shiftActions}>
                {item.cancellationRequested && currentUser?.position === "Директор" ? (
                  <View style={styles.cancellationActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approvePenaltyButton]}
                      onPress={() => handleApproveCancellation(item.id, true)}
                    >
                      <Banknote size={16} color="#DC2626" strokeWidth={2} />
                      <Text style={[styles.actionButtonText, { color: "#DC2626" }]}>Отмена + Штраф</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApproveCancellation(item.id, false)}
                    >
                      <CheckCircle size={16} color="#15803D" strokeWidth={2} />
                      <Text style={[styles.actionButtonText, { color: "#15803D" }]}>Отмена (без штрафа)</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.urgentButton, item.isUrgent && styles.urgentButtonActive]}
                      onPress={() => handleToggleUrgent(item.id, item.isUrgent)}
                    >
                      <Zap size={16} color={item.isUrgent ? "#FFFFFF" : "#F59E0B"} strokeWidth={2} />
                      <Text style={[styles.actionButtonText, item.isUrgent ? { color: "#FFFFFF" } : { color: "#F59E0B" }]}>
                        {item.isUrgent ? "Срочно!" : "Срочно"}
                      </Text>
                    </TouchableOpacity>
    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteShift(item.id)}
                    >
                      <Trash2 size={16} color="#DC2626" strokeWidth={2} />
                      <Text style={[styles.actionButtonText, { color: "#DC2626" }]}>Удалить</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
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
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
  },
  listHeaderButtons: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  templateButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
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
  shiftCardUrgent: {
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBEB",
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
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeFree: {
    backgroundColor: "#DBEAFE",
  },
  statusBadgeBooked: {
    backgroundColor: "#DCFCE7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  statusTextFree: {
    color: "#1E40AF",
  },
  statusTextBooked: {
    color: "#15803D",
  },
  cancellationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancellationText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#DC2626",
  },
  cancellationActions: {
    flexDirection: "row",
    gap: 8,
  },
  approvePenaltyButton: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  approveButton: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  shiftInfo: {
    gap: 8,
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
  employeeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  employeeLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  employeeName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#2563EB",
  },
  shiftActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  urgentButton: {
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBEB",
  },
  urgentButtonActive: {
    backgroundColor: "#F59E0B",
    borderColor: "#F59E0B",
  },
  deleteButton: {
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
