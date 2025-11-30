import { useRouter } from "expo-router";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { Position, EMPLOYEE_POSITIONS } from "@/types";

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export default function AddShiftScreen() {
  const router = useRouter();
  const { addShift } = useApp();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("18");
  const [endMinute, setEndMinute] = useState("00");
  const [position, setPosition] = useState<Position>("Кассир");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const calendarDays = useMemo(() => getDaysInMonth(calendarMonth), [calendarMonth]);

  const isDateSelected = (day: number) => {
    if (!selectedDate || !day) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === calendarMonth.getMonth() &&
      selectedDate.getFullYear() === calendarMonth.getFullYear()
    );
  };

  const isDatePast = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    return checkDate < today;
  };

  const handleDayPress = (day: number | null) => {
    if (!day || isDatePast(day)) return;
    setSelectedDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
  };

  const prevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const monthYearLabel = calendarMonth.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  const handleSubmit = () => {
    if (!selectedDate) {
      const msg = "Пожалуйста, выберите дату";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }

    const dateStr = selectedDate.toISOString().split("T")[0];
    const startTime = `${startHour}:${startMinute}`;
    const endTime = `${endHour}:${endMinute}`;

    const newShift = {
      id: Date.now().toString(),
      date: dateStr,
      startTime,
      endTime,
      position,
      status: "Свободно" as const,
    };

    addShift(newShift);

    if (Platform.OS === "web") {
      alert("Смена успешно добавлена!");
    } else {
      Alert.alert("Успешно", "Смена успешно добавлена!");
    }

    router.back();
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "Не выбрана";
    return selectedDate.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#2563EB" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Выберите дату</Text>
          </View>

          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity style={styles.monthNavButton} onPress={prevMonth}>
                <ChevronLeft size={20} color="#2563EB" strokeWidth={2} />
              </TouchableOpacity>
              <Text style={styles.monthYearLabel}>{monthYearLabel}</Text>
              <TouchableOpacity style={styles.monthNavButton} onPress={nextMonth}>
                <ChevronRight size={20} color="#2563EB" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysRow}>
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                <Text key={day} style={styles.weekDayLabel}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarDays.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    day && isDateSelected(day) && styles.dayCellSelected,
                    day && isDatePast(day) && styles.dayCellPast,
                  ]}
                  onPress={() => handleDayPress(day)}
                  disabled={!day || isDatePast(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      day && isDateSelected(day) && styles.dayTextSelected,
                      day && isDatePast(day) && styles.dayTextPast,
                    ]}
                  >
                    {day || ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.selectedDateDisplay}>
            <Text style={styles.selectedDateLabel}>Выбранная дата:</Text>
            <Text style={styles.selectedDateValue}>{formatSelectedDate()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#2563EB" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Время смены</Text>
          </View>

          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerColumn}>
              <Text style={styles.timeLabel}>Начало</Text>
              <View style={styles.timeButtonsContainer}>
                <View style={styles.timeButtonGroup}>
                  <Text style={styles.timeGroupLabel}>Часы</Text>
                  <View style={styles.timeButtonsGrid}>
                    {HOURS.map((h) => (
                      <TouchableOpacity
                        key={`start-h-${h}`}
                        style={[
                          styles.timeButton,
                          startHour === h && styles.timeButtonSelected,
                        ]}
                        onPress={() => setStartHour(h)}
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            startHour === h && styles.timeButtonTextSelected,
                          ]}
                        >
                          {h}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.timeButtonGroup}>
                  <Text style={styles.timeGroupLabel}>Минуты</Text>
                  <View style={styles.minuteButtonsRow}>
                    {MINUTES.map((m) => (
                      <TouchableOpacity
                        key={`start-m-${m}`}
                        style={[
                          styles.minuteButton,
                          startMinute === m && styles.timeButtonSelected,
                        ]}
                        onPress={() => setStartMinute(m)}
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            startMinute === m && styles.timeButtonTextSelected,
                          ]}
                        >
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.timeDisplay}>{startHour}:{startMinute}</Text>
            </View>

            <View style={styles.timePickerDivider}>
              <Text style={styles.timePickerDividerText}>→</Text>
            </View>

            <View style={styles.timePickerColumn}>
              <Text style={styles.timeLabel}>Окончание</Text>
              <View style={styles.timeButtonsContainer}>
                <View style={styles.timeButtonGroup}>
                  <Text style={styles.timeGroupLabel}>Часы</Text>
                  <View style={styles.timeButtonsGrid}>
                    {HOURS.map((h) => (
                      <TouchableOpacity
                        key={`end-h-${h}`}
                        style={[
                          styles.timeButton,
                          endHour === h && styles.timeButtonSelected,
                        ]}
                        onPress={() => setEndHour(h)}
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            endHour === h && styles.timeButtonTextSelected,
                          ]}
                        >
                          {h}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.timeButtonGroup}>
                  <Text style={styles.timeGroupLabel}>Минуты</Text>
                  <View style={styles.minuteButtonsRow}>
                    {MINUTES.map((m) => (
                      <TouchableOpacity
                        key={`end-m-${m}`}
                        style={[
                          styles.minuteButton,
                          endMinute === m && styles.timeButtonSelected,
                        ]}
                        onPress={() => setEndMinute(m)}
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            endMinute === m && styles.timeButtonTextSelected,
                          ]}
                        >
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.timeDisplay}>{endHour}:{endMinute}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#2563EB" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Должность</Text>
          </View>

          <View style={styles.positionsGrid}>
            {EMPLOYEE_POSITIONS.map((pos) => (
              <TouchableOpacity
                key={pos}
                style={[
                  styles.positionButton,
                  position === pos && styles.positionButtonActive,
                ]}
                onPress={() => setPosition(pos)}
              >
                <Text
                  style={[
                    styles.positionButtonText,
                    position === pos && styles.positionButtonTextActive,
                  ]}
                >
                  {pos}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !selectedDate && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!selectedDate}
        >
          <Text style={styles.submitButtonText}>Добавить смену</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Отмена</Text>
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
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#111827",
  },
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  monthYearLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    textTransform: "capitalize" as const,
  },
  weekDaysRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayLabel: {
    flex: 1,
    textAlign: "center" as const,
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#6B7280",
    textTransform: "uppercase" as const,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%" as unknown as number,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: "#2563EB",
  },
  dayCellPast: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#111827",
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700" as const,
  },
  dayTextPast: {
    color: "#9CA3AF",
  },
  selectedDateDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  selectedDateLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  selectedDateValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#2563EB",
  },
  timePickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  timePickerColumn: {
    marginBottom: 20,
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 12,
    textAlign: "center" as const,
  },
  timeButtonsContainer: {
    gap: 12,
  },
  timeButtonGroup: {
    marginBottom: 8,
  },
  timeGroupLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#6B7280",
    marginBottom: 8,
  },
  timeButtonsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
  },
  timeButton: {
    width: 40,
    height: 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  timeButtonSelected: {
    backgroundColor: "#2563EB",
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
  },
  timeButtonTextSelected: {
    color: "#FFFFFF",
  },
  minuteButtonsRow: {
    flexDirection: "row" as const,
    gap: 8,
  },
  minuteButton: {
    flex: 1,
    height: 44,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  timeDisplay: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#2563EB",
    textAlign: "center" as const,
    marginTop: 12,
    backgroundColor: "#EFF6FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  timePickerDivider: {
    alignItems: "center" as const,
    paddingVertical: 8,
  },
  timePickerDividerText: {
    fontSize: 20,
    color: "#6B7280",
  },
  positionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  positionButton: {
    flexBasis: "30%" as const,
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  positionButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  positionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  positionButtonTextActive: {
    color: "#FFFFFF",
  },
  submitButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
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
});
