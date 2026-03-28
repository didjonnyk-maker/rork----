import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/providers/AppProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Назад" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="management/index"
        options={{ title: "Управление", headerShown: false }}
      />
      <Stack.Screen
        name="management/add-shift"
        options={{ title: "Добавить смену", presentation: "modal" }}
      />
      <Stack.Screen
        name="employee/index"
        options={{ title: "Доступные смены", headerShown: false }}
      />
      <Stack.Screen
        name="employee/my-shifts"
        options={{ title: "Мои смены" }}
      />
      <Stack.Screen
        name="employee/report"
        options={{ title: "Заполнить отчёт", presentation: "modal" }}
      />
      <Stack.Screen
        name="operator/index"
        options={{ title: "Проверка отчётов", headerShown: false }}
      />
      <Stack.Screen
        name="operator/verify/[id]"
        options={{ title: "Проверка отчёта" }}
      />
      <Stack.Screen
        name="management/history"
        options={{ title: "История смен" }}
      />
      <Stack.Screen
        name="management/dashboard"
        options={{ title: "Мониторинг" }}
      />
      <Stack.Screen
        name="management/finance"
        options={{ title: "Финансы" }}
      />
      <Stack.Screen
        name="management/kpi"
        options={{ title: "KPI сотрудников" }}
      />
      <Stack.Screen
        name="management/tasks"
        options={{ title: "Задания" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <GestureHandlerRootView>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AppProvider>
    </QueryClientProvider>
  );
}
