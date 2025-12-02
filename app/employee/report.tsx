import { useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  Calendar,
  Clock,
  DollarSign,
  FileText,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { Shift, ShiftType } from "@/types";

export default function ReportScreen() {
  const router = useRouter();
  const { currentUser, getEmployeeShifts, addReport, getNextShiftForEmployee, reports } = useApp();

  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [shiftType, setShiftType] = useState<ShiftType>("День");
  const [cashZ, setCashZ] = useState("");
  const [cardZ, setCardZ] = useState("");
  const [returnsZ, setReturnsZ] = useState("");
  const [cashActual, setCashActual] = useState("");
  const [cardActual, setCardActual] = useState("");
  const [withdrawals, setWithdrawals] = useState("");
  const [comment, setComment] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [nextShift, setNextShift] = useState<Shift | null>(null);

  const myShifts = useMemo(() => {
    if (!currentUser) return [];
    const allShifts = getEmployeeShifts(currentUser.id);
    // Filter out shifts that already have a report
    return allShifts.filter(shift => !reports.some(report => report.shiftId === shift.id));
  }, [currentUser, getEmployeeShifts, reports]);

  const cashDiscrepancy = useMemo(() => {
    const cashAct = parseFloat(cashActual) || 0;
    const cashZNum = parseFloat(cashZ) || 0;
    return cashAct - cashZNum;
  }, [cashActual, cashZ]);

  const cardDiscrepancy = useMemo(() => {
    const cardAct = parseFloat(cardActual) || 0;
    const cardZNum = parseFloat(cardZ) || 0;
    return cardAct - cardZNum;
  }, [cardActual, cardZ]);

  const handleSubmit = () => {
    if (!selectedShiftId) {
      if (Platform.OS === "web") {
        alert("Пожалуйста, выберите смену");
      } else {
        Alert.alert("Ошибка", "Пожалуйста, выберите смену");
      }
      return;
    }

    if (!cashZ || !cardZ || !returnsZ || !cashActual || !cardActual || !withdrawals) {
      if (Platform.OS === "web") {
        alert("Пожалуйста, заполните все поля");
      } else {
        Alert.alert("Ошибка", "Пожалуйста, заполните все поля");
      }
      return;
    }

    const selectedShift = myShifts.find((s) => s.id === selectedShiftId);
    if (!selectedShift || !currentUser) return;

    const report = {
      id: Date.now().toString(),
      date: selectedShift.date,
      shiftId: selectedShiftId,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      shiftType,
      cashZ: parseFloat(cashZ),
      cardZ: parseFloat(cardZ),
      returnsZ: parseFloat(returnsZ),
      cashActual: parseFloat(cashActual),
      cardActual: parseFloat(cardActual),
      withdrawals: parseFloat(withdrawals),
      cashDiscrepancy,
      cardDiscrepancy,
      verified: false,
      comment,
    };

    addReport(report);

    const upcoming = currentUser ? getNextShiftForEmployee(currentUser.id) : null;
    setNextShift(upcoming);
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const handleGoToShifts = () => {
    setShowSuccessModal(false);
    router.replace("/employee" as never);
  };

  const formatNextShiftDate = (shift: Shift) => {
    const date = new Date(shift.date);
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Calendar size={18} color="#374151" strokeWidth={2} />
              <Text style={styles.label}>Выберите смену</Text>
            </View>

            {myShifts.length === 0 ? (
              <View style={styles.warningBox}>
                <AlertCircle size={16} color="#DC2626" strokeWidth={2} />
                <Text style={styles.warningText}>
                  У вас нет забронированных смен
                </Text>
              </View>
            ) : (
              <View style={styles.shiftsList}>
                {myShifts.map((shift) => (
                  <TouchableOpacity
                    key={shift.id}
                    style={[
                      styles.shiftOption,
                      selectedShiftId === shift.id && styles.shiftOptionSelected,
                    ]}
                    onPress={() => setSelectedShiftId(shift.id)}
                  >
                    <Text
                      style={[
                        styles.shiftOptionText,
                        selectedShiftId === shift.id &&
                          styles.shiftOptionTextSelected,
                      ]}
                    >
                      {formatDate(shift.date)} • {shift.startTime} -{" "}
                      {shift.endTime}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Тип смены</Text>
            <View style={styles.shiftTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.shiftTypeButton,
                  shiftType === "День" && styles.shiftTypeButtonActive,
                ]}
                onPress={() => setShiftType("День")}
              >
                <Text
                  style={[
                    styles.shiftTypeButtonText,
                    shiftType === "День" && styles.shiftTypeButtonTextActive,
                  ]}
                >
                  День
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.shiftTypeButton,
                  shiftType === "Ночь" && styles.shiftTypeButtonActive,
                ]}
                onPress={() => setShiftType("Ночь")}
              >
                <Text
                  style={[
                    styles.shiftTypeButtonText,
                    shiftType === "Ночь" && styles.shiftTypeButtonTextActive,
                  ]}
                >
                  Ночь
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Z-Отчёт</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <DollarSign size={16} color="#374151" strokeWidth={2} />
                <Text style={styles.inputLabel}>Наличные (Z)</Text>
              </View>
              <TextInput
                style={styles.input}
                value={cashZ}
                onChangeText={setCashZ}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <DollarSign size={16} color="#374151" strokeWidth={2} />
                <Text style={styles.inputLabel}>Безнал (Z)</Text>
              </View>
              <TextInput
                style={styles.input}
                value={cardZ}
                onChangeText={setCardZ}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <DollarSign size={16} color="#374151" strokeWidth={2} />
                <Text style={styles.inputLabel}>Возвраты (Z)</Text>
              </View>
              <TextInput
                style={styles.input}
                value={returnsZ}
                onChangeText={setReturnsZ}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Фактические данные</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <DollarSign size={16} color="#374151" strokeWidth={2} />
                <Text style={styles.inputLabel}>Наличные (Факт)</Text>
              </View>
              <TextInput
                style={styles.input}
                value={cashActual}
                onChangeText={setCashActual}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <DollarSign size={16} color="#374151" strokeWidth={2} />
                <Text style={styles.inputLabel}>Безнал (Факт)</Text>
              </View>
              <TextInput
                style={styles.input}
                value={cardActual}
                onChangeText={setCardActual}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <DollarSign size={16} color="#374151" strokeWidth={2} />
                <Text style={styles.inputLabel}>Изъятия</Text>
              </View>
              <TextInput
                style={styles.input}
                value={withdrawals}
                onChangeText={setWithdrawals}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FileText size={16} color="#374151" strokeWidth={2} />
                <Text style={styles.inputLabel}>Комментарий (необязательно)</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={comment}
                onChangeText={setComment}
                placeholder="Причина расхождений, заметки..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.discrepanciesContainer}>
            <View style={styles.discrepancyBox}>
              <Calculator size={20} color="#2563EB" strokeWidth={2} />
              <View style={styles.discrepancyContent}>
                <Text style={styles.discrepancyLabel}>Наличные</Text>
                <View style={styles.discrepancyValueRow}>
                  <Text
                    style={[
                      styles.discrepancyValue,
                      cashDiscrepancy > 0 && styles.discrepancyValuePositive,
                      cashDiscrepancy < 0 && styles.discrepancyValueNegative,
                    ]}
                  >
                    {cashDiscrepancy > 0 ? "+" : ""}{cashDiscrepancy.toFixed(2)} ₽
                  </Text>
                  {cashDiscrepancy > 0 && <Text style={styles.emoji}>💰</Text>}
                  {cashDiscrepancy < 0 && <Text style={styles.emoji}>⚠️</Text>}
                  {cashDiscrepancy === 0 && <Text style={styles.emoji}>✅</Text>}
                </View>
              </View>
            </View>

            <View style={styles.discrepancyBox}>
              <Calculator size={20} color="#2563EB" strokeWidth={2} />
              <View style={styles.discrepancyContent}>
                <Text style={styles.discrepancyLabel}>Безнал</Text>
                <View style={styles.discrepancyValueRow}>
                  <Text
                    style={[
                      styles.discrepancyValue,
                      cardDiscrepancy > 0 && styles.discrepancyValuePositive,
                      cardDiscrepancy < 0 && styles.discrepancyValueNegative,
                    ]}
                  >
                    {cardDiscrepancy > 0 ? "+" : ""}{cardDiscrepancy.toFixed(2)} ₽
                  </Text>
                  {cardDiscrepancy > 0 && <Text style={styles.emoji}>💰</Text>}
                  {cardDiscrepancy < 0 && <Text style={styles.emoji}>⚠️</Text>}
                  {cardDiscrepancy === 0 && <Text style={styles.emoji}>✅</Text>}
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, myShifts.length === 0 && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={myShifts.length === 0}
          >
            <Text style={styles.submitButtonText}>Сохранить отчёт</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.successIcon}>
                <Calculator size={32} color="#15803D" strokeWidth={2} />
              </View>
              <Text style={styles.modalTitle}>Отчёт сохранён!</Text>
              <Text style={styles.modalSubtitle}>
                Отчёт отправлен на проверку операционисту
              </Text>
            </View>

            {nextShift ? (
              <View style={styles.nextShiftCard}>
                <Text style={styles.nextShiftLabel}>Ваша следующая смена:</Text>
                <View style={styles.nextShiftInfo}>
                  <View style={styles.nextShiftRow}>
                    <Calendar size={16} color="#2563EB" strokeWidth={2} />
                    <Text style={styles.nextShiftDate}>
                      {formatNextShiftDate(nextShift)}
                    </Text>
                  </View>
                  <View style={styles.nextShiftRow}>
                    <Clock size={16} color="#2563EB" strokeWidth={2} />
                    <Text style={styles.nextShiftTime}>
                      {nextShift.startTime} - {nextShift.endTime}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.noNextShiftCard}>
                <Text style={styles.noNextShiftText}>
                  У вас нет запланированных смен.
                </Text>
                <Text style={styles.noNextShiftHint}>
                  Забронируйте смену в списке доступных
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleGoToShifts}
              >
                <Text style={styles.modalPrimaryButtonText}>К сменам</Text>
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.modalSecondaryButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#374151",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#374151",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "500" as const,
  },
  shiftsList: {
    gap: 8,
  },
  shiftOption: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
  },
  shiftOptionSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  shiftOptionText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  shiftOptionTextSelected: {
    color: "#2563EB",
    fontWeight: "600" as const,
  },
  shiftTypeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  shiftTypeButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  shiftTypeButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  shiftTypeButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  shiftTypeButtonTextActive: {
    color: "#FFFFFF",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  textArea: {
    minHeight: 80,
  },
  discrepanciesContainer: {
    gap: 12,
  },
  discrepancyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#BFDBFE",
  },
  discrepancyContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  discrepancyLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1E40AF",
  },
  discrepancyValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  discrepancyValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#374151",
  },
  discrepancyValuePositive: {
    color: "#15803D",
  },
  discrepancyValueNegative: {
    color: "#DC2626",
  },
  emoji: {
    fontSize: 20,
  },
  submitButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 360,
  },
  modalHeader: {
    alignItems: "center" as const,
    marginBottom: 20,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#DCFCE7",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center" as const,
  },
  nextShiftCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  nextShiftLabel: {
    fontSize: 13,
    color: "#1E40AF",
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  nextShiftInfo: {
    gap: 8,
  },
  nextShiftRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  nextShiftDate: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
    textTransform: "capitalize" as const,
  },
  nextShiftTime: {
    fontSize: 15,
    color: "#374151",
  },
  noNextShiftCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center" as const,
  },
  noNextShiftText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#92400E",
    marginBottom: 4,
  },
  noNextShiftHint: {
    fontSize: 13,
    color: "#92400E",
  },
  modalActions: {
    gap: 12,
  },
  modalPrimaryButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 14,
  },
  modalPrimaryButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  modalSecondaryButton: {
    alignItems: "center" as const,
    paddingVertical: 12,
  },
  modalSecondaryButtonText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
});
