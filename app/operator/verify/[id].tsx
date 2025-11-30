import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Calculator,
  CheckCircle,
  DollarSign,
  Edit3,
  User as UserIcon,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";

export default function VerifyReportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { reports, currentUser, verifyReport, updateReport, moveToHistory } = useApp();

  const report = useMemo(
    () => reports.find((r) => r.id === id),
    [reports, id]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [cashActual, setCashActual] = useState("");
  const [cardActual, setCardActual] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (report && !isInitialized) {
      setCashActual(report.cashActual.toString());
      setCardActual(report.cardActual.toString());
      setIsInitialized(true);
    }
  }, [report, isInitialized]);

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Отчёт не найден</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cashDiscrepancy = parseFloat(cashActual) - report.cashZ;
  const cardDiscrepancy = parseFloat(cardActual) - report.cardZ;

  const handleSaveCorrections = () => {
    updateReport(report.id, {
      cashActual: parseFloat(cashActual),
      cardActual: parseFloat(cardActual),
      cashDiscrepancy,
      cardDiscrepancy,
    });
    setIsEditing(false);

    if (Platform.OS === "web") {
      alert("Корректировки сохранены");
    } else {
      Alert.alert("Успешно", "Корректировки сохранены");
    }
  };

  const handleVerify = () => {
    if (!currentUser) return;

    verifyReport(report.id, currentUser.name);
    moveToHistory(report.shiftId);

    if (Platform.OS === "web") {
      alert("Смена подтверждена и перенесена в историю");
    } else {
      Alert.alert("Успешно", "Смена подтверждена и перенесена в историю");
    }

    router.replace("/operator/" as never);
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
    if (value > 0)
      return { text: `+${value.toFixed(2)} ₽`, color: "#15803D", emoji: "🟢", label: "излишка" };
    if (value < 0)
      return { text: `${value.toFixed(2)} ₽`, color: "#DC2626", emoji: "🔴", label: "недостача" };
    return { text: "0.00 ₽", color: "#6B7280", emoji: "", label: "" };
  };

  const cashIndicator = getDiscrepancyIndicator(isEditing ? cashDiscrepancy : report.cashDiscrepancy);
  const cardIndicator = getDiscrepancyIndicator(isEditing ? cardDiscrepancy : report.cardDiscrepancy);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{formatDate(report.date)}</Text>
          <Text style={styles.cardSubtitle}>Отчёт кассира</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <UserIcon size={18} color="#6B7280" strokeWidth={2} />
            <Text style={styles.infoLabel}>Сотрудник:</Text>
            <Text style={styles.infoValue}>{report.employeeName}</Text>
          </View>
          <View style={styles.infoRow}>
            <DollarSign size={18} color="#6B7280" strokeWidth={2} />
            <Text style={styles.infoLabel}>Тип смены:</Text>
            <Text style={styles.infoValue}>{report.shiftType}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Z-Отчёт</Text>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Наличные (Z):</Text>
            <Text style={styles.dataValue}>{report.cashZ.toFixed(2)} ₽</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Безнал (Z):</Text>
            <Text style={styles.dataValue}>{report.cardZ.toFixed(2)} ₽</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Возвраты (Z):</Text>
            <Text style={styles.dataValue}>{report.returnsZ.toFixed(2)} ₽</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Фактические данные</Text>
            {!isEditing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Edit3 size={16} color="#2563EB" strokeWidth={2} />
                <Text style={styles.editButtonText}>Изменить</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Наличные (Факт):</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={cashActual}
                onChangeText={setCashActual}
                keyboardType="decimal-pad"
              />
            ) : (
              <Text style={styles.dataValue}>
                {report.cashActual.toFixed(2)} ₽
              </Text>
            )}
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Безнал (Факт):</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={cardActual}
                onChangeText={setCardActual}
                keyboardType="decimal-pad"
              />
            ) : (
              <Text style={styles.dataValue}>
                {report.cardActual.toFixed(2)} ₽
              </Text>
            )}
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Изъятия:</Text>
            <Text style={styles.dataValue}>
              {report.withdrawals.toFixed(2)} ₽
            </Text>
          </View>

          {report.comment && (
             <View style={styles.commentBox}>
               <Text style={styles.commentLabel}>Комментарий кассира:</Text>
               <Text style={styles.commentText}>{report.comment}</Text>
             </View>
          )}

          {isEditing && (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveCorrections}
              >
                <Text style={styles.saveButtonText}>Сохранить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelEditButton}
                onPress={() => {
                  setCashActual(report.cashActual.toString());
                  setCardActual(report.cardActual.toString());
                  setIsEditing(false);
                }}
              >
                <Text style={styles.cancelEditButtonText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.resultsCard}>
          <View style={styles.resultsHeader}>
            <Calculator size={20} color="#2563EB" strokeWidth={2} />
            <Text style={styles.resultsTitle}>Результаты</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Наличные:</Text>
            <View style={styles.resultValueContainer}>
              <Text style={[styles.resultValue, { color: cashIndicator.color }]}>
                {cashIndicator.text}
              </Text>
              {cashIndicator.emoji && (
                <Text style={styles.emoji}>{cashIndicator.emoji}</Text>
              )}
              {cashIndicator.label && (
                <Text style={[styles.resultNote, { color: cashIndicator.color }]}>
                  ({cashIndicator.label})
                </Text>
              )}
            </View>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Безнал:</Text>
            <View style={styles.resultValueContainer}>
              <Text style={[styles.resultValue, { color: cardIndicator.color }]}>
                {cardIndicator.text}
              </Text>
              {cardIndicator.emoji && (
                <Text style={styles.emoji}>{cardIndicator.emoji}</Text>
              )}
              {cardIndicator.label && (
                <Text style={[styles.resultNote, { color: cardIndicator.color }]}>
                  ({cardIndicator.label})
                </Text>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, isEditing && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={isEditing}
        >
          <CheckCircle size={20} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.verifyButtonText}>Подтвердить смену</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Вернуться назад</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
    flex: 1,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#2563EB",
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dataLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  dataValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
    minWidth: 120,
    textAlign: "right" as const,
  },
  commentBox: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#4B5563",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: "#1F2937",
    fontStyle: "italic" as const,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#15803D",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  cancelEditButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelEditButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  resultsCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#BFDBFE",
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#BFDBFE",
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1E40AF",
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1E40AF",
  },
  resultValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  resultNote: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  emoji: {
    fontSize: 18,
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
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#15803D",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
});
