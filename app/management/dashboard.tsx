import { useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  User as UserIcon,
  XCircle,
} from "lucide-react-native";
import { useMemo, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { Shift, EmployeeStatus } from "@/types";

interface ShiftWithStatus extends Shift {
  calculatedStatus: EmployeeStatus;
  lateMinutes?: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const {
    getUpcomingShifts,
    getCurrentShifts,
    getTomorrowShifts,
    getDayAfterTomorrowShifts,
    getShiftsRequiringArrival,
    getLateShifts,
    getUnfilledShiftsWarning,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedView, setSelectedView] = useState<"today" | "tomorrow" | "after" | "week">("today");
  const [weekOffset, setWeekOffset] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentTime(new Date());
    setTimeout(() => setRefreshing(false), 500);
  };

  const upcomingShifts = useMemo(() => getUpcomingShifts(1), [getUpcomingShifts]);
  const currentShifts = useMemo(() => getCurrentShifts(), [getCurrentShifts]);
  const tomorrowShifts = useMemo(() => getTomorrowShifts(), [getTomorrowShifts]);
  const dayAfterShifts = useMemo(() => getDayAfterTomorrowShifts(), [getDayAfterTomorrowShifts]);
  const warningShifts = useMemo(() => getShiftsRequiringArrival(), [getShiftsRequiringArrival]);
  const lateShifts = useMemo(() => getLateShifts(), [getLateShifts]);
  const unfilledCount = getUnfilledShiftsWarning();

  const shiftsWithStatus: ShiftWithStatus[] = useMemo(() => {
    const now = currentTime;
    return [...currentShifts, ...upcomingShifts].map((shift) => {
      const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
      const diffMinutes = Math.floor((now.getTime() - shiftStart.getTime()) / 60000);

      let calculatedStatus: EmployeeStatus = "Не на смене";
      let lateMinutes: number | undefined;

      if (shift.arrivedAt || shift.status === "В работе" || shift.employeeStatus === "На месте") {
        calculatedStatus = "На месте";
      } else if (diffMinutes > 0) {
        calculatedStatus = "Опаздывает";
        lateMinutes = diffMinutes;
      } else if (shift.employeeStatus === "В пути") {
        calculatedStatus = "В пути";
      } else if (diffMinutes > -60) {
        // Keep them as "Не на смене" but they will be picked up by "upcomingShifts" logic for display
        calculatedStatus = "Не на смене";
      }

      return { ...shift, calculatedStatus, lateMinutes };
    });
  }, [currentShifts, upcomingShifts, currentTime]);

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case "На месте":
        return "#15803D";
      case "В пути":
        return "#2563EB";
      case "Опаздывает":
        return "#DC2626";
      case "Не вышел":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getStatusBgColor = (status: EmployeeStatus) => {
    switch (status) {
      case "На месте":
        return "#DCFCE7";
      case "В пути":
        return "#DBEAFE";
      case "Опаздывает":
        return "#FEE2E2";
      case "Не вышел":
        return "#F3F4F6";
      default:
        return "#F3F4F6";
    }
  };

  const getStatusIcon = (status: EmployeeStatus) => {
    switch (status) {
      case "На месте":
        return <CheckCircle size={14} color="#15803D" strokeWidth={2} />;
      case "В пути":
        return <Navigation size={14} color="#2563EB" strokeWidth={2} />;
      case "Опаздывает":
        return <AlertTriangle size={14} color="#DC2626" strokeWidth={2} />;
      case "Не вышел":
        return <XCircle size={14} color="#6B7280" strokeWidth={2} />;
      default:
        return <Clock size={14} color="#6B7280" strokeWidth={2} />;
    }
  };

  const getWeekDates = () => {
    const dates: { date: Date; dayName: string; shifts: typeof tomorrowShifts }[] = [];
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() + weekOffset * 7);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayShifts = [...currentShifts, ...tomorrowShifts, ...dayAfterShifts].filter(
        (s) => s.date === dateStr
      );
      dates.push({
        date: d,
        dayName: d.toLocaleDateString("ru-RU", { weekday: "short" }),
        shifts: dayShifts,
      });
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const renderShiftCard = (shift: ShiftWithStatus, isWarning: boolean = false) => (
    <View
      key={shift.id}
      style={[
        styles.shiftCard,
        isWarning && styles.shiftCardWarning,
        shift.calculatedStatus === "Опаздывает" && styles.shiftCardLate,
      ]}
    >
      <View style={styles.shiftCardHeader}>
        <View style={styles.employeeRow}>
          <UserIcon size={16} color="#374151" strokeWidth={2} />
          <Text style={styles.employeeName}>{shift.employeeName || "Не назначен"}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(shift.calculatedStatus) }]}>
          {getStatusIcon(shift.calculatedStatus)}
          <Text style={[styles.statusText, { color: getStatusColor(shift.calculatedStatus) }]}>
            {shift.calculatedStatus}
            {shift.lateMinutes ? ` ${shift.lateMinutes} мин` : ""}
          </Text>
        </View>
      </View>
      <View style={styles.shiftCardInfo}>
        <View style={styles.infoItem}>
          <Clock size={14} color="#6B7280" strokeWidth={2} />
          <Text style={styles.infoText}>
            {shift.startTime} - {shift.endTime}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.positionText}>{shift.position}</Text>
        </View>
      </View>
    </View>
  );

  const renderFutureShiftCard = (shift: Shift) => (
    <View key={shift.id} style={styles.futureShiftCard}>
      <View style={styles.futureShiftHeader}>
        <Text style={styles.futureShiftTime}>
          {shift.startTime} - {shift.endTime}
        </Text>
        <Text style={styles.futureShiftPosition}>{shift.position}</Text>
      </View>
      <View style={styles.futureShiftFooter}>
        {shift.employeeName ? (
          <Text style={styles.futureShiftEmployee}>{shift.employeeName}</Text>
        ) : (
          <Text style={styles.futureShiftEmpty}>Свободно</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.collapseButton}
            onPress={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <>
                <Maximize2 size={16} color="#2563EB" strokeWidth={2} />
                <Text style={styles.collapseButtonText}>Развернуть</Text>
              </>
            ) : (
              <>
                <Minimize2 size={16} color="#2563EB" strokeWidth={2} />
                <Text style={styles.collapseButtonText}>Свернуть</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {isCollapsed ? (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <AlertTriangle size={24} color="#DC2626" strokeWidth={2} />
              <Text style={styles.summaryValue}>{lateShifts.length}</Text>
              <Text style={styles.summaryLabel}>Опаздывают</Text>
            </View>
            <View style={styles.summaryCard}>
              <MapPin size={24} color="#15803D" strokeWidth={2} />
              <Text style={styles.summaryValue}>
                {shiftsWithStatus.filter((s) => s.calculatedStatus === "На месте").length}
              </Text>
              <Text style={styles.summaryLabel}>На смене</Text>
            </View>
            <View style={styles.summaryCard}>
              <Clock size={24} color="#2563EB" strokeWidth={2} />
              <Text style={styles.summaryValue}>{upcomingShifts.length}</Text>
              <Text style={styles.summaryLabel}>Скоро</Text>
            </View>
          </View>
        ) : (
          <>
            {unfilledCount !== null && unfilledCount > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => router.push("/management/" as never)}
          >
            <AlertTriangle size={20} color="#DC2626" strokeWidth={2} />
            <Text style={styles.alertText}>
              {unfilledCount} незаполненных смен в ближайшие 3 дня
            </Text>
            <ArrowRight size={18} color="#DC2626" strokeWidth={2} />
          </TouchableOpacity>
        )}

        {lateShifts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <AlertTriangle size={18} color="#DC2626" strokeWidth={2} />
                <Text style={[styles.sectionTitle, { color: "#DC2626" }]}>
                  Опаздывают ({lateShifts.length})
                </Text>
              </View>
            </View>
            {lateShifts.map((shift) => {
              const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
              const lateMinutes = Math.floor(
                (currentTime.getTime() - shiftStart.getTime()) / 60000
              );
              return renderShiftCard(
                {
                  ...shift,
                  calculatedStatus: "Опаздывает",
                  lateMinutes,
                },
                true
              );
            })}
          </View>
        )}

        {warningShifts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Clock size={18} color="#F59E0B" strokeWidth={2} />
                <Text style={[styles.sectionTitle, { color: "#92400E" }]}>
                  Требуется отметка ({warningShifts.length})
                </Text>
              </View>
            </View>
            {warningShifts.map((shift) =>
              renderShiftCard({
                ...shift,
                calculatedStatus: "В пути",
              })
            )}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MapPin size={18} color="#15803D" strokeWidth={2} />
              <Text style={styles.sectionTitle}>
                Сейчас на смене ({shiftsWithStatus.filter((s) => s.calculatedStatus === "На месте").length})
              </Text>
            </View>
          </View>
          {shiftsWithStatus
            .filter((s) => s.calculatedStatus === "На месте")
            .map((shift) => renderShiftCard(shift))}
          {shiftsWithStatus.filter((s) => s.calculatedStatus === "На месте").length === 0 && (
            <Text style={styles.emptyText}>Нет сотрудников на смене</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Clock size={18} color="#2563EB" strokeWidth={2} />
              <Text style={styles.sectionTitle}>
                Прибудут в течение часа ({upcomingShifts.length})
              </Text>
            </View>
          </View>
          {upcomingShifts
            .map((shift) => {
              const s = shiftsWithStatus.find(sw => sw.id === shift.id);
              return renderShiftCard(s || { ...shift, calculatedStatus: shift.employeeStatus || "Не на смене" });
            })}
          {upcomingShifts.length === 0 && (
            <Text style={styles.emptyText}>Нет запланированных смен</Text>
          )}
        </View>

        <View style={styles.viewSelector}>
          <TouchableOpacity
            style={[styles.viewTab, selectedView === "today" && styles.viewTabActive]}
            onPress={() => setSelectedView("today")}
          >
            <Text style={[styles.viewTabText, selectedView === "today" && styles.viewTabTextActive]}>
              Сегодня
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewTab, selectedView === "tomorrow" && styles.viewTabActive]}
            onPress={() => setSelectedView("tomorrow")}
          >
            <Text style={[styles.viewTabText, selectedView === "tomorrow" && styles.viewTabTextActive]}>
              Завтра
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewTab, selectedView === "after" && styles.viewTabActive]}
            onPress={() => setSelectedView("after")}
          >
            <Text style={[styles.viewTabText, selectedView === "after" && styles.viewTabTextActive]}>
              Послезавтра
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewTab, selectedView === "week" && styles.viewTabActive]}
            onPress={() => setSelectedView("week")}
          >
            <Text style={[styles.viewTabText, selectedView === "week" && styles.viewTabTextActive]}>
              Неделя
            </Text>
          </TouchableOpacity>
        </View>

        {selectedView === "week" && (
          <View style={styles.weekNavigation}>
            <TouchableOpacity
              style={styles.weekNavButton}
              onPress={() => setWeekOffset(weekOffset - 1)}
            >
              <ChevronLeft size={20} color="#2563EB" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.weekLabel}>
              {weekDates[0]?.date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })} - {weekDates[6]?.date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
            </Text>
            <TouchableOpacity
              style={styles.weekNavButton}
              onPress={() => setWeekOffset(weekOffset + 1)}
            >
              <ChevronRight size={20} color="#2563EB" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}

        {selectedView === "week" ? (
          <View style={styles.weekGrid}>
            {weekDates.map((dayData, index) => (
              <View key={index} style={styles.weekDayColumn}>
                <View style={styles.weekDayHeader}>
                  <Text style={styles.weekDayName}>{dayData.dayName}</Text>
                  <Text style={styles.weekDayDate}>
                    {dayData.date.toLocaleDateString("ru-RU", { day: "2-digit" })}
                  </Text>
                </View>
                <View style={styles.weekDayShifts}>
                  {dayData.shifts.length === 0 ? (
                    <Text style={styles.weekDayEmpty}>-</Text>
                  ) : (
                    dayData.shifts.slice(0, 3).map((shift) => (
                      <View
                        key={shift.id}
                        style={[
                          styles.weekShiftItem,
                          shift.status === "Свободно" && styles.weekShiftFree,
                        ]}
                      >
                        <Text style={styles.weekShiftTime}>{shift.startTime}</Text>
                        <Text style={styles.weekShiftName} numberOfLines={1}>
                          {shift.employeeName || "Свободно"}
                        </Text>
                      </View>
                    ))
                  )}
                  {dayData.shifts.length > 3 && (
                    <Text style={styles.weekMoreShifts}>+{dayData.shifts.length - 3}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Calendar size={18} color="#6B7280" strokeWidth={2} />
                <Text style={styles.sectionTitle}>
                  {selectedView === "today" && `Сегодня (${currentShifts.length})`}
                  {selectedView === "tomorrow" && `Завтра (${tomorrowShifts.length})`}
                  {selectedView === "after" && `Послезавтра (${dayAfterShifts.length})`}
                </Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.horizontalList}>
                {selectedView === "today" && currentShifts.map((shift) => renderFutureShiftCard(shift))}
                {selectedView === "tomorrow" && tomorrowShifts.map((shift) => renderFutureShiftCard(shift))}
                {selectedView === "after" && dayAfterShifts.map((shift) => renderFutureShiftCard(shift))}
              </View>
            </ScrollView>
            {((selectedView === "today" && currentShifts.length === 0) ||
              (selectedView === "tomorrow" && tomorrowShifts.length === 0) ||
              (selectedView === "after" && dayAfterShifts.length === 0)) && (
              <Text style={styles.emptyText}>Нет смен</Text>
            )}
          </View>
        )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  collapseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  collapseButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#2563EB",
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#111827",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#DC2626",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#111827",
  },
  shiftCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  shiftCardWarning: {
    borderColor: "#FDE68A",
    backgroundColor: "#FFFBEB",
  },
  shiftCardLate: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  shiftCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  employeeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  shiftCardInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
  },
  positionText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  futureShiftCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    width: 160,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  futureShiftHeader: {
    marginBottom: 8,
  },
  futureShiftTime: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 4,
  },
  futureShiftPosition: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "500" as const,
  },
  futureShiftFooter: {},
  futureShiftEmployee: {
    fontSize: 13,
    color: "#374151",
  },
  futureShiftEmpty: {
    fontSize: 13,
    color: "#15803D",
    fontWeight: "500" as const,
  },
  horizontalList: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic" as const,
  },
  viewSelector: {
    flexDirection: "row" as const,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  viewTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center" as const,
    borderRadius: 8,
  },
  viewTabActive: {
    backgroundColor: "#FFFFFF",
  },
  viewTabText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  viewTabTextActive: {
    color: "#2563EB",
    fontWeight: "600" as const,
  },
  weekNavigation: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  weekNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
  },
  weekGrid: {
    flexDirection: "row" as const,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden" as const,
  },
  weekDayColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#F3F4F6",
  },
  weekDayHeader: {
    alignItems: "center" as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#F9FAFB",
  },
  weekDayName: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#6B7280",
    textTransform: "uppercase" as const,
  },
  weekDayDate: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#111827",
    marginTop: 2,
  },
  weekDayShifts: {
    padding: 4,
    minHeight: 80,
  },
  weekDayEmpty: {
    fontSize: 12,
    color: "#D1D5DB",
    textAlign: "center" as const,
    marginTop: 20,
  },
  weekShiftItem: {
    backgroundColor: "#DBEAFE",
    borderRadius: 4,
    padding: 4,
    marginBottom: 4,
  },
  weekShiftFree: {
    backgroundColor: "#DCFCE7",
  },
  weekShiftTime: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#1E40AF",
  },
  weekShiftName: {
    fontSize: 9,
    color: "#374151",
  },
  urgentButton: {
    marginTop: 12,
    backgroundColor: "#DC2626",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  urgentButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  weekMoreShifts: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center" as const,
    marginTop: 4,
  },
});
