import { useRouter, Stack } from "expo-router";
import {
  BarChart3,
  ClipboardList,
  DollarSign,
  Eye,
  FileText,
  LogOut,
  Users,
  Calendar,
  Store,
  Award,
  UserCog,
} from "lucide-react-native";
import { useState } from "react";
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
import { MARKETS, MarketId } from "@/types";

export default function FounderDashboardScreen() {
  const router = useRouter();
  const {
    currentUser,
    logout,
    users,
    shifts,
    tasks,
    bonuses,
  } = useApp();

  const [selectedMarketId, setSelectedMarketId] = useState<MarketId>("danek");

  const handleLogout = () => {
    const doLogout = () => {
      logout();
      router.replace("/" as never);
    };

    if (Platform.OS === "web") {
      if (confirm("Вы уверены, что хотите выйти?")) {
        doLogout();
      }
    } else {
      Alert.alert("Выход", "Вы уверены, что хотите выйти?", [
        { text: "Отмена", style: "cancel" },
        { text: "Выйти", onPress: doLogout, style: "destructive" },
      ]);
    }
  };

  const marketShifts = shifts.filter((s) => s.marketId === selectedMarketId);
  const marketTasks = tasks.filter((t) => t.marketId === selectedMarketId);

  const statsCards = [
    {
      title: "Сотрудники",
      value: users.filter(u => u.marketId === selectedMarketId).length,
      icon: <Users size={24} color="#2563EB" strokeWidth={2} />,
      color: "#EFF6FF",
    },
    {
      title: "Активные смены",
      value: marketShifts.filter((s) => s.status === "В работе").length,
      icon: <Calendar size={24} color="#059669" strokeWidth={2} />,
      color: "#ECFDF5",
    },
    {
      title: "Задачи",
      value: marketTasks.filter((t) => t.status !== "Проверено").length,
      icon: <ClipboardList size={24} color="#F59E0B" strokeWidth={2} />,
      color: "#FFFBEB",
    },
    {
      title: "Премии",
      value: bonuses.length,
      icon: <Award size={24} color="#8B5CF6" strokeWidth={2} />,
      color: "#F5F3FF",
    },
  ];

  const menuItems = [
    {
      title: "История смен",
      description: "Просмотр прошлых смен",
      icon: <FileText size={24} color="#059669" strokeWidth={2} />,
      onPress: () => router.push("/founder/history" as never),
    },
    {
      title: "Финансы",
      description: "Финансовые показатели",
      icon: <DollarSign size={24} color="#F59E0B" strokeWidth={2} />,
      onPress: () => router.push("/founder/finance" as never),
    },
    {
      title: "KPI сотрудников",
      description: "Показатели эффективности",
      icon: <BarChart3 size={24} color="#8B5CF6" strokeWidth={2} />,
      onPress: () => router.push("/founder/kpi" as never),
    },
    {
      title: "Задачи сотрудников",
      description: "Все задания сотрудников",
      icon: <ClipboardList size={24} color="#EC4899" strokeWidth={2} />,
      onPress: () => router.push("/founder/tasks" as never),
    },
    {
      title: "Задачи для руководства",
      description: "Задания для Директора и Администраторов",
      icon: <UserCog size={24} color="#DC2626" strokeWidth={2} />,
      onPress: () => router.push("/founder/management-tasks" as never),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Учредитель" }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Добро пожаловать</Text>
            <Text style={styles.userName}>{currentUser?.name}</Text>
            <View style={styles.roleBadge}>
              <Eye size={14} color="#8B5CF6" strokeWidth={2} />
              <Text style={styles.roleText}>Только просмотр</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#DC2626" strokeWidth={2} />
          </TouchableOpacity>
        </View>

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
                size={16}
                color={selectedMarketId === market.id ? "#2563EB" : "#6B7280"}
                strokeWidth={2}
              />
              <View>
                <Text
                  style={[
                    styles.marketTabText,
                    selectedMarketId === market.id && styles.marketTabTextActive,
                  ]}
                >
                  {market.name}
                </Text>
                <Text
                  style={[
                    styles.marketAddress,
                    selectedMarketId === market.id && styles.marketAddressActive,
                  ]}
                >
                  {market.address}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsGrid}>
          {statsCards.map((card, index) => (
            <View key={index} style={[styles.statsCard, { backgroundColor: card.color }]}>
              {card.icon}
              <Text style={styles.statsValue}>{card.value}</Text>
              <Text style={styles.statsLabel}>{card.title}</Text>
            </View>
          ))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Разделы</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>{item.icon}</View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
              </View>
              <Eye size={20} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#8B5CF6",
  },
  logoutButton: {
    backgroundColor: "#FEE2E2",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  marketSelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  marketTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
  },
  marketTabActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  marketTabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6B7280",
  },
  marketTabTextActive: {
    color: "#2563EB",
  },
  marketAddress: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  marketAddressActive: {
    color: "#60A5FA",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#111827",
  },
  statsLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  menuSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
});
