import { Stack } from "expo-router";
import {
  Calendar,
  CheckCircle,
  Clock,
  User as UserIcon,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useApp } from "@/providers/AppProvider";

export default function FounderHistoryScreen() {
  const { history } = useApp();

  const [periodStart, setPeriodStart] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [periodEnd, setPeriodEnd] = useState(() => {
    const date = new Date();
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return nextMonth.toISOString().split("T")[0];
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const onStartChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setPeriodStart(selectedDate.toISOString().split("T")[0]);
    }
  };

  const onEndChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setPeriodEnd(selectedDate.toISOString().split("T")[0]);
    }
  };

  const sortedHistory = useMemo(
    () =>
      [...history]
        .filter((item) => {
          const itemDate = item.shift.date;
          return itemDate >= periodStart && itemDate <= periodEnd;
        })
        .sort(
          (a, b) =>
            new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
        ),
    [history, periodStart, periodEnd]
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getDiscrepancyIndicator = (value: number) => {
    if (value > 0)
      return { text: `+${value.toFixed(2)} ₽`, color: "#15803D", emoji: "🟢" };
    if (value < 0)
      return { text: `${value.toFixed(2)} ₽`, color: "#DC2626", emoji: "🔴" };
    return { text: "0.00 ₽", color: "#6B7280", emoji: "" };
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: "История смен" }} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>История смен</Text>
        <Text style={styles.headerSubtitle}>
          Всего записей: {sortedHistory.length}
        </Text>
      </View>

      <View style={styles.periodSection}>
        <View style={styles.periodInputs}>
          <TouchableOpacity
            style={styles.periodInput}
            onPress={() => setShowStartPicker(true)}
          >
            <Calendar size={16} color="#6B7280" strokeWidth={2} />
            <Text style={styles.dateInput}>{periodStart}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={new Date(periodStart)}
              mode="date"
              display="default"
              onChange={onStartChange}
            />
          )}

          <Text style={styles.periodSeparator}>—</Text>

          <TouchableOpacity
            style={styles.periodInput}
            onPress={() => setShowEndPicker(true)}
          >
            <Calendar size={16} color="#6B7280" strokeWidth={2} />
            <Text style={styles.dateInput}>{periodEnd}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={new Date(periodEnd)}
              mode="date"
              display="default"
              onChange={onEndChange}
            />
          )}
        </View>
      </View>

      <FlatList
        data={sortedHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const cashDisc = getDiscrepancyIndicator(
            item.report?.cashDiscrepancy || 0
          );
          const cardDisc = getDiscrepancyIndicator(
            item.report?.cardDiscrepancy || 0
          );

          return (
            <View style={styles.historyCard}>
              <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                  <Calendar size={20} color="#2563EB" strokeWidth={2} />
                  <Text style={styles.cardDate}>
                    {formatDate(item.shift.date)}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <CheckCircle size={16} color="#10B981" strokeWidth={2} />
                  <Text style={styles.statusText}>{item.shift.status}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <UserIcon size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.infoLabel}>Сотрудник:</Text>
                  <Text style={styles.infoValue}>{item.shift.employeeName}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Clock size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.infoLabel}>Смена:</Text>
                  <Text style={styles.infoValue}>
                    {item.shift.startTime} - {item.shift.endTime}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Должность:</Text>
                  <Text style={styles.infoValue}>{item.shift.position}</Text>
                </View>
              </View>

              {item.report && (
                <View style={styles.reportSection}>
                  <Text style={styles.reportTitle}>Отчет кассира</Text>
                  <View style={styles.reportGrid}>
                    <View style={styles.reportItem}>
                      <Text style={styles.reportLabel}>Нал (Z):</Text>
                      <Text style={styles.reportValue}>
                        {item.report.cashZ.toFixed(2)} ₽
                      </Text>
                    </View>
                    <View style={styles.reportItem}>
                      <Text style={styles.reportLabel}>Безнал (Z):</Text>
                      <Text style={styles.reportValue}>
                        {item.report.cardZ.toFixed(2)} ₽
                      </Text>
                    </View>
                    <View style={styles.reportItem}>
                      <Text style={styles.reportLabel}>Нал (факт):</Text>
                      <Text style={styles.reportValue}>
                        {item.report.cashActual.toFixed(2)} ₽
                      </Text>
                    </View>
                    <View style={styles.reportItem}>
                      <Text style={styles.reportLabel}>Безнал (факт):</Text>
                      <Text style={styles.reportValue}>
                        {item.report.cardActual.toFixed(2)} ₽
                      </Text>
                    </View>
                  </View>

                  <View style={styles.discrepancies}>
                    <View style={styles.discrepancyItem}>
                      <Text style={styles.discrepancyLabel}>Расхождение (Нал):</Text>
                      <Text style={[styles.discrepancyValue, { color: cashDisc.color }]}>
                        {cashDisc.emoji} {cashDisc.text}
                      </Text>
                    </View>
                    <View style={styles.discrepancyItem}>
                      <Text style={styles.discrepancyLabel}>Расхождение (Безнал):</Text>
                      <Text style={[styles.discrepancyValue, { color: cardDisc.color }]}>
                        {cardDisc.emoji} {cardDisc.text}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={48} color="#D1D5DB" strokeWidth={2} />
            <Text style={styles.emptyText}>Нет записей за выбранный период</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  periodSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  periodInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  periodInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
  },
  dateInput: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500" as const,
  },
  periodSeparator: {
    fontSize: 16,
    color: "#6B7280",
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  cardBody: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
  },
  reportSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 12,
  },
  reportGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  reportItem: {
    width: "47%",
  },
  reportLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  reportValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
  },
  discrepancies: {
    gap: 8,
  },
  discrepancyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  discrepancyLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  discrepancyValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 16,
  },
});
