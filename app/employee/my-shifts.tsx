import { useRouter } from "expo-router";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  LogOut,
  MapPin,
  Navigation,
  User as UserIcon,
  Zap,
  XCircle,
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
import { Shift, SHIFT_CANCEL_PENALTY } from "@/types";

export default function MyShiftsScreen() {
  const router = useRouter();
  const { currentUser, getEmployeeShifts, markArrival, closeShift, updateShift, getEmployeeIncompleteTasks, canCloseShift, requestShiftCancellation } = useApp();

  const myShifts = useMemo(() => {
    if (!currentUser) return [];
    return getEmployeeShifts(currentUser.id).sort((a, b) => {
      const dateA = new Date(a.date + " " + a.startTime);
      const dateB = new Date(b.date + " " + b.startTime);
      return dateA.getTime() - dateB.getTime();
    });
  }, [currentUser, getEmployeeShifts]);

  const incompleteTasks = useMemo(() => {
    if (!currentUser) return [];
    return getEmployeeIncompleteTasks(currentUser.id);
  }, [currentUser, getEmployeeIncompleteTasks]);

  const canMarkOnWay = (shift: Shift) => {
    if (shift.status !== "Забронировано" || shift.arrivedAt) return false;
    if (shift.employeeStatus === "В пути") return false;
    const now = new Date();
    const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
    const diffMinutes = Math.floor((shiftStart.getTime() - now.getTime()) / 60000);
    // Allow marking "On Way" up to 2 hours before shift.
    // User requested to just be able to press it.
    return diffMinutes <= 120;
  };

  const canMarkArrival = (shift: Shift) => {
    if (shift.status !== "Забронировано") return false;
    const now = new Date();
    const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
    const diffMinutes = Math.floor((now.getTime() - shiftStart.getTime()) / 60000);
    return diffMinutes >= -30;
  };

  const isShiftLate = (shift: Shift) => {
    if (shift.status !== "Забронировано" || shift.arrivedAt) return false;
    const now = new Date();
    const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
    return now > shiftStart;
  };

  const isShiftWarning = (shift: Shift) => {
    if (shift.status !== "Забронировано" || shift.arrivedAt) return false;
    const now = new Date();
    const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
    const diffMinutes = Math.floor((shiftStart.getTime() - now.getTime()) / 60000);
    return diffMinutes <= 15 && diffMinutes > 0;
  };

  const handleMarkOnWay = (shiftId: string) => {
    updateShift(shiftId, { employeeStatus: "В пути" });
    const msg = "Вы отметились, что едете на смену!";
    if (Platform.OS === "web") {
      alert(msg);
    } else {
      Alert.alert("Успешно", msg);
    }
  };

  const handleMarkArrival = (shiftId: string) => {
    markArrival(shiftId);
    const msg = "Вы отметились на смене!";
    if (Platform.OS === "web") {
      alert(msg);
    } else {
      Alert.alert("Успешно", msg);
    }
  };

  const handleCancelShift = (shiftId: string) => {
    const penaltyAmount = SHIFT_CANCEL_PENALTY;
    const msg = `Вы уверены, что хотите отменить смену?\n\nВнимание: За отмену смены предусмотрен штраф в размере ${penaltyAmount} сом.\n\nВаш запрос будет отправлен директору на согласование.`;

    const confirmCancel = () => {
      requestShiftCancellation(shiftId);
      const successMsg = "Запрос на отмену отправлен. Ожидайте решения директора.";
      if (Platform.OS === "web") {
        alert(successMsg);
      } else {
        Alert.alert("Запрос отправлен", successMsg);
      }
    };

    if (Platform.OS === "web") {
      if (confirm(msg)) {
        confirmCancel();
      }
    } else {
      Alert.alert(
        "Отмена смены",
        msg,
        [
          { text: "Не отменять", style: "cancel" },
          { text: "Согласен на штраф", style: "destructive", onPress: confirmCancel },
        ]
      );
    }
  };

  const handleCloseShift = (shiftId: string) => {
    if (!currentUser) return;
    
    if (!canCloseShift(shiftId, currentUser.id)) {
      const msg = "Завершите все задания перед закрытием смены";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Невозможно закрыть", msg);
      }
      return;
    }

    const confirmClose = () => {
      closeShift(shiftId);
      if (currentUser.position === "Кассир") {
        const reportMsg = "Смена закрыта. Не забудьте заполнить отчёт!";
        if (Platform.OS === "web") {
          alert(reportMsg);
        } else {
          Alert.alert("Смена закрыта", "Не забудьте заполнить отчёт!", [
            { text: "Позже", style: "cancel" },
            { text: "Заполнить", onPress: () => router.push("/employee/report" as never) },
          ]);
        }
      } else {
        const msg = "Смена успешно закрыта!";
        if (Platform.OS === "web") {
          alert(msg);
        } else {
          Alert.alert("Успешно", msg);
        }
      }
    };

    if (Platform.OS === "web") {
      if (confirm("Вы уверены, что хотите закрыть смену?")) {
        confirmClose();
      }
    } else {
      Alert.alert(
        "Закрыть смену?",
        "Подтвердите завершение смены",
        [
          { text: "Отмена", style: "cancel" },
          { text: "Закрыть", onPress: confirmClose },
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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {myShifts.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={48} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Нет забронированных смен</Text>
          <Text style={styles.emptySubtitle}>
            Забронируйте смены в разделе доступных смен
          </Text>
        </View>
      ) : (
        <FlatList
          data={myShifts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isLate = isShiftLate(item);
            const isWarning = isShiftWarning(item);
            const canArrive = canMarkArrival(item);
            const isWorking = item.status === "В работе";

            return (
              <View
                style={[
                  styles.shiftCard,
                  isLate && styles.shiftCardLate,
                  isWarning && styles.shiftCardWarning,
                  isWorking && styles.shiftCardWorking,
                ]}
              >
                <View style={styles.shiftHeader}>
                  <View style={styles.dateSection}>
                    <Calendar size={16} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.shiftDate}>{formatDate(item.date)}</Text>
                    {item.isUrgent && (
                      <View style={styles.urgentBadge}>
                        <Zap size={10} color="#FFFFFF" strokeWidth={2} fill="#FFFFFF" />
                        <Text style={styles.urgentText}>Срочно</Text>
                      </View>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === "В работе" && styles.statusBadgeWorking,
                      item.status === "Закрыто" && styles.statusBadgeClosed,
                      isLate && styles.statusBadgeLate,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        item.status === "В работе" && styles.statusBadgeTextWorking,
                        item.status === "Закрыто" && styles.statusBadgeTextClosed,
                        isLate && styles.statusBadgeTextLate,
                      ]}
                    >
                      {isLate ? "Опоздание!" : item.status}
                    </Text>
                  </View>
                  {item.cancellationRequested && (
                    <View style={styles.cancellationBadge}>
                       <XCircle size={14} color="#DC2626" strokeWidth={2} />
                       <Text style={styles.cancellationText}>Запрошена отмена</Text>
                    </View>
                  )}
                </View>

                {isWarning && (
                  <View style={styles.warningBanner}>
                    <AlertCircle size={14} color="#F59E0B" strokeWidth={2} />
                    <Text style={styles.warningText}>
                      Смена начнётся менее чем через 15 мин!
                    </Text>
                  </View>
                )}

                {isLate && (
                  <View style={styles.lateBanner}>
                    <AlertCircle size={14} color="#DC2626" strokeWidth={2} />
                    <Text style={styles.lateText}>
                      Смена уже началась! Отметьтесь срочно.
                    </Text>
                  </View>
                )}

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

                  {item.arrivedAt && (
                    <View style={styles.arrivedRow}>
                      <CheckCircle size={16} color="#15803D" strokeWidth={2} />
                      <Text style={styles.arrivedText}>
                        На месте с {new Date(item.arrivedAt).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  )}
                </View>

                {item.status === "Забронировано" && !item.arrivedAt && !item.cancellationRequested && !isLate && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelShift(item.id)}
                  >
                    <XCircle size={18} color="#DC2626" strokeWidth={2} />
                    <Text style={styles.cancelButtonText}>Отменить смену</Text>
                  </TouchableOpacity>
                )}

                {canMarkOnWay(item) && !item.arrivedAt && !item.cancellationRequested && (
                  <TouchableOpacity
                    style={styles.onWayButton}
                    onPress={() => handleMarkOnWay(item.id)}
                  >
                    <Navigation size={18} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.onWayButtonText}>Еду на смену</Text>
                  </TouchableOpacity>
                )}

                {canArrive && !item.arrivedAt && (
                  <TouchableOpacity
                    style={styles.arrivalButton}
                    onPress={() => handleMarkArrival(item.id)}
                  >
                    <MapPin size={18} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.arrivalButtonText}>Я на работе</Text>
                  </TouchableOpacity>
                )}

                {isWorking && incompleteTasks.length > 0 && (
                  <View style={styles.taskWarning}>
                    <AlertCircle size={14} color="#F59E0B" strokeWidth={2} />
                    <Text style={styles.taskWarningText}>
                      У вас {incompleteTasks.length} незавершённых заданий
                    </Text>
                  </View>
                )}

                {isWorking && (
                  <TouchableOpacity
                    style={[
                      styles.closeShiftButton,
                      incompleteTasks.length > 0 && styles.closeShiftButtonDisabled,
                    ]}
                    onPress={() => handleCloseShift(item.id)}
                  >
                    <LogOut size={18} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.closeShiftButtonText}>Закрыть смену</Text>
                  </TouchableOpacity>
                )}

                {item.employeeStatus === "В пути" && !item.arrivedAt && (
                  <View style={styles.onWayBadge}>
                    <Navigation size={14} color="#2563EB" strokeWidth={2} />
                    <Text style={styles.onWayBadgeText}>Вы в пути</Text>
                  </View>
                )}
              </View>
            );
          }}
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
    textAlign: "center" as const,
    marginTop: 8,
  },
  list: {
    padding: 20,
  },
  shiftCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  shiftCardLate: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  shiftCardWarning: {
    borderColor: "#FDE68A",
    backgroundColor: "#FFFBEB",
  },
  shiftCardWorking: {
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
  },
  shiftHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dateSection: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
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
    backgroundColor: "#DBEAFE",
  },
  statusBadgeWorking: {
    backgroundColor: "#DCFCE7",
  },
  statusBadgeClosed: {
    backgroundColor: "#F3F4F6",
  },
  statusBadgeLate: {
    backgroundColor: "#FEE2E2",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#1E40AF",
  },
  statusBadgeTextWorking: {
    color: "#15803D",
  },
  statusBadgeTextClosed: {
    color: "#6B7280",
  },
  statusBadgeTextLate: {
    color: "#DC2626",
  },
  warningBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 13,
    color: "#92400E",
    fontWeight: "500" as const,
  },
  lateBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  lateText: {
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "500" as const,
  },
  shiftInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
  },
  arrivedRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginTop: 4,
  },
  arrivedText: {
    fontSize: 14,
    color: "#15803D",
    fontWeight: "500" as const,
  },
  arrivalButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: "#15803D",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
  },
  arrivalButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  taskWarning: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  taskWarningText: {
    fontSize: 13,
    color: "#92400E",
    fontWeight: "500" as const,
  },
  onWayButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
  },
  onWayButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  closeShiftButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
  },
  closeShiftButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  cancellationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  cancellationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DC2626",
  },
  closeShiftButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  onWayBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  onWayBadgeText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "500" as const,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
