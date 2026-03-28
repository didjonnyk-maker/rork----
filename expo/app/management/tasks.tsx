import {
  Calendar,
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
  Store,
  Trash2,
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
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "@/providers/AppProvider";
import { EMPLOYEE_POSITIONS, Task, TaskStatus, MARKETS, MarketId } from "@/types";

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
  const { users, tasks, addTask, updateTask, rateTask, cancelTask, currentUser } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "all">("all");
  
  const [selectedMarketId, setSelectedMarketId] = useState<MarketId>(currentUser?.marketId || "danek");
  const isDirector = currentUser?.role === "Директор";

  const targetEmployees = useMemo(
    () => users.filter((u) => {
      if (u.marketId && u.marketId !== selectedMarketId) return false;
      return u.role === "Администратор" || u.role === "Операционист" || EMPLOYEE_POSITIONS.includes(u.position as typeof EMPLOYEE_POSITIONS[number]);
    }),
    [users, selectedMarketId]
  );

  const filteredTasks = useMemo(() => {
    // Filter by market first
    let result = tasks.filter(t => t.marketId === selectedMarketId);
    
    if (selectedStatus !== "all") {
      result = result.filter((t) => t.status === selectedStatus);
    }
    
    // Director sees: All tasks for market (including Admin's).
    // Admin sees: All tasks EXCEPT those assigned to Director.
    if (currentUser?.role === "Администратор") {
      result = result.filter(t => {
         const assignee = users.find(u => u.id === t.assignedTo);
         if (assignee?.role === "Директор") return false;
         
         const takenBy = users.find(u => u.id === t.takenBy);
         if (takenBy?.role === "Директор") return false;
         
         return true;
      });
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tasks, selectedStatus, selectedMarketId, currentUser, users]);

  const pendingReviewCount = useMemo(
    () => tasks.filter((t) => (t.status === "Выполнено" || t.status === "На модерации") && t.marketId === selectedMarketId).length,
    [tasks, selectedMarketId]
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
      marketId: selectedMarketId,
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

  const [schedulingTaskId, setSchedulingTaskId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");

  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [completionText, setCompletionText] = useState("");

  const [commentingTaskId, setCommentingTaskId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

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

  const handleCancelTask = (taskId: string) => {
    const msg = "Вы уверены, что хотите отозвать это задание?";
    if (Platform.OS === "web") {
      if (confirm(msg)) {
        cancelTask(taskId);
        alert("Задание отозвано");
      }
    } else {
      Alert.alert(
        "Отозвать задание",
        msg,
        [
          { text: "Отмена", style: "cancel" },
          { 
            text: "Отозвать", 
            style: "destructive",
            onPress: () => {
              cancelTask(taskId);
              Alert.alert("Успешно", "Задание отозвано");
            }
          },
        ]
      );
    }
  };

  const handleAcceptTask = (taskId: string) => {
    if (!currentUser) return;
    updateTask(taskId, { status: "В работе", takenBy: currentUser.id });
    const msg = "Задание принято в работу";
    if (Platform.OS === "web") {
      alert(msg);
    } else {
      Alert.alert("Успешно", msg);
    }
  };

  const handleSchedule = (taskId: string) => {
    if (!scheduleDate.trim()) {
      const msg = "Укажите дату исполнения";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }
    updateTask(taskId, { scheduledDate: scheduleDate.trim() });
    setSchedulingTaskId(null);
    setScheduleDate("");
    const msg = "Дата исполнения запланирована";
    if (Platform.OS === "web") {
      alert(msg);
    } else {
      Alert.alert("Успешно", msg);
    }
  };

  const handleComplete = (taskId: string) => {
    if (!completionText.trim()) {
      const msg = "Укажите результат выполнения";
      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Ошибка", msg);
      }
      return;
    }
    updateTask(taskId, { 
      status: "Выполнено", 
      resultText: completionText.trim(),
      completedAt: new Date().toISOString()
    });
    setCompletingTaskId(null);
    setCompletionText("");
    const msg = "Задание выполнено";
    if (Platform.OS === "web") {
      alert(msg);
    } else {
      Alert.alert("Успешно", msg);
    }
  };

  const handleAddComment = (taskId: string) => {
    if (!commentText.trim()) {
      return;
    }
    updateTask(taskId, { directorComment: commentText.trim() });
    setCommentingTaskId(null);
    setCommentText("");
    const msg = "Комментарий добавлен";
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
    if (task.cancelled) return null;
    
    const config = STATUS_CONFIG[task.status];
    const isCompleted = task.status === "Выполнено" || task.status === "На модерации";
    const isInProgress = task.status === "В работе";
    const canModerate = isCompleted && (currentUser?.position === "Администратор" || currentUser?.position === "Директор");
    const canCancel = task.createdBy === currentUser?.id && task.status !== "Проверено";

    const creator = users.find(u => u.id === task.createdBy);
    const isFounderTask = creator?.role === "Учредитель";
    const isDirectorTask = currentUser?.position === "Директор" && (task.assignedTo === currentUser.id || (!task.assignedTo && task.status === "Доступно") || task.takenBy === currentUser.id);
    
    // Director actions on Founder tasks
    const canAccept = isDirectorTask && isFounderTask && (task.status === "Новое" || task.status === "Доступно");
    const canComplete = isDirectorTask && task.status === "В работе";
    const canComment = isDirectorTask && isFounderTask;
    const canSchedule = isDirectorTask && isFounderTask && !task.scheduledDate;

    return (
      <View key={task.id} style={[
        styles.taskCard, 
        isCompleted && styles.taskCardHighlight,
        isInProgress && styles.taskCardInProgress
      ]}>
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

        {task.scheduledDate && (
           <View style={styles.scheduledBadge}>
             <Calendar size={12} color="#2563EB" strokeWidth={2} />
             <Text style={styles.scheduledText}>Запланировано на: {task.scheduledDate}</Text>
           </View>
        )}

        {task.resultText && (
          <View style={styles.resultSection}>
            <Text style={styles.resultLabel}>Результат:</Text>
            <Text style={styles.resultText}>{task.resultText}</Text>
          </View>
        )}

        {task.directorComment && (
          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>Комментарий Директора:</Text>
            <Text style={styles.commentText}>{task.directorComment}</Text>
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

        {/* Director Actions */}
        <View style={styles.directorActions}>
            {canAccept && (
              <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => handleAcceptTask(task.id)}>
                <Text style={styles.actionButtonText}>Принять</Text>
              </TouchableOpacity>
            )}

            {canComplete && completingTaskId !== task.id && (
               <TouchableOpacity style={[styles.actionButton, styles.completeButton]} onPress={() => setCompletingTaskId(task.id)}>
                 <Text style={styles.actionButtonText}>Завершить</Text>
               </TouchableOpacity>
            )}

            {canComment && commentingTaskId !== task.id && !task.directorComment && (
              <TouchableOpacity style={[styles.actionButton, styles.commentButton]} onPress={() => setCommentingTaskId(task.id)}>
                 <Text style={[styles.actionButtonText, {color: "#374151"}]}>Комментарий</Text>
               </TouchableOpacity>
            )}

             {canSchedule && schedulingTaskId !== task.id && (
              <TouchableOpacity style={[styles.actionButton, styles.scheduleButton]} onPress={() => setSchedulingTaskId(task.id)}>
                 <Text style={[styles.actionButtonText, {color: "#2563EB"}]}>Запланировать</Text>
               </TouchableOpacity>
            )}
        </View>

        {schedulingTaskId === task.id && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Дата исполнения (ДД.ММ.ГГГГ):</Text>
             <TextInput
              style={styles.inputField}
              value={scheduleDate}
              onChangeText={setScheduleDate}
              placeholder="Например: 25.12.2023"
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.inputActions}>
              <TouchableOpacity style={[styles.inputButton, styles.confirmButton]} onPress={() => handleSchedule(task.id)}>
                <Text style={styles.inputButtonText}>Сохранить</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.inputButton, styles.cancelButton]} onPress={() => { setSchedulingTaskId(null); setScheduleDate(""); }}>
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {completingTaskId === task.id && (
           <View style={styles.inputContainer}>
             <Text style={styles.inputLabel}>Результат выполнения:</Text>
             <TextInput
               style={[styles.inputField, styles.textArea]}
               value={completionText}
               onChangeText={setCompletionText}
               placeholder="Опишите результат..."
               placeholderTextColor="#9CA3AF"
               multiline
             />
             <View style={styles.inputActions}>
               <TouchableOpacity style={[styles.inputButton, styles.confirmButton]} onPress={() => handleComplete(task.id)}>
                 <Text style={styles.inputButtonText}>Отправить</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.inputButton, styles.cancelButton]} onPress={() => { setCompletingTaskId(null); setCompletionText(""); }}>
                 <Text style={styles.cancelButtonText}>Отмена</Text>
               </TouchableOpacity>
             </View>
           </View>
        )}

        {commentingTaskId === task.id && (
           <View style={styles.inputContainer}>
             <Text style={styles.inputLabel}>Комментарий:</Text>
             <TextInput
               style={[styles.inputField, styles.textArea]}
               value={commentText}
               onChangeText={setCommentText}
               placeholder="Ваш комментарий..."
               placeholderTextColor="#9CA3AF"
               multiline
             />
             <View style={styles.inputActions}>
               <TouchableOpacity style={[styles.inputButton, styles.confirmButton]} onPress={() => handleAddComment(task.id)}>
                 <Text style={styles.inputButtonText}>Сохранить</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.inputButton, styles.cancelButton]} onPress={() => { setCommentingTaskId(null); setCommentText(""); }}>
                 <Text style={styles.cancelButtonText}>Отмена</Text>
               </TouchableOpacity>
             </View>
           </View>
        )}


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
          <View style={styles.ratingSheet}>
            <Text style={styles.ratingTitle}>Оцените качество работы</Text>
            <Text style={styles.ratingSubtitle}>Как сотрудник справился с задачей?</Text>
            
            <View style={styles.starsContainer}>
              {([1, 2, 3, 4, 5] as const).map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={styles.starButton}
                  onPress={() => handleRate(task.id, rating)}
                  activeOpacity={0.7}
                >
                  <Star 
                    size={32} 
                    color="#F59E0B" 
                    fill="#F59E0B" 
                    strokeWidth={2} 
                  />
                  <Text style={styles.starLabel}>{rating}</Text>
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

        {canCancel && (
          <TouchableOpacity
            style={styles.cancelTaskButton}
            onPress={() => handleCancelTask(task.id)}
          >
            <Trash2 size={16} color="#DC2626" strokeWidth={2} />
            <Text style={styles.cancelTaskButtonText}>Отозвать задание</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
      <View style={styles.header}>
        {isDirector && (
            <View style={styles.marketSelector}>
                {MARKETS.map((market) => (
                <TouchableOpacity
                    key={market.id}
                    style={[
                    styles.marketTab,
                    selectedMarketId === market.id && styles.marketTabActive,
                    ]}
                    onPress={() => setSelectedMarketId(market.id)}
                >
                    <Store
                    size={14}
                    color={selectedMarketId === market.id ? "#2563EB" : "#6B7280"}
                    />
                    <Text
                    style={[
                        styles.marketTabText,
                        selectedMarketId === market.id && styles.marketTabTextActive,
                    ]}
                    >
                    {market.name}
                    </Text>
                </TouchableOpacity>
                ))}
            </View>
        )}
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
                  {targetEmployees.map((emp) => (
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
                        {emp.name} ({emp.role})
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
      </KeyboardAvoidingView>
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
  marketSelector: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 2,
    marginBottom: 12,
  },
  marketTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  marketTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  marketTabText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  marketTabTextActive: {
    color: "#2563EB",
    fontWeight: "600" as const,
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
  taskCardInProgress: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
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
  ratingSheet: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    alignItems: "center",
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  ratingSubtitle: {
    fontSize: 13,
    color: "#B45309",
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  starButton: {
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 48,
  },
  starLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D97706",
  },
  cancelRatingButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelRatingText: {
    fontSize: 14,
    color: "#92400E",
    fontWeight: "500",
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
  cancelTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  cancelTaskButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#DC2626",
  },
  directorActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  acceptButton: {
    backgroundColor: "#15803D",
  },
  completeButton: {
    backgroundColor: "#16A34A",
  },
  commentButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  scheduleButton: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  inputContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#111827",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  inputButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#2563EB",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  inputButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  scheduledBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  scheduledText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2563EB",
  },
  commentSection: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 13,
    color: "#374151",
  },
});
