#include <stdio.h>
#include "knapsack.h"
#include "storage.h"

void selectOptimalTasks(void) {
    if (logCount == 0) {
        printf("\n[!] No data available.\n");
        return;
    }
    DayLog *day = askForDate("Enter date for task optimization");
    if (!day) return;

    Task pending[MAX_TASKS];
    int n = 0;
    for (int i = 0; i < day->taskCount; i++) {
        if (day->tasks[i].status == STATUS_PENDING)
            pending[n++] = day->tasks[i];
    }
    if (n == 0) {
        printf("\n  No pending tasks.\n");
        return;
    }

    int capacity;
    printf("\n  Available minutes today (1-%d): ", MAX_CAPACITY);
    scanf("%d", &capacity);
    if (capacity < 1) capacity = 1;
    if (capacity > MAX_CAPACITY) capacity = MAX_CAPACITY;

    int dp[MAX_TASKS + 1][MAX_CAPACITY + 1] = {0};

    for (int i = 1; i <= n; i++) {
        int w = pending[i-1].minutesRequired;
        int v = pending[i-1].importance;
        for (int c = 0; c <= capacity; c++) {
            dp[i][c] = dp[i-1][c];
            if (w <= c && dp[i-1][c - w] + v > dp[i][c])
                dp[i][c] = dp[i-1][c - w] + v;
        }
    }

    printf("\n=== OPTIMAL TASK SELECTION: %s ===\n", day->date);
    printf("  Available: %d minutes | Max Importance: %d\n", capacity, dp[n][capacity]);

    /* Simple traceback print (top importance tasks) */
    printf("  Recommended Tasks:\n");
    int c = capacity;
    for (int i = n; i >= 1; i--) {
        if (dp[i][c] != dp[i-1][c]) {
            printf("    + %s (%d min, Imp:%d)\n",
                   pending[i-1].name, pending[i-1].minutesRequired, pending[i-1].importance);
            c -= pending[i-1].minutesRequired;
        }
    }
}
