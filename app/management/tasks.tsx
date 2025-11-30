import {
  CheckCircle,
  Circle,
  Clock,
  Eye,
  Plus,
  RefreshCcw,
  Send,
  Star,
  User as UserIcon,
  XCircle,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
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
import { EMPLOYEE_POSITIONS, Task, TaskStatus } from "@/types";

const STATUS_CONFIG: Record<TaskStatus, { color: string; bgColor: string; icon: React.ReactNode }> = {
  "Новое": { color: "#6B7280", bgColor: "#F3F4F6", icon: <Circle size={14} color="#6B7280" strokeWidth={2} /> },
  "Доступно": { color: "#8B5CF6", bgColor: "#EDE9FE", icon: <Circle size={14} color="#8B5CF6" strokeWidth={2} /> },
  "В работе": { color: "#2563EB", bgColor: "#DBEAFE", icon: <Clock size={14} color="#2563EB" strokeWidth={2} /> },
  "Выполнено": { color: "#F59E0B", bgColor: "#FEF3C7", icon: <CheckCircle size={14} color="#F59E0B" strokeWidth={2} /> },
  "На модерации": { color: "#7C3AED", bgColor: "#EDE9FE", icon: <Eye size={14} color="#7C3AED" strokeWidth={2} /> },
  "Проверено": { color: "#15803D", bgColor: "#DCFCE7", icon: <CheckCircle size={14} color="#15803D" strokeWidth={2} /> },
  "Возвращено": { color: "#DC2626", bgColor: "#FEE2E2", icon: <RefreshCcw size={14} color="#DC2626" strokeWidth={2} /> },
};

export default function TasksScreen() {
  const { users, tasks, addTask, updateTask, rateTask, currentUser } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "all">("all");

  const employees = useMemo(
    () => users.filter((u) => EMPLOYEE_POSITIONS.includes(u.position as typeof EMPLOYEE_POSITIONS[number])),
    [users]
  );

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (selectedStatus !== "all") {
      result = result.filter((t) => t.status === selectedStatus);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tasks, selectedStatus]);

  const pendingReviewCount = useMemo(
    () => tasks.filter((t) => t.status === "Выполнено" || t.status === "На модерации").length,
    [tasks]
  );

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      const msg = "Заполните название задания";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
      assignedTo: newTaskAssignee || undefined,
      createdBy: currentUser?.id || "",
      status: newTaskAssignee ? "Новое" : "Доступно",
      createdAt: new Date().toISOString(),
    };

    addTask(task);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskAssignee("");
    setShowAddForm(false);

    const successMsg = "Задание создано!";
    if (Platform.OS === "web") {
      alert(successMsg);
    } else {
      Alert.alert("Успешно", successMsg);
    }
  };

  const [ratingTaskId, setRatingTaskId] = useState<string | null>(null);

  const handleRate = (taskId: string, rating: 1 | 2 | 3 | 4 | 5) => {
    if (!currentUser) return;
    rateTask(taskId, rating, currentUser.name);
    setRatingTaskId(null);
    const msg = `Задание оценено на ${rating} звезд`;
    if (Platform.OS === "web") {
      alert(msg);
    } else {
      Alert.alert("Успешно", msg);
    }
  };

  const [returnComment, setReturnComment] = useState("");
  const [returningTaskId, setReturningTaskId] = useState<string | null>(null);

  const handleReturn = (taskId: string) => {
    if (!returnComment.trim()) {
      const msg = "Укажите комментарий для возврата";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }
    updateTask(taskId, { status: "Возвращено", returnComment: returnComment.trim() });
    setReturnComment("");
    setReturningTaskId(null);
    const msg = "Задание возвращено на доработку";
    if (Platform.OS === "web") {
      alert(msg);
    } else {
      Alert.alert("Успешно", msg);
    }
  };

  const getAssigneeName = (assigneeId: string | undefined) => {
    if (!assigneeId) return "Не назначен";
    const user = users.find((u) => u.id === assigneeId);
    return user?.name || "Неизвестно";
  };

  const getTakenByName = (takenById: string | undefined) => {
    if (!takenById) return null;
    const user = users.find((u) => u.id === takenById);
    return user?.name || "Неизвестно";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderTaskCard = (task: Task) => {
    const config = STATUS_CONFIG[task.status];
    const isCompleted = task.status === "Выполнено" || task.status === "На модерации";
    const canModerate = isCompleted && (currentUser?.position === "Администратор" || currentUser?.position === "Директор");

    return (
      <View key={task.id} style={[styles.taskCard, isCompleted && styles.taskCardHighlight]}>
        <View style={styles.taskHeader}>
          <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
            {config.icon}
            <Text style={[styles.statusText, { color: config.color }]}>{task.status}</Text>
          </View>
          <Text style={styles.taskDate}>{formatDate(task.createdAt)}</Text>
        </View>

        <Text style={styles.taskTitle}>{task.title}</Text>
        {task.description && (
          <Text style={styles.taskDescription}>{task.description}</Text>
        )}

        {task.resultText && (
          <View style={styles.resultSection}>
            <Text style={styles.resultLabel}>Результат:</Text>
            <Text style={styles.resultText}>{task.resultText}</Text>
          </View>
        )}

        {task.returnComment && task.status === "Возвращено" && (
          <View style={styles.returnCommentSection}>
            <Text style={styles.returnCommentLabel}>Причина возврата:</Text>
            <Text style={styles.returnCommentText}>{task.returnComment}</Text>
          </View>
        )}

        <View style={styles.taskFooter}>
          <View style={styles.assigneeRow}>
            <UserIcon size={14} color="#6B7280" strokeWidth={2} />
            <Text style={styles.assigneeText}>
              {task.takenBy ? getTakenByName(task.takenBy) : getAssigneeName(task.assignedTo)}
            </Text>
          </View>
          {task.rating && (
            <View style={styles.ratingDisplay}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  color={star <= task.rating! ? "#F59E0B" : "#D1D5DB"}
                  fill={star <= task.rating! ? "#F59E0B" : "transparent"}
                  strokeWidth={2}
                />
              ))}
            </View>
          )}
        </View>

        {canModerate && ratingTaskId !== task.id && returningTaskId !== task.id && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => setRatingTaskId(task.id)}
            >
              <Star size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.actionButtonText}>Оценить</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.returnButton]}
              onPress={() => setReturningTaskId(task.id)}
            >
              <RefreshCcw size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.actionButtonText}>Вернуть</Text>
            </TouchableOpacity>
          </View>
        )}

        {returningTaskId === task.id && (
          <View style={styles.returnContainer}>
            <Text style={styles.returnTitle}>Укажите причину возврата:</Text>
            <TextInput
              style={styles.returnInput}
              value={returnComment}
              onChangeText={setReturnComment}
              placeholder="Комментарий для сотрудника..."
              placeholderTextColor="#9CA3AF"
              multiline
            />
            <View style={styles.returnActions}>
              <TouchableOpacity
                style={[styles.returnActionButton, styles.returnConfirmButton]}
                onPress={() => handleReturn(task.id)}
              >
                <Text style={styles.returnActionText}>Вернуть</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.returnActionButton, styles.returnCancelButton]}
                onPress={() => { setReturningTaskId(null); setReturnComment(""); }}
              >
                <Text style={styles.returnCancelText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {ratingTaskId === task.id && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>Оцените выполнение (1-5):</Text>
            <View style={styles.ratingButtons}>
              {([1, 2, 3, 4, 5] as const).map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={styles.ratingStarButton}
                  onPress={() => handleRate(task.id, rating)}
                >
                  <View style={styles.starRow}>
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} size={18} color="#F59E0B" fill="#F59E0B" strokeWidth={2} />
                    ))}
                  </View>
                  <Text style={styles.ratingButtonText}>{rating}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.cancelRatingButton}
              onPress={() => setRatingTaskId(null)}
            >
              <Text style={styles.cancelRatingText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Задания</Text>
          {pendingReviewCount > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingReviewCount} на проверке</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.addTaskButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? (
            <XCircle size={18} color="#FFFFFF" strokeWidth={2} />
          ) : (
            <Plus size={18} color="#FFFFFF" strokeWidth={2} />
          )}
          <Text style={styles.addTaskButtonText}>
            {showAddForm ? "Отмена" : "Новое задание"}
          </Text>
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={styles.addFormContainer}>
          <View style={styles.addForm}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Название</Text>
              <TextInput
                style={styles.formInput}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                placeholder="Введите название задания"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Описание (опционально)</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                placeholder="Введите описание задания"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Исполнитель (опционально)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.assigneeChips}>
                  <TouchableOpacity
                    style={[
                      styles.assigneeChip,
                      !newTaskAssignee && styles.assigneeChipActive,
                    ]}
                    onPress={() => setNewTaskAssignee("")}
                  >
                    <Text
                      style={[
                        styles.assigneeChipText,
                        !newTaskAssignee && styles.assigneeChipTextActive,
                      ]}
                    >
                      Доступно всем
                    </Text>
                  </TouchableOpacity>
                  {employees.map((emp) => (
                    <TouchableOpacity
                      key={emp.id}
                      style={[
                        styles.assigneeChip,
                        newTaskAssignee === emp.id && styles.assigneeChipActive,
                      ]}
                      onPress={() => setNewTaskAssignee(emp.id)}
                    >
                      <Text
                        style={[
                          styles.assigneeChipText,
                          newTaskAssignee === emp.id && styles.assigneeChipTextActive,
                        ]}
                      >
                        {emp.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                !newTaskTitle.trim() && styles.submitButtonDisabled,
              ]}
              onPress={handleAddTask}
              disabled={!newTaskTitle.trim()}
            >
              <Send size={18} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.submitButtonText}>Создать задание</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterChips}>
            <TouchableOpacity
              style={[styles.filterChip, selectedStatus === "all" && styles.filterChipActive]}
              onPress={() => setSelectedStatus("all")}
            >
              <Text style={[styles.filterChipText, selectedStatus === "all" && styles.filterChipTextActive]}>
                Все ({tasks.length})
              </Text>
            </TouchableOpacity>
            {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => {
              const count = tasks.filter((t) => t.status === status).length;
              const config = STATUS_CONFIG[status];
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    selectedStatus === status && styles.filterChipActive,
                    { borderColor: config.color },
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedStatus === status && styles.filterChipTextActive,
                      selectedStatus !== status && { color: config.color },
                    ]}
                  >
                    {status} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredTasks.map((task) => renderTaskCard(task))}

        {filteredTasks.length === 0 && (
          <View style={styles.emptyState}>
            <CheckCircle size={48} color="#D1D5DB" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Нет заданий</Text>
            <Text style={styles.emptyText}>
              {selectedStatus === "all"
                ? "Создайте первое задание"
                : `Нет заданий со статусом "${selectedStatus}"`}
            </Text>
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
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  addTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 12,
  },
  addTaskButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  addFormContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  addForm: {
    padding: 16,
    gap: 16,
  },
  formField: {
    gap: 8,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#374151",
  },
  formInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  formTextarea: {
    minHeight: 80,
    textAlignVertical: "top" as const,
  },
  assigneeChips: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  assigneeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  assigneeChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  assigneeChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#374151",
  },
  assigneeChipTextActive: {
    color: "#FFFFFF",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#15803D",
    borderRadius: 10,
    paddingVertical: 14,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  filterContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterChips: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  taskCardHighlight: {
    borderColor: "#FDE68A",
    backgroundColor: "#FFFBEB",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
  taskDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
  },
  taskFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  assigneeText: {
    fontSize: 13,
    color: "#374151",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: "#15803D",
  },
  returnButton: {
    backgroundColor: "#DC2626",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#6B7280",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center" as const,
  },
  ratingContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  ratingTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 12,
  },
  ratingButtons: {
    flexDirection: "row" as const,
    gap: 12,
  },
  ratingButton: {
    flex: 1,
    alignItems: "center" as const,
    paddingVertical: 12,
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  twoStars: {
    flexDirection: "row" as const,
    gap: 4,
  },
  ratingButtonText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#92400E",
    marginTop: 4,
  },
  cancelRatingButton: {
    alignItems: "center" as const,
    paddingVertical: 10,
    marginTop: 8,
  },
  cancelRatingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  ratingDisplay: {
    flexDirection: "row" as const,
    gap: 2,
  },
  resultSection: {
    backgroundColor: "#F0FDF4",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#15803D",
    marginBottom: 4,
  },
  resultText: {
    fontSize: 13,
    color: "#374151",
  },
  returnCommentSection: {
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  returnCommentLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#DC2626",
    marginBottom: 4,
  },
  returnCommentText: {
    fontSize: 13,
    color: "#374151",
  },
  returnContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  returnTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 10,
  },
  returnInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    minHeight: 60,
    textAlignVertical: "top" as const,
  },
  returnActions: {
    flexDirection: "row" as const,
    gap: 10,
    marginTop: 10,
  },
  returnActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center" as const,
  },
  returnConfirmButton: {
    backgroundColor: "#DC2626",
  },
  returnCancelButton: {
    backgroundColor: "#F3F4F6",
  },
  returnActionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  returnCancelText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  ratingStarButton: {
    alignItems: "center" as const,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
    minWidth: 50,
  },
  starRow: {
    flexDirection: "row" as const,
    gap: 1,
  },
});
