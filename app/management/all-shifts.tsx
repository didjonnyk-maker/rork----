import { useRouter } from "expo-router";
import {
  Calendar,
  Clock,
  User as UserIcon,
  Zap,
  XCircle,
  ArrowLeft,
  Trash2,
  Banknote,
  CheckCircle,
} from "lucide-react-native";
import { useMemo, useState } from "react";
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

type FilterType = "all" | "urgent" | "cancelled";

export default function AllShiftsScreen() {
  const router = useRouter();
  const { currentUser, shifts, deleteShift, updateShift, approveCancellation } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredShifts = useMemo(() => {
    let result = [...shifts];
    
    // Sort by date desc
    result.sort((a, b) => {
      const dateA = new Date(a.date + " " + a.startTime);
      const dateB = new Date(b.date + " " + b.startTime);
      return dateB.getTime() - dateA.getTime();
    });

    if (activeFilter === "urgent") {
      result = result.filter(s => s.isUrgent);
    } else if (activeFilter === "cancelled") {
      result = result.filter(s => s.cancellationRequested);
    }

    return result;
  }, [shifts, activeFilter]);

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Все смены</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === "all" && styles.filterChipActive]}
          onPress={() => setActiveFilter("all")}
        >
          <Text style={[styles.filterChipText, activeFilter === "all" && styles.filterChipTextActive]}>Все</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === "urgent" && styles.filterChipActive]}
          onPress={() => setActiveFilter("urgent")}
        >
          <Zap size={14} color={activeFilter === "urgent" ? "#FFFFFF" : "#F59E0B"} strokeWidth={2} />
          <Text style={[styles.filterChipText, activeFilter === "urgent" && styles.filterChipTextActive]}>Срочные</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === "cancelled" && styles.filterChipActive]}
          onPress={() => setActiveFilter("cancelled")}
        >
          <XCircle size={14} color={activeFilter === "cancelled" ? "#FFFFFF" : "#DC2626"} strokeWidth={2} />
          <Text style={[styles.filterChipText, activeFilter === "cancelled" && styles.filterChipTextActive]}>Отмененные</Text>
        </TouchableOpacity>
      </View>

      {filteredShifts.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={48} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Нет смен</Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === "all" 
              ? "Список смен пуст" 
              : activeFilter === "urgent" 
                ? "Нет срочных смен" 
                : "Нет запросов на отмену"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredShifts}
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
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#374151",
  },
  filterChipTextActive: {
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
    paddingVertical: 20,
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
