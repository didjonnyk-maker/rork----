import { useRouter } from "expo-router";
import {
  CheckCircle,
  ChevronLeft,
  Clock,
  FileText,
  LogOut,
  User as UserIcon,
} from "lucide-react-native";
import { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";

export default function OperatorScreen() {
  const router = useRouter();
  const { currentUser, reports, logout } = useApp();

  const unverifiedReports = useMemo(
    () =>
      reports
        .filter((report) => !report.verified)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [reports]
  );

  const handleLogout = () => {
    logout();
    if (router.canGoBack()) {
      router.dismissAll();
    }
    router.replace("/" as never);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/management/" as never);
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

  const getDiscrepancyIndicator = (value: number) => {
    if (value > 0) return { text: `+${value.toFixed(2)} ₽`, color: "#15803D", emoji: "💰" };
    if (value < 0) return { text: `${value.toFixed(2)} ₽`, color: "#DC2626", emoji: "⚠️" };
    return { text: "0.00 ₽", color: "#6B7280", emoji: "✅" };
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {currentUser?.role !== "Операционист" && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ChevronLeft size={24} color="#111827" strokeWidth={2} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerTitle}>Проверка отчётов</Text>
            <Text style={styles.headerSubtitle}>{currentUser?.name}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <FileText size={24} color="#2563EB" strokeWidth={2} />
          <Text style={styles.statValue}>{unverifiedReports.length}</Text>
          <Text style={styles.statLabel}>Требуют проверки</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={24} color="#15803D" strokeWidth={2} />
          <Text style={styles.statValue}>
            {reports.filter((r) => r.verified).length}
          </Text>
          <Text style={styles.statLabel}>Подтверждено</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Отчёты на проверке</Text>
      </View>

      {unverifiedReports.length === 0 ? (
        <View style={styles.emptyState}>
          <CheckCircle size={48} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Все отчёты проверены</Text>
          <Text style={styles.emptySubtitle}>
            Нет отчётов, требующих проверки
          </Text>
        </View>
      ) : (
        <FlatList
          data={unverifiedReports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const cashIndicator = getDiscrepancyIndicator(item.cashDiscrepancy);
            const cardIndicator = getDiscrepancyIndicator(item.cardDiscrepancy);

            return (
              <TouchableOpacity
                style={styles.reportCard}
                onPress={() => router.push(`/operator/verify/${item.id}` as never)}
              >
                <View style={styles.reportHeader}>
                  <Text style={styles.reportDate}>{formatDate(item.date)}</Text>
                  <View style={styles.pendingBadge}>
                    <Clock size={12} color="#F59E0B" strokeWidth={2} />
                    <Text style={styles.pendingText}>На проверке</Text>
                  </View>
                </View>

                <View style={styles.reportInfo}>
                  <View style={styles.infoRow}>
                    <UserIcon size={16} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.infoText}>{item.employeeName}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <FileText size={16} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.infoText}>
                      Смена: {item.shiftType}
                    </Text>
                  </View>
                </View>

                <View style={styles.discrepanciesSection}>
                  <View style={styles.discrepancyRow}>
                    <Text style={styles.discrepancyLabel}>Наличные:</Text>
                    <View style={styles.discrepancyValueContainer}>
                      <Text style={[styles.discrepancyText, { color: cashIndicator.color }]}>
                        {cashIndicator.text}
                      </Text>
                      {cashIndicator.emoji && (
                        <Text style={styles.emoji}>{cashIndicator.emoji}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.discrepancyRow}>
                    <Text style={styles.discrepancyLabel}>Безнал:</Text>
                    <View style={styles.discrepancyValueContainer}>
                      <Text style={[styles.discrepancyText, { color: cardIndicator.color }]}>
                        {cardIndicator.text}
                      </Text>
                      {cardIndicator.emoji && (
                        <Text style={styles.emoji}>{cardIndicator.emoji}</Text>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    padding: 4,
    marginLeft: -8,
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
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#2563EB",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500" as const,
    textAlign: "center" as const,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
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
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  reportDate: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  reportInfo: {
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
  discrepanciesSection: {
    gap: 8,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
  },
  discrepancyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  discrepancyLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  discrepancyValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  discrepancyText: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  emoji: {
    fontSize: 16,
  },
});
