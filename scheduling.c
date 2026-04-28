#include <stdio.h>
#include <string.h>
#include "scheduling.h"
#include "storage.h"
#include "sort.h"

void generateSchedule(void) {
    if (logCount == 0) {
        printf("\n[!] No data available.\n");
        return;
    }
    DayLog *day = askForDate("Enter date to generate schedule");
    if (!day) return;

    Task pending[MAX_TASKS];
    int pCount = 0;
    for (int i = 0; i < day->taskCount; i++) {
        if (day->tasks[i].status == STATUS_PENDING)
            pending[pCount++] = day->tasks[i];
    }

    if (pCount == 0) {
        printf("\n  No pending tasks to schedule.\n");
        return;
    }

    sortTasksByDifficulty(pending, pCount, 0);  /* hard first */
    int bestSlot = getBestTimeSlot(day);

    printf("\n=== SMART SCHEDULE FOR: %s ===\n", day->date);
    printf("  Best Slot: %s\n", (bestSlot != -1) ? TIME_SLOTS[bestSlot] : "Not determined");
    printf("  Pending Tasks to Reschedule (%d):\n", pCount);

    int split = (pCount + 1) / 2;
    printf("\n  Hard Tasks -> Best Slot:\n");
    for (int i = 0; i < split; i++)
        printf("    * %s (%d min)\n", pending[i].name, pending[i].minutesRequired);

    printf("\n  Remaining Tasks:\n");
    for (int i = split; i < pCount; i++)
        printf("    * %s (%d min)\n", pending[i].name, pending[i].minutesRequired);
}
