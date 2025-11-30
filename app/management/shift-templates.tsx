import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Repeat,
  User,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { Position, EMPLOYEE_POSITIONS, DayOfWeek } from "@/types";

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

const DAYS_OF_WEEK: { key: DayOfWeek; label: string; short: string }[] = [
  { key: "monday", label: "Понедельник", short: "Пн" },
  { key: "tuesday", label: "Вторник", short: "Вт" },
  { key: "wednesday", label: "Среда", short: "Ср" },
  { key: "thursday", label: "Четверг", short: "Чт" },
  { key: "friday", label: "Пятница", short: "Пт" },
  { key: "saturday", label: "Суббота", short: "Сб" },
  { key: "sunday", label: "Воскресенье", short: "Вс" },
];

export default function ShiftTemplatesScreen() {
  const { addShifts } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectingDate, setSelectingDate] = useState<"start" | "end">("start");
  const [startHour, setStartHour] = useState("20");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("08");
  const [endMinute, setEndMinute] = useState("00");
  const [position, setPosition] = useState<Position>("Кассир");
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ]);

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

  const isDateInRange = (day: number) => {
    if (!startDate || !endDate || !day) return false;
    const checkDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    return checkDate >= startDate && checkDate <= endDate;
  };

  const isStartDate = (day: number) => {
    if (!startDate || !day) return false;
    return (
      startDate.getDate() === day &&
      startDate.getMonth() === calendarMonth.getMonth() &&
      startDate.getFullYear() === calendarMonth.getFullYear()
    );
  };

  const isEndDate = (day: number) => {
    if (!endDate || !day) return false;
    return (
      endDate.getDate() === day &&
      endDate.getMonth() === calendarMonth.getMonth() &&
      endDate.getFullYear() === calendarMonth.getFullYear()
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
    const selectedDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    
    if (selectingDate === "start") {
      setStartDate(selectedDate);
      if (endDate && selectedDate > endDate) {
        setEndDate(null);
      }
      setSelectingDate("end");
    } else {
      if (startDate && selectedDate < startDate) {
        setStartDate(selectedDate);
        setEndDate(startDate);
      } else {
        setEndDate(selectedDate);
      }
      setSelectingDate("start");
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
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

  const formatDate = (date: Date | null) => {
    if (!date) return "Не выбрана";
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDayOfWeekKey = (date: Date): DayOfWeek => {
    const dayIndex = date.getDay();
    const keys: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return keys[dayIndex];
  };

  const generateShifts = () => {
    if (!startDate || !endDate) {
      const msg = "Выберите период";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }

    if (selectedDays.length === 0) {
      const msg = "Выберите хотя бы один день недели";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }

    const shifts: {
      id: string;
      date: string;
      startTime: string;
      endTime: string;
      position: Position;
      status: "Свободно";
    }[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayKey = getDayOfWeekKey(currentDate);
      
      if (selectedDays.includes(dayKey)) {
        shifts.push({
          id: `${Date.now()}-${shifts.length}`,
          date: currentDate.toISOString().split("T")[0],
          startTime: `${startHour}:${startMinute}`,
          endTime: `${endHour}:${endMinute}`,
          position,
          status: "Свободно" as const,
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (shifts.length === 0) {
      const msg = "Нет смен для создания в выбранный период";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }

    const confirmCreate = () => {
      addShifts(shifts);
      const successMsg = `Создано ${shifts.length} смен`;
      if (Platform.OS === "web") {
        alert(successMsg);
      } else {
        Alert.alert("Успешно", successMsg);
      }
      setShowForm(false);
      setStartDate(null);
      setEndDate(null);
      setSelectedDays(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]);
    };

    if (Platform.OS === "web") {
      if (confirm(`Создать ${shifts.length} смен?`)) {
        confirmCreate();
      }
    } else {
      Alert.alert(
        "Подтверждение",
        `Создать ${shifts.length} смен?\n\n${position}\n${startHour}:${startMinute} - ${endHour}:${endMinute}\nс ${formatDate(startDate)} по ${formatDate(endDate)}`,
        [
          { text: "Отмена", style: "cancel" },
          { text: "Создать", onPress: confirmCreate },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Repeat size={24} color="#2563EB" strokeWidth={2} />
          <Text style={styles.headerTitle}>Шаблоны смен</Text>
        </View>

        <Text style={styles.description}>
          Создавайте смены на определённый период. Например, ежедневные ночные смены для кассира на весь месяц.
        </Text>

        {!showForm ? (
          <TouchableOpacity style={styles.createButton} onPress={() => setShowForm(true)}>
            <Plus size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.createButtonText}>Создать шаблон</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color="#2563EB" strokeWidth={2} />
                <Text style={styles.sectionTitle}>Период</Text>
              </View>

              <View style={styles.dateRangeDisplay}>
                <TouchableOpacity 
                  style={[styles.dateButton, selectingDate === "start" && styles.dateButtonActive]}
                  onPress={() => setSelectingDate("start")}
                >
                  <Text style={styles.dateButtonLabel}>С</Text>
                  <Text style={[styles.dateButtonValue, selectingDate === "start" && styles.dateButtonValueActive]}>
                    {formatDate(startDate)}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.dateRangeSeparator}>→</Text>
                <TouchableOpacity 
                  style={[styles.dateButton, selectingDate === "end" && styles.dateButtonActive]}
                  onPress={() => setSelectingDate("end")}
                >
                  <Text style={styles.dateButtonLabel}>По</Text>
                  <Text style={[styles.dateButtonValue, selectingDate === "end" && styles.dateButtonValueActive]}>
                    {formatDate(endDate)}
                  </Text>
                </TouchableOpacity>
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
                    <Text key={day} style={styles.weekDayLabel}>{day}</Text>
                  ))}
                </View>

                <View style={styles.daysGrid}>
                  {calendarDays.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayCell,
                        day && isDateInRange(day) && styles.dayCellInRange,
                        day && isStartDate(day) && styles.dayCellStart,
                        day && isEndDate(day) && styles.dayCellEnd,
                        day && isDatePast(day) && styles.dayCellPast,
                      ]}
                      onPress={() => handleDayPress(day)}
                      disabled={!day || isDatePast(day)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          day && isDateInRange(day) && styles.dayTextInRange,
                          day && (isStartDate(day) || isEndDate(day)) && styles.dayTextSelected,
                          day && isDatePast(day) && styles.dayTextPast,
                        ]}
                      >
                        {day || ""}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color="#2563EB" strokeWidth={2} />
                <Text style={styles.sectionTitle}>Дни недели</Text>
              </View>

              <View style={styles.daysOfWeekGrid}>
                {DAYS_OF_WEEK.map((day) => (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayOfWeekButton,
                      selectedDays.includes(day.key) && styles.dayOfWeekButtonActive,
                    ]}
                    onPress={() => toggleDay(day.key)}
                  >
                    <Text
                      style={[
                        styles.dayOfWeekText,
                        selectedDays.includes(day.key) && styles.dayOfWeekTextActive,
                      ]}
                    >
                      {day.short}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock size={20} color="#2563EB" strokeWidth={2} />
                <Text style={styles.sectionTitle}>Время смены</Text>
              </View>

              <View style={styles.timeContainer}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeLabel}>Начало</Text>
                  <View style={styles.timeButtonsGrid}>
                    {HOURS.map((h) => (
                      <TouchableOpacity
                        key={`start-h-${h}`}
                        style={[styles.timeButton, startHour === h && styles.timeButtonSelected]}
                        onPress={() => setStartHour(h)}
                      >
                        <Text style={[styles.timeButtonText, startHour === h && styles.timeButtonTextSelected]}>
                          {h}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.minuteButtonsRow}>
                    {MINUTES.map((m) => (
                      <TouchableOpacity
                        key={`start-m-${m}`}
                        style={[styles.minuteButton, startMinute === m && styles.timeButtonSelected]}
                        onPress={() => setStartMinute(m)}
                      >
                        <Text style={[styles.timeButtonText, startMinute === m && styles.timeButtonTextSelected]}>
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.timeDisplay}>{startHour}:{startMinute}</Text>
                </View>

                <View style={styles.timeDivider}>
                  <Text style={styles.timeDividerText}>→</Text>
                </View>

                <View style={styles.timeColumn}>
                  <Text style={styles.timeLabel}>Окончание</Text>
                  <View style={styles.timeButtonsGrid}>
                    {HOURS.map((h) => (
                      <TouchableOpacity
                        key={`end-h-${h}`}
                        style={[styles.timeButton, endHour === h && styles.timeButtonSelected]}
                        onPress={() => setEndHour(h)}
                      >
                        <Text style={[styles.timeButtonText, endHour === h && styles.timeButtonTextSelected]}>
                          {h}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.minuteButtonsRow}>
                    {MINUTES.map((m) => (
                      <TouchableOpacity
                        key={`end-m-${m}`}
                        style={[styles.minuteButton, endMinute === m && styles.timeButtonSelected]}
                        onPress={() => setEndMinute(m)}
                      >
                        <Text style={[styles.timeButtonText, endMinute === m && styles.timeButtonTextSelected]}>
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
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
                    style={[styles.positionButton, position === pos && styles.positionButtonActive]}
                    onPress={() => setPosition(pos)}
                  >
                    <Text style={[styles.positionButtonText, position === pos && styles.positionButtonTextActive]}>
                      {pos}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.generateButton, (!startDate || !endDate) && styles.generateButtonDisabled]}
              onPress={generateShifts}
              disabled={!startDate || !endDate}
            >
              <Text style={styles.generateButtonText}>Создать смены</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowForm(false)}>
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#111827",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 20,
  },
  createButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  formContainer: {
    gap: 24,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#111827",
  },
  dateRangeDisplay: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 12,
  },
  dateButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  dateButtonActive: {
    borderColor: "#2563EB",
  },
  dateButtonLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  dateButtonValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
  },
  dateButtonValueActive: {
    color: "#2563EB",
  },
  dateRangeSeparator: {
    fontSize: 18,
    color: "#6B7280",
  },
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  calendarHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
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
    flexDirection: "row" as const,
    marginBottom: 8,
  },
  weekDayLabel: {
    flex: 1,
    textAlign: "center" as const,
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  daysGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
  },
  dayCell: {
    width: "14.28%" as unknown as number,
    aspectRatio: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: 8,
  },
  dayCellInRange: {
    backgroundColor: "#DBEAFE",
  },
  dayCellStart: {
    backgroundColor: "#2563EB",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  dayCellEnd: {
    backgroundColor: "#2563EB",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  dayCellPast: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#111827",
  },
  dayTextInRange: {
    color: "#1E40AF",
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700" as const,
  },
  dayTextPast: {
    color: "#9CA3AF",
  },
  daysOfWeekGrid: {
    flexDirection: "row" as const,
    gap: 8,
  },
  dayOfWeekButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center" as const,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  dayOfWeekButtonActive: {
    backgroundColor: "#2563EB",
  },
  dayOfWeekText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  dayOfWeekTextActive: {
    color: "#FFFFFF",
  },
  timeContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  timeColumn: {
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 10,
    textAlign: "center" as const,
  },
  timeButtonsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
    marginBottom: 12,
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
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#2563EB",
    textAlign: "center" as const,
    marginTop: 12,
    backgroundColor: "#EFF6FF",
    paddingVertical: 10,
    borderRadius: 8,
  },
  timeDivider: {
    alignItems: "center" as const,
    paddingVertical: 8,
  },
  timeDividerText: {
    fontSize: 18,
    color: "#6B7280",
  },
  positionsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  positionButton: {
    flexBasis: "30%" as const,
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center" as const,
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
  generateButton: {
    backgroundColor: "#15803D",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center" as const,
  },
  generateButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  generateButtonText: {
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
    alignItems: "center" as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
});
