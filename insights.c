#include <stdio.h>
#include "insights.h"
#include "storage.h"

void generateInsights(void) {
    if (logCount == 0) {
        printf("\n[!] Log at least one day first.\n");
        return;
    }
    DayLog *day = askForDate("Enter date for insights");
    if (!day) return;

    if (day->taskCount > 0 && day->completedCount == day->taskCount) {
        printf("\n=== INSIGHTS FOR: %s ===\n", day->date);
        printf("  All tasks completed successfully! Excellent work.\n");
        return;
    }

    printf("\n=== PRODUCTIVITY INSIGHTS: %s ===\n", day->date);

    int best = getBestTimeSlot(day);
    if (best != -1)
        printf("  [TIP 1] Best time slot: %s → Schedule hard tasks here.\n", TIME_SLOTS[best]);

    int reason = getMostCommonFailureReason(day);
    if (reason != -1) {
        printf("  [TIP 2] Main issue: %s\n", FAILURE_REASONS[reason]);
        if (reason == 0) printf("          → Reduce phone distractions.\n");
        else if (reason == 1) printf("          → Improve sleep/energy management.\n");
    }

    float rate = (day->taskCount == 0) ? 0 : (float)day->completedCount / day->taskCount * 100;
    printf("  [TIP 3] Completion Rate: %.1f%%\n", rate);
}
