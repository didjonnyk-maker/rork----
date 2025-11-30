import {
  Calendar,
  CheckCircle,
  Clock,
  User as UserIcon,
} from "lucide-react-native";
import { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";

export default function HistoryScreen() {
  const { history } = useApp();

  const sortedHistory = useMemo(
    () =>
      [...history].sort(
        (a, b) =>
          new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
      ),
    [history]
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
    if (value > 0) return { text: `+${value.toFixed(2)} ₽`, color: "#15803D", emoji: "🟢" };
    if (value < 0) return { text: `${value.toFixed(2)} ₽`, color: "#DC2626", emoji: "🔴" };
    return { text: "0.00 ₽", color: "#6B7280", emoji: "" };
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>История смен</Text>
        <Text style={styles.headerSubtitle}>
          Всего записей: {sortedHistory.length}
        </Text>
      </View>

      {sortedHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <CheckCircle size={48} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>История пуста</Text>
          <Text style={styles.emptySubtitle}>
            Подтверждённые смены будут отображаться здесь
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedHistory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const cashIndicator = item.report ? getDiscrepancyIndicator(item.report.cashDiscrepancy) : null;
            const cardIndicator = item.report ? getDiscrepancyIndicator(item.report.cardDiscrepancy) : null;

            return (
              <View style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.dateSection}>
                    <Calendar size={16} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.shiftDate}>
                      {formatDate(item.shift.date)}
                    </Text>
                  </View>
                  <View style={styles.confirmedBadge}>
                    <CheckCircle size={12} color="#15803D" strokeWidth={2} />
                    <Text style={styles.confirmedText}>Подтверждено</Text>
                  </View>
                </View>

                <View style={styles.cardInfo}>
                  <View style={styles.infoRow}>
                    <Clock size={16} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.infoText}>
                      {item.shift.startTime} - {item.shift.endTime}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <UserIcon size={16} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.infoText}>{item.shift.position}</Text>
                  </View>

                  {item.shift.employeeName && (
                    <View style={styles.employeeInfo}>
                      <Text style={styles.employeeLabel}>Сотрудник:</Text>
                      <Text style={styles.employeeName}>
                        {item.shift.employeeName}
                      </Text>
                    </View>
                  )}
                </View>

                {item.report && (
                  <View style={styles.reportSection}>
                    <Text style={styles.reportTitle}>Результаты:</Text>
                    <View style={styles.resultsGrid}>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Наличные</Text>
                        <View style={styles.resultValueContainer}>
                          <Text style={[styles.resultValue, { color: cashIndicator?.color }]}>
                            {cashIndicator?.text}
                          </Text>
                          {cashIndicator?.emoji && (
                            <Text style={styles.emoji}>{cashIndicator.emoji}</Text>
                          )}
                        </View>
                        {cashIndicator && cashIndicator.text !== "0.00 ₽" && (
                          <Text style={[styles.resultNote, { color: cashIndicator.color }]}>
                            {cashIndicator.color === "#15803D" ? "излишка" : "недостача"}
                          </Text>
                        )}
                      </View>

                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Безнал</Text>
                        <View style={styles.resultValueContainer}>
                          <Text style={[styles.resultValue, { color: cardIndicator?.color }]}>
                            {cardIndicator?.text}
                          </Text>
                          {cardIndicator?.emoji && (
                            <Text style={styles.emoji}>{cardIndicator.emoji}</Text>
                          )}
                        </View>
                        {cardIndicator && cardIndicator.text !== "0.00 ₽" && (
                          <Text style={[styles.resultNote, { color: cardIndicator.color }]}>
                            {cardIndicator.color === "#15803D" ? "излишка" : "недостача"}
                          </Text>
                        )}
                      </View>
                    </View>

                    {item.report.verifiedBy && (
                      <View style={styles.verificationInfo}>
                        <Text style={styles.verifiedByText}>
                          Подтвердил: {item.report.verifiedBy}
                        </Text>
                      </View>
                    )}
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
  header: {
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
    padding: 20,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
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
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confirmedText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#15803D",
  },
  cardInfo: {
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
  reportSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 12,
  },
  resultsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  resultItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  resultLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  resultValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  resultNote: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  emoji: {
    fontSize: 14,
  },
  verificationInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  verifiedByText: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic" as const,
  },
});
