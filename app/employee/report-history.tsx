import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingDown,
  TrendingUp,
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
import { useApp } from "@/providers/AppProvider";
import { CashierReport } from "@/types";

export default function ReportHistoryScreen() {
  const { currentUser, reports, history } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const myReports = useMemo(() => {
    if (!currentUser) return [];
    
    const allReports = reports.filter(r => r.employeeId === currentUser.id);
    const historyReports = history
      .filter(h => h.report && h.shift.employeeId === currentUser.id)
      .map(h => h.report as CashierReport);
    
    const combined = [...allReports];
    historyReports.forEach(hr => {
      if (!combined.find(r => r.id === hr.id)) {
        combined.push(hr);
      }
    });
    
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentUser, reports, history]);

  const filteredReports = useMemo(() => {
    return myReports.filter(report => {
      const reportDate = new Date(report.date);
      return (
        reportDate.getMonth() === selectedMonth.getMonth() &&
        reportDate.getFullYear() === selectedMonth.getFullYear()
      );
    });
  }, [myReports, selectedMonth]);

  const monthStats = useMemo(() => {
    let totalCashSurplus = 0;
    let totalCashShortage = 0;
    let totalCardSurplus = 0;
    let totalCardShortage = 0;

    filteredReports.forEach(report => {
      if (report.cashDiscrepancy > 0) {
        totalCashSurplus += report.cashDiscrepancy;
      } else {
        totalCashShortage += Math.abs(report.cashDiscrepancy);
      }
      if (report.cardDiscrepancy > 0) {
        totalCardSurplus += report.cardDiscrepancy;
      } else {
        totalCardShortage += Math.abs(report.cardDiscrepancy);
      }
    });

    return {
      totalReports: filteredReports.length,
      totalCashSurplus,
      totalCashShortage,
      totalCardSurplus,
      totalCardShortage,
      netCash: totalCashSurplus - totalCashShortage,
      netCard: totalCardSurplus - totalCardShortage,
    };
  }, [filteredReports]);

  const prevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };

  const monthLabel = selectedMonth.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? "+" : "";
    return `${sign}${amount.toFixed(0)} ₽`;
  };

  const renderReport = ({ item }: { item: CashierReport }) => {
    return (
      <View style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <View style={styles.dateRow}>
            <Calendar size={16} color="#6B7280" strokeWidth={2} />
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          </View>
          <View style={[
            styles.shiftTypeBadge,
            item.shiftType === "День" ? styles.dayShift : styles.nightShift
          ]}>
            <Text style={[
              styles.shiftTypeText,
              item.shiftType === "День" ? styles.dayShiftText : styles.nightShiftText
            ]}>
              {item.shiftType}
            </Text>
          </View>
        </View>

        <View style={styles.discrepancyContainer}>
          <View style={styles.discrepancyRow}>
            <Text style={styles.discrepancyLabel}>Наличные:</Text>
            <View style={[
              styles.discrepancyValue,
              item.cashDiscrepancy > 0 && styles.surplus,
              item.cashDiscrepancy < 0 && styles.shortage,
              item.cashDiscrepancy === 0 && styles.exact,
            ]}>
              {item.cashDiscrepancy > 0 && <ArrowUpCircle size={14} color="#15803D" strokeWidth={2} />}
              {item.cashDiscrepancy < 0 && <ArrowDownCircle size={14} color="#DC2626" strokeWidth={2} />}
              {item.cashDiscrepancy === 0 && <CheckCircle size={14} color="#6B7280" strokeWidth={2} />}
              <Text style={[
                styles.discrepancyAmount,
                item.cashDiscrepancy > 0 && styles.surplusText,
                item.cashDiscrepancy < 0 && styles.shortageText,
                item.cashDiscrepancy === 0 && styles.exactText,
              ]}>
                {formatAmount(item.cashDiscrepancy)}
              </Text>
            </View>
          </View>

          <View style={styles.discrepancyRow}>
            <Text style={styles.discrepancyLabel}>Безнал:</Text>
            <View style={[
              styles.discrepancyValue,
              item.cardDiscrepancy > 0 && styles.surplus,
              item.cardDiscrepancy < 0 && styles.shortage,
              item.cardDiscrepancy === 0 && styles.exact,
            ]}>
              {item.cardDiscrepancy > 0 && <ArrowUpCircle size={14} color="#15803D" strokeWidth={2} />}
              {item.cardDiscrepancy < 0 && <ArrowDownCircle size={14} color="#DC2626" strokeWidth={2} />}
              {item.cardDiscrepancy === 0 && <CheckCircle size={14} color="#6B7280" strokeWidth={2} />}
              <Text style={[
                styles.discrepancyAmount,
                item.cardDiscrepancy > 0 && styles.surplusText,
                item.cardDiscrepancy < 0 && styles.shortageText,
                item.cardDiscrepancy === 0 && styles.exactText,
              ]}>
                {formatAmount(item.cardDiscrepancy)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.reportFooter}>
          {item.verified ? (
            <View style={styles.verifiedBadge}>
              <CheckCircle size={12} color="#15803D" strokeWidth={2} />
              <Text style={styles.verifiedText}>Проверено</Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <Clock size={12} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.pendingText}>На проверке</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.monthNavButton} onPress={prevMonth}>
          <ChevronLeft size={20} color="#2563EB" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity style={styles.monthNavButton} onPress={nextMonth}>
          <ChevronRight size={20} color="#2563EB" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Итого за месяц</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Смен</Text>
            <Text style={styles.statValue}>{monthStats.totalReports}</Text>
          </View>
          <View style={[styles.statCard, monthStats.netCash >= 0 ? styles.surplusBg : styles.shortageBg]}>
            <View style={styles.statHeader}>
              {monthStats.netCash >= 0 ? (
                <TrendingUp size={14} color="#15803D" strokeWidth={2} />
              ) : (
                <TrendingDown size={14} color="#DC2626" strokeWidth={2} />
              )}
              <Text style={styles.statLabel}>Наличные</Text>
            </View>
            <Text style={[
              styles.statValue,
              monthStats.netCash >= 0 ? styles.surplusText : styles.shortageText
            ]}>
              {formatAmount(monthStats.netCash)}
            </Text>
          </View>
          <View style={[styles.statCard, monthStats.netCard >= 0 ? styles.surplusBg : styles.shortageBg]}>
            <View style={styles.statHeader}>
              {monthStats.netCard >= 0 ? (
                <TrendingUp size={14} color="#15803D" strokeWidth={2} />
              ) : (
                <TrendingDown size={14} color="#DC2626" strokeWidth={2} />
              )}
              <Text style={styles.statLabel}>Безнал</Text>
            </View>
            <Text style={[
              styles.statValue,
              monthStats.netCard >= 0 ? styles.surplusText : styles.shortageText
            ]}>
              {formatAmount(monthStats.netCard)}
            </Text>
          </View>
        </View>

        <View style={styles.detailStats}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Излишки (нал):</Text>
            <Text style={[styles.detailValue, styles.surplusText]}>+{monthStats.totalCashSurplus.toFixed(0)} ₽</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Недостачи (нал):</Text>
            <Text style={[styles.detailValue, styles.shortageText]}>-{monthStats.totalCashShortage.toFixed(0)} ₽</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Излишки (безнал):</Text>
            <Text style={[styles.detailValue, styles.surplusText]}>+{monthStats.totalCardSurplus.toFixed(0)} ₽</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Недостачи (безнал):</Text>
            <Text style={[styles.detailValue, styles.shortageText]}>-{monthStats.totalCardShortage.toFixed(0)} ₽</Text>
          </View>
        </View>
      </View>

      {filteredReports.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={48} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Нет отчётов</Text>
          <Text style={styles.emptySubtitle}>
            За этот месяц нет отчётов
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
  monthNav: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    textTransform: "capitalize" as const,
  },
  statsContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row" as const,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 12,
    alignItems: "center" as const,
  },
  statHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
  },
  surplusBg: {
    backgroundColor: "#F0FDF4",
  },
  shortageBg: {
    backgroundColor: "#FEF2F2",
  },
  detailStats: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
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
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dateRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
  },
  shiftTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dayShift: {
    backgroundColor: "#FEF3C7",
  },
  nightShift: {
    backgroundColor: "#1E3A5F",
  },
  shiftTypeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  dayShiftText: {
    color: "#92400E",
  },
  nightShiftText: {
    color: "#FFFFFF",
  },
  discrepancyContainer: {
    gap: 8,
  },
  discrepancyRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  discrepancyLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  discrepancyValue: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  surplus: {
    backgroundColor: "#DCFCE7",
  },
  shortage: {
    backgroundColor: "#FEE2E2",
  },
  exact: {
    backgroundColor: "#F3F4F6",
  },
  discrepancyAmount: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  surplusText: {
    color: "#15803D",
  },
  shortageText: {
    color: "#DC2626",
  },
  exactText: {
    color: "#6B7280",
  },
  reportFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    alignItems: "flex-end" as const,
  },
  verifiedBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#15803D",
  },
  pendingBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
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
});
